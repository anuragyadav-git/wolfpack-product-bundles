use super::schema;
use crate::candidates::{
    build_automatic_addon_candidates, build_subscription_candidates, DiscountScope,
};
use crate::published_policy::{pricing_mode, PricingMode};
use crate::runtime_token::{country_is_eligible, verified_payload_bytes};
use chrono::{Datelike, NaiveDate, NaiveTime};
use serde::Deserialize;
use shopify_function::prelude::*;
use shopify_function::Result;

#[derive(Clone, Copy)]
struct ScheduledScope<'a> {
    shop: &'a str,
    bundle_id: &'a str,
    revision: &'a str,
}

impl DiscountScope for ScheduledScope<'_> {
    fn allows(
        self,
        policies: Option<&shopify_function::wasm_api::Value>,
        shop: &str,
        bundle_id: &str,
        revision: &str,
    ) -> bool {
        shop == self.shop
            && bundle_id == self.bundle_id
            && revision == self.revision
            && pricing_mode(policies, bundle_id, revision) == Some(PricingMode::Scheduled)
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ScheduledOffer {
    version: u8,
    shop: String,
    bundle_id: String,
    parent_variant_id: String,
    revision: String,
    country_rule: String,
    schedule_mode: String,
    window_start: String,
    window_end: String,
    recurrence_frequency: Option<String>,
    recurrence_anchor_date: Option<String>,
    recurrence_termination: Option<String>,
    recurrence_ends_on: Option<String>,
    recurrence_run_count: Option<u32>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SignedParent {
    version: u8,
    kind: Option<String>,
    shop: String,
    bundle_id: String,
    parent_variant_id: String,
    revision: String,
    transformed_pricing: PricingReceipt,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PricingReceipt {
    offer_group_id: String,
    quantity: i64,
    unit_price: String,
    discount_percentage: f64,
}

fn parse_date(value: &str) -> Option<NaiveDate> {
    let date = NaiveDate::parse_from_str(value, "%Y-%m-%d").ok()?;
    (date.format("%Y-%m-%d").to_string() == value).then_some(date)
}

// Skip months without the anchor day, matching the saved offer policy.
// Gregorian dates repeat every 400 years; work is bounded even for distant dates.
fn monthly_occurrence(anchor: NaiveDate, date: NaiveDate) -> i64 {
    let months = i64::from(date.year() - anchor.year()) * 12 + i64::from(date.month())
        - i64::from(anchor.month())
        + 1;
    let cycles = months / 4800;
    let valid_per_cycle = match anchor.day() {
        1..=28 => 4800,
        29 => 4497,
        30 => 4400,
        _ => 2800,
    };
    let first = i64::from(anchor.year()) * 12 + i64::from(anchor.month0()) + cycles * 4800;
    let mut count = cycles * valid_per_cycle;
    for offset in 0..(months % 4800) {
        let serial = first + offset;
        if NaiveDate::from_ymd_opt(
            serial.div_euclid(12) as i32,
            serial.rem_euclid(12) as u32 + 1,
            anchor.day(),
        )
        .is_some()
        {
            count += 1;
        }
    }
    count
}

fn recurring_date_is_eligible(offer: &ScheduledOffer, date: &str) -> bool {
    let Some(date) = parse_date(date) else {
        return false;
    };
    let Some(anchor) = offer.recurrence_anchor_date.as_deref().and_then(parse_date) else {
        return false;
    };
    if date < anchor {
        return false;
    }
    let occurrence = match offer.recurrence_frequency.as_deref() {
        Some("weekly") => {
            let days = (date - anchor).num_days();
            if days % 7 != 0 {
                return false;
            }
            days / 7 + 1
        }
        Some("monthly") if date.day() == anchor.day() => monthly_occurrence(anchor, date),
        _ => return false,
    };
    match offer.recurrence_termination.as_deref() {
        Some("never") => true,
        Some("on_date") => offer
            .recurrence_ends_on
            .as_deref()
            .and_then(parse_date)
            .map(|end| end >= anchor && date <= end)
            .unwrap_or(false),
        Some("after_runs") => offer
            .recurrence_run_count
            .map(|count| count > 0 && occurrence <= i64::from(count))
            .unwrap_or(false),
        _ => false,
    }
}

fn candidates(
    input: &schema::cart_lines_discounts_generate_run::Input,
) -> Option<Vec<schema::ProductDiscountCandidate>> {
    if !input
        .discount()
        .discount_classes()
        .contains(&schema::DiscountClass::Product)
    {
        return None;
    }
    // Subscription and addon owners use their existing signed component validation;
    // a parent receipt is exclusively for the one-time purchase bundle role.
    let role = input.discount().discount_role()?.value();
    if role != "scheduled_initial" && role != "scheduled_recurring" {
        return None;
    }
    let secret = input.discount().runtime_token_secret()?.value();
    if secret.is_empty() {
        return None;
    }
    let offer: ScheduledOffer =
        serde_json::from_str(input.discount().scheduled_offer()?.value()).ok()?;
    if offer.version != 1
        || offer.shop.is_empty()
        || offer.bundle_id.is_empty()
        || offer.revision.is_empty()
    {
        return None;
    }
    if pricing_mode(
        input.shop().ppb_policy_revisions().map(|m| m.value()),
        &offer.bundle_id,
        &offer.revision,
    ) != Some(PricingMode::Scheduled)
        || !country_is_eligible(
            &offer.country_rule,
            &input.localization().country().iso_code().to_string(),
        )
    {
        return None;
    }
    match offer.schedule_mode.as_str() {
        // Shopify owns the absolute startsAt/endsAt boundary on the discount resource.
        "one_time" => {}
        "recurring" => {
            let start = NaiveTime::parse_from_str(&offer.window_start, "%H:%M:%S").ok()?;
            let end = NaiveTime::parse_from_str(&offer.window_end, "%H:%M:%S").ok()?;
            if start >= end
                || !*input.shop().local_time().window_started()
                || *input.shop().local_time().window_ended()
                || !recurring_date_is_eligible(&offer, input.shop().local_time().date())
            {
                return None;
            }
        }
        _ => return None,
    }
    let scope = ScheduledScope {
        shop: &offer.shop,
        bundle_id: &offer.bundle_id,
        revision: &offer.revision,
    };
    let mut candidates = build_subscription_candidates(input, role == "scheduled_recurring", scope);
    if role == "scheduled_recurring" {
        return Some(candidates);
    }
    candidates.extend(build_automatic_addon_candidates(input, scope));
    for line in input.cart().lines() {
        if line.selling_plan_allocation().is_some()
            || line
                .step_type()
                .and_then(|attribute| attribute.value())
                .is_some_and(|value| value == "addon" || value.starts_with("addon:"))
        {
            continue;
        }
        let Some(token) = line.runtime_token().and_then(|attribute| attribute.value()) else {
            continue;
        };
        let Some(bytes) = verified_payload_bytes(token, secret) else {
            continue;
        };
        let Ok(parent) = serde_json::from_slice::<SignedParent>(&bytes) else {
            continue;
        };
        if !(parent.version == 1
            || (parent.version == 2 && parent.kind.as_deref() == Some("bundle")))
            || parent.shop != offer.shop
            || parent.bundle_id != offer.bundle_id
            || parent.parent_variant_id != offer.parent_variant_id
            || parent.revision != offer.revision
        {
            continue;
        }
        let receipt = parent.transformed_pricing;
        let schema::cart_lines_discounts_generate_run::input::cart::lines::Merchandise::ProductVariant(variant) = line.merchandise() else { continue; };
        let Some(group) = line
            .wolfpack_product_bundle_offer_id()
            .and_then(|attribute| attribute.value())
        else {
            continue;
        };
        let Some(expected_price) = receipt
            .unit_price
            .parse::<f64>()
            .ok()
            .filter(|price| price.is_finite() && *price > 0.0)
        else {
            continue;
        };
        let actual_price = line
            .cost()
            .amount_per_quantity()
            .amount()
            .to_string()
            .parse::<f64>()
            .ok();
        if variant.id().as_str() != offer.parent_variant_id
            || receipt.offer_group_id != *group
            || receipt.quantity <= 0
            || receipt.quantity != i64::from(*line.quantity())
            || actual_price != Some(expected_price)
            || !receipt.discount_percentage.is_finite()
            || receipt.discount_percentage <= 0.0
            || receipt.discount_percentage > 100.0
        {
            continue;
        }
        candidates.push(schema::ProductDiscountCandidate {
            associated_discount_code: None,
            message: None,
            prerequisites: None,
            targets: vec![schema::ProductDiscountCandidateTarget::CartLine(
                schema::CartLineTarget {
                    id: line.id().clone(),
                    quantity: Some(*line.quantity()),
                },
            )],
            value: schema::ProductDiscountCandidateValue::Percentage(schema::Percentage {
                value: Decimal(receipt.discount_percentage),
            }),
        });
    }
    Some(candidates)
}

#[shopify_function]
fn scheduled_cart_lines_discounts_generate_run(
    input: schema::cart_lines_discounts_generate_run::Input,
) -> Result<schema::CartLinesDiscountsGenerateRunResult> {
    if crate::candidates::exceeds_bundle_cart_limit(&input) {
        return Ok(schema::CartLinesDiscountsGenerateRunResult { operations: vec![] });
    }
    let candidates = candidates(&input).unwrap_or_default();
    let operations = if candidates.is_empty() {
        vec![]
    } else {
        vec![schema::CartOperation::ProductDiscountsAdd(
            schema::ProductDiscountsAddOperation {
                selection_strategy: schema::ProductDiscountSelectionStrategy::All,
                candidates,
            },
        )]
    };
    Ok(schema::CartLinesDiscountsGenerateRunResult { operations })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::runtime_token::sign_runtime_token_for_test;
    use serde_json::{json, Value};
    use shopify_function::run_function_with_input;

    fn input() -> Value {
        let receipt = json!({
            "offerGroupId": "bundle-1_GROUP", "quantity": 1,
            "unitPrice": "100.00", "discountPercentage": 20.0
        });
        json!({
            "presentmentCurrencyRate": "1.0", "localization": {"country": {"isoCode": "CA"}},
            "shop": {"ppbPolicyRevisions": {"value": json!({"bundle-1": {"revision": "revision-1", "pricingMode": "scheduled"}})},
                "localTime": {"date": "2026-09-14", "windowStarted": true, "windowEnded": false}},
            "discount": {"discountClasses": ["PRODUCT"], "runtimeTokenSecret": {"value": "test-secret"},
                "discountRole": {"value": "scheduled_initial"}, "scheduledOffer": {"value": json!({
                    "version": 1, "bundleId": "bundle-1", "shop": "test-shop.myshopify.com",
                    "parentVariantId": "gid://shopify/ProductVariant/99", "revision": "revision-1",
                    "countryRule": "include:CA", "scheduleMode": "recurring",
                    "recurrenceFrequency": "weekly", "recurrenceAnchorDate": "2026-09-14",
                    "recurrenceTermination": "never", "windowStart": "09:00:00", "windowEnd": "11:00:00"
                }).to_string()}},
            "cart": {"lines": [{"id": "gid://shopify/CartLine/1", "quantity": 1,
                "wolfpackProductBundleOfferId": {"value": "bundle-1_GROUP"},
                "runtimeToken": {"value": sign_runtime_token_for_test(&json!({"version": 1, "bundleId": "bundle-1", "shop": "test-shop.myshopify.com", "parentVariantId": "gid://shopify/ProductVariant/99", "revision": "revision-1", "offerGroupId": "bundle-1_GROUP", "transformedPricing": receipt}).to_string(), "test-secret")},
                "lineAuthorization": null, "sellingPlanAllocation": null, "stepType": null,
                "merchandise": {"__typename": "ProductVariant", "id": "gid://shopify/ProductVariant/99", "product": {"id": "gid://shopify/Product/99"}},
                "cost": {"amountPerQuantity": {"amount": "100.00"}}
            }]}, "enteredDiscountCodes": [], "triggeringDiscountCode": null
        })
    }

    fn run(input: Value) -> schema::CartLinesDiscountsGenerateRunResult {
        run_function_with_input(
            scheduled_cart_lines_discounts_generate_run,
            &input.to_string(),
        )
        .unwrap()
    }

    #[test]
    fn caps_authorized_lines_before_scheduled_verification() {
        let mut value = input();
        let line = value["cart"]["lines"][0].clone();
        value["cart"]["lines"] = json!(vec![line.clone(); 11]);
        assert!(run(value.clone()).operations.is_empty());
        value["cart"]["lines"] = json!(vec![line; 10]);
        assert!(!run(value).operations.is_empty());
    }

    #[test]
    fn grants_only_current_signed_parent_pricing_inside_the_window() {
        let output = run(input());
        assert_eq!(output.operations.len(), 1);
        assert!(format!("{:?}", output).contains("20.0"));
    }

    #[test]
    fn native_owners_reuse_scoped_addon_and_subscription_pricing() {
        for (addon, recurring) in [(true, false), (false, false), (false, true)] {
            let mut base = input();
            let token = sign_runtime_token_for_test(&json!({
                "version":1, "shop":"test-shop.myshopify.com", "bundleId":"bundle-1", "revision":"revision-1",
                "offerGroupId":"group", "parentVariantId":"gid://shopify/ProductVariant/99", "countryRule":"include:CA",
                "components":[{"variantId":"gid://shopify/ProductVariant/1","quantity":1}],
                "addons":[{"variantId":"gid://shopify/ProductVariant/1","quantity":1,"discount":{"type":"PERCENTAGE","value":10}}],
                "priceAdjustment":{"method":"percentage_off","value":20},
                "subscription":{"sellingPlanGroupId":"gid://shopify/SellingPlanGroup/1","sellingPlanId":"gid://shopify/SellingPlan/1","recurringBundleDiscount":recurring}
            }).to_string(), "test-secret");
            let line = &mut base["cart"]["lines"][0];
            line["runtimeToken"]["value"] = json!(token);
            line["wolfpackProductBundleOfferId"]["value"] = json!("group_0");
            line["merchandise"]["id"] = json!("gid://shopify/ProductVariant/1");
            if addon {
                line["stepType"] = json!({"value":"addon:PERCENTAGE:10"});
            } else {
                line["sellingPlanAllocation"] =
                    json!({"sellingPlan":{"id":"gid://shopify/SellingPlan/1"}});
            }
            base["discount"]["discountRole"]["value"] = json!(if recurring {
                "scheduled_recurring"
            } else {
                "scheduled_initial"
            });
            assert_eq!(run(base.clone()).operations.len(), 1);
            configure(&mut base, json!({"bundleId":"other"}));
            assert!(run(base).operations.is_empty());
        }
    }

    #[test]
    fn rejects_standard_policy_and_non_initial_parent_owners() {
        let mut standard = input();
        standard["shop"]["ppbPolicyRevisions"]["value"] =
            json!(json!({"bundle-1": {"revision": "revision-1", "pricingMode": "standard"}}));
        assert!(run(standard).operations.is_empty());
        for role in ["scheduled_recurring", "addons", "bundle", "unknown"] {
            let mut changed = input();
            changed["discount"]["discountRole"]["value"] = json!(role);
            assert!(run(changed).operations.is_empty());
        }
    }

    #[test]
    fn rejects_expired_window_country_switch_and_replayed_pricing() {
        let base = input();
        for (pointer, value) in [
            ("/shop/localTime/windowEnded", json!(true)),
            ("/shop/localTime/windowStarted", json!(false)),
            ("/shop/localTime/date", json!("2026-09-15")),
            ("/localization/country/isoCode", json!("US")),
            ("/cart/lines/0/quantity", json!(2)),
            (
                "/cart/lines/0/cost/amountPerQuantity/amount",
                json!("50.00"),
            ),
            (
                "/cart/lines/0/merchandise/id",
                json!("gid://shopify/ProductVariant/100"),
            ),
            ("/cart/lines/0/runtimeToken/value", json!("tampered")),
            (
                "/shop/ppbPolicyRevisions/value",
                json!(json!({"bundle-1": {"revision": "revision-2", "pricingMode": "scheduled"}})),
            ),
        ] {
            let mut changed = base.clone();
            *changed.pointer_mut(pointer).unwrap() = value;
            assert!(run(changed).operations.is_empty(), "{pointer}");
        }
        let mut later = base;
        later["shop"]["localTime"]["date"] = json!("2026-09-21");
        assert_eq!(run(later).operations.len(), 1);
    }

    fn configure(input: &mut Value, changes: Value) {
        let mut config: Value = serde_json::from_str(
            input["discount"]["scheduledOffer"]["value"]
                .as_str()
                .unwrap(),
        )
        .unwrap();
        for (key, value) in changes.as_object().unwrap() {
            config[key] = value.clone();
        }
        input["discount"]["scheduledOffer"]["value"] = json!(config.to_string());
    }

    #[test]
    fn monthly_windows_skip_missing_days_and_count_only_actual_occurrences() {
        let mut base = input();
        configure(
            &mut base,
            json!({"recurrenceFrequency": "monthly", "recurrenceAnchorDate": "2026-01-31",
            "recurrenceTermination": "after_runs", "recurrenceRunCount": 3}),
        );
        for (date, eligible) in [
            ("2026-01-31", true),
            ("2026-02-28", false),
            ("2026-03-31", true),
            ("2026-04-30", false),
            ("2026-05-31", true),
            ("2026-07-31", false),
            ("2025-12-31", false),
        ] {
            base["shop"]["localTime"]["date"] = json!(date);
            assert_eq!(!run(base.clone()).operations.is_empty(), eligible, "{date}");
        }
        configure(
            &mut base,
            json!({"recurrenceAnchorDate": "2024-01-29", "recurrenceRunCount": 2}),
        );
        base["shop"]["localTime"]["date"] = json!("2024-02-29");
        assert_eq!(run(base).operations.len(), 1);
    }

    #[test]
    fn termination_and_invalid_configuration_fail_closed() {
        let base = input();
        for change in [
            json!({"recurrenceAnchorDate": "2026-09-21"}),
            json!({"recurrenceAnchorDate": "2026-02-30"}),
            json!({"recurrenceFrequency": "daily"}),
            json!({"recurrenceTermination": "unknown"}),
            json!({"recurrenceTermination": "after_runs", "recurrenceRunCount": 0}),
            json!({"recurrenceTermination": "after_runs"}),
            json!({"recurrenceTermination": "on_date", "recurrenceEndsOn": "2026-09-13"}),
            json!({"recurrenceTermination": "on_date", "recurrenceEndsOn": "invalid"}),
            json!({"windowStart": "11:00:00", "windowEnd": "09:00:00"}),
            json!({"windowStart": "09:00:00", "windowEnd": "09:00:00"}),
            json!({"windowStart": "25:00:00"}),
            json!({"scheduleMode": "always"}),
            json!({"version": 2}),
            json!({"bundleId": "another-bundle"}),
            json!({"shop": "another-shop.myshopify.com"}),
        ] {
            let mut changed = base.clone();
            configure(&mut changed, change.clone());
            assert!(run(changed).operations.is_empty(), "{change}");
        }
        let mut inclusive_end = base.clone();
        configure(
            &mut inclusive_end,
            json!({"recurrenceTermination": "on_date", "recurrenceEndsOn": "2026-09-14"}),
        );
        assert_eq!(run(inclusive_end).operations.len(), 1);
        let mut limited = base;
        configure(
            &mut limited,
            json!({"recurrenceTermination": "after_runs", "recurrenceRunCount": 1}),
        );
        limited["shop"]["localTime"]["date"] = json!("2026-09-21");
        assert!(run(limited).operations.is_empty());
    }

    #[test]
    fn native_one_time_owner_uses_shopify_resource_boundaries() {
        let mut input = input();
        configure(&mut input, json!({"scheduleMode": "one_time"}));
        input["shop"]["localTime"]["windowEnded"] = json!(true);
        assert_eq!(run(input).operations.len(), 1);
    }

    #[test]
    fn rejects_a_receipt_attached_to_a_stale_outer_authorization() {
        let mut input = input();
        let token = input["cart"]["lines"][0]["runtimeToken"]["value"]
            .as_str()
            .unwrap();
        let mut payload: Value =
            serde_json::from_slice(&verified_payload_bytes(token, "test-secret").unwrap()).unwrap();
        payload["revision"] = json!("stale");
        input["cart"]["lines"][0]["runtimeToken"]["value"] = json!(sign_runtime_token_for_test(
            &payload.to_string(),
            "test-secret"
        ));
        assert!(run(input).operations.is_empty());
    }

    #[test]
    fn ordinary_authorization_without_a_transform_receipt_cannot_discount() {
        let mut input = input();
        input["cart"]["lines"][0]["runtimeToken"]["value"] = json!(sign_runtime_token_for_test(
            &json!({"version": 1, "bundleId": "bundle-1", "shop": "test-shop.myshopify.com", "parentVariantId": "gid://shopify/ProductVariant/99", "priceAdjustment": {"method": "percentage_off", "value": 100}}).to_string(), "test-secret"));
        assert!(run(input).operations.is_empty());
    }
}
