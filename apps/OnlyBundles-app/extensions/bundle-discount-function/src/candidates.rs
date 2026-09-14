use super::schema;
use crate::runtime_token::{
    country_is_eligible, token_components_match, verify_ppb_bundle_token, verify_ppb_line_token,
    verify_runtime_token, PpbBundleTokenV2, PpbLineTokenV2,
};
use shopify_function::prelude::*;
use std::collections::HashMap;

const ADDON_DISCOUNT_MESSAGE: &str = "Add On";
const BUNDLE_DISCOUNT_MESSAGE: &str = "Bundle Discount";
fn current_country(input: &schema::cart_lines_discounts_generate_run::Input) -> String {
    input
        .localization()
        .country()
        .iso_code()
        .to_string()
        .to_ascii_uppercase()
}

pub(crate) fn parse_addon_percentage(step_type_value: Option<&str>) -> Option<f64> {
    let value = step_type_value?.trim();
    let mut parts = value.split(':');
    let marker = parts.next()?;
    let discount_type = parts.next()?;
    let discount_value = parts.next()?;
    if parts.next().is_some() {
        return None;
    }
    if marker != "addon" || discount_type.to_ascii_uppercase() != "PERCENTAGE" {
        return None;
    }

    let percentage = discount_value.parse::<f64>().ok()?;
    if !percentage.is_finite() || percentage <= 0.0 {
        return None;
    }

    Some(percentage.min(100.0))
}

pub(crate) fn decimal_to_f64(d: &Decimal) -> f64 {
    format!("{d}")
        .parse::<f64>()
        .ok()
        .filter(|value| value.is_finite())
        .unwrap_or(0.0)
}

fn rounded_percentage(discount_amount: f64, original_total: f64) -> f64 {
    if original_total <= 0.0 {
        return 0.0;
    }

    let result = (discount_amount / original_total) * 100.0;
    if result.is_finite() {
        ((result * 10000.0).round() / 10000.0).clamp(0.0, 100.0)
    } else {
        0.0
    }
}

fn wolfpack_product_bundle_offer_group_id(value: &str) -> Option<String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return None;
    }

    let Some((base, item_index)) = trimmed.rsplit_once('_') else {
        return Some(trimmed.to_string());
    };

    if base.is_empty() || item_index.is_empty() {
        return None;
    }

    Some(base.to_string())
}

fn is_addon_line(step_type_value: Option<&str>) -> bool {
    step_type_value
        .map(|value| value == "addon" || value.starts_with("addon:"))
        .unwrap_or(false)
}

fn ppb_role(step_type: Option<&str>) -> &'static str {
    match step_type {
        Some("default") => "default",
        Some("free_gift") => "free_gift",
        Some(value) if value == "addon" || value.starts_with("addon:") => "addon",
        _ => "component",
    }
}

pub(crate) trait DiscountScope: Copy {
    fn allows(
        self,
        policies: Option<&shopify_function::wasm_api::Value>,
        shop: &str,
        bundle_id: &str,
        revision: &str,
    ) -> bool;
}

fn validate_ppb_line(
    line: &schema::cart_lines_discounts_generate_run::input::cart::Lines,
    secret: &str,
    policy_revisions: Option<&shopify_function::wasm_api::Value>,
    current_country: &str,
    scope: impl DiscountScope,
) -> Option<(PpbBundleTokenV2, PpbLineTokenV2)> {
    let bundle_token = line.runtime_token()?.value()?;
    let bundle = verify_ppb_bundle_token(bundle_token, secret)?;
    validate_ppb_line_with_bundle(
        line,
        bundle,
        secret,
        policy_revisions,
        current_country,
        scope,
    )
}

fn validate_ppb_line_with_bundle(
    line: &schema::cart_lines_discounts_generate_run::input::cart::Lines,
    bundle: PpbBundleTokenV2,
    secret: &str,
    policy_revisions: Option<&shopify_function::wasm_api::Value>,
    current_country: &str,
    scope: impl DiscountScope,
) -> Option<(PpbBundleTokenV2, PpbLineTokenV2)> {
    if !scope.allows(
        policy_revisions,
        &bundle.shop,
        &bundle.bundle_id,
        &bundle.revision,
    ) {
        return None;
    }
    if !country_is_eligible(&bundle.country_rule, current_country) {
        return None;
    }
    let authorization = line.line_authorization()?.value()?;
    let line_token = verify_ppb_line_token(authorization, secret)?;
    if line_token.shop != bundle.shop
        || line_token.bundle_id != bundle.bundle_id
        || line_token.revision != bundle.revision
        || line_token.role
            != ppb_role(
                line.step_type()
                    .and_then(|value| value.value())
                    .map(|value| value.as_str()),
            )
        || *line.quantity() as i64 <= 0
        || *line.quantity() as i64 > line_token.max_quantity
    {
        return None;
    }
    let group = bundle
        .groups
        .iter()
        .find(|group| group.id == line_token.group_id && group.role == line_token.role)?;
    if line_token.max_quantity > group.max_quantity {
        return None;
    }
    let schema::cart_lines_discounts_generate_run::input::cart::lines::Merchandise::ProductVariant(
        variant,
    ) = line.merchandise()
    else {
        return None;
    };
    let variant_matches =
        !line_token.variant_id.is_empty() && line_token.variant_id == variant.id().to_string();
    let product_matches = line_token.product_id.as_deref() == Some(variant.product().id().as_str());
    if !variant_matches && !product_matches {
        return None;
    }
    Some((bundle, line_token))
}

fn ppb_subscription_allows(bundle: &PpbBundleTokenV2, plan_id: &str, recurring: bool) -> bool {
    let Some(subscription) = bundle.subscription.as_ref() else {
        return false;
    };
    let allowed = subscription
        .get("selectedPlanIds")
        .and_then(|value| value.as_array())
        .map(|plans| plans.iter().any(|value| value.as_str() == Some(plan_id)))
        .unwrap_or(false);
    let recurring_matches = subscription
        .get("recurringBundleDiscount")
        .and_then(|value| value.as_bool())
        .unwrap_or(false)
        == recurring;
    allowed && recurring_matches
}

fn extract_json_number(source: &str, key: &str) -> Option<f64> {
    let key_marker = format!("\"{key}\"");
    let key_pos = source.find(&key_marker)?;
    let after_key = &source[key_pos + key_marker.len()..];
    let colon_pos = after_key.find(':')?;
    let after_colon = after_key[colon_pos + 1..].trim_start();
    let value_end = after_colon
        .find(|ch: char| !ch.is_ascii_digit() && ch != '.' && ch != '-')
        .unwrap_or(after_colon.len());
    after_colon[..value_end].parse::<f64>().ok()
}

fn extract_json_string(source: &str, key: &str) -> Option<String> {
    let key_marker = format!("\"{key}\"");
    let key_pos = source.find(&key_marker)?;
    let after_key = &source[key_pos + key_marker.len()..];
    let colon_pos = after_key.find(':')?;
    let after_colon = after_key[colon_pos + 1..].trim_start();
    let value = after_colon.strip_prefix('"')?;
    let value_end = value.find('"')?;
    Some(value[..value_end].to_string())
}

fn extract_json_number_any(source: &str, keys: &[&str]) -> Option<f64> {
    keys.iter().find_map(|key| extract_json_number(source, key))
}

fn extract_json_string_any(source: &str, keys: &[&str]) -> Option<String> {
    keys.iter().find_map(|key| extract_json_string(source, key))
}

fn calculate_parent_discount_percentage(
    price_adjustment_json: &str,
    paid_total: f64,
    original_total: f64,
    paid_quantity: i64,
    paid_unit_prices: &[f64],
    presentment_currency_rate: f64,
) -> f64 {
    if original_total <= 0.0 || paid_total <= 0.0 {
        return 0.0;
    }

    let method = extract_json_string(price_adjustment_json, "method")
        .unwrap_or_else(|| "percentage_off".to_string());
    let value = extract_json_number(price_adjustment_json, "value").unwrap_or(0.0);

    let target_price = match method.as_str() {
        "buy_x_get_y" => {
            let customer_buys =
                extract_json_number_any(price_adjustment_json, &["customerBuys", "customer_buys"])
                    .unwrap_or(0.0)
                    .max(0.0) as i64;
            let customer_gets =
                extract_json_number_any(price_adjustment_json, &["customerGets", "customer_gets"])
                    .unwrap_or(0.0)
                    .max(0.0) as i64;
            let offer_size = customer_buys + customer_gets;
            if paid_quantity <= 0 || offer_size <= 0 || customer_gets <= 0 {
                return 0.0;
            }

            let discounted_units = (paid_quantity / offer_size) * customer_gets;
            if discounted_units <= 0 {
                return 0.0;
            }

            let mut unit_prices: Vec<f64> = paid_unit_prices
                .iter()
                .copied()
                .filter(|price| price.is_finite() && *price > 0.0)
                .collect();
            if unit_prices.is_empty() {
                unit_prices = vec![paid_total / paid_quantity as f64; paid_quantity as usize];
            }

            match extract_json_string_any(
                price_adjustment_json,
                &["applyDiscountTo", "apply_discount_to"],
            )
            .as_deref()
            {
                Some("latest_added") => unit_prices.reverse(),
                _ => unit_prices
                    .sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal)),
            }

            let discounted_count = (discounted_units as usize).min(unit_prices.len());
            let discount_amount = match extract_json_string_any(
                price_adjustment_json,
                &["discountType", "discount_type"],
            )
            .as_deref()
            {
                Some("fixed_amount") | Some("fixed") => {
                    if presentment_currency_rate <= 0.0 {
                        return 0.0;
                    }
                    let amount_off = (value / 100.0) * presentment_currency_rate;
                    unit_prices
                        .iter()
                        .take(discounted_count)
                        .map(|price| amount_off.min(*price))
                        .sum::<f64>()
                }
                _ => {
                    let pct = value.clamp(0.0, 100.0);
                    unit_prices
                        .iter()
                        .take(discounted_count)
                        .map(|price| price * pct / 100.0)
                        .sum::<f64>()
                }
            };

            return rounded_percentage(discount_amount.min(original_total), original_total);
        }
        "fixed_amount_off" => {
            if presentment_currency_rate <= 0.0 {
                return 0.0;
            }
            let amount_off = (value / 100.0) * presentment_currency_rate;
            f64::max(0.0, paid_total - amount_off)
        }
        "fixed_bundle_price" => {
            if presentment_currency_rate <= 0.0 {
                return 0.0;
            }
            f64::min((value / 100.0) * presentment_currency_rate, paid_total)
        }
        _ => {
            let pct = value.clamp(0.0, 100.0);
            if (paid_total - original_total).abs() < 1e-8 {
                return pct;
            }
            paid_total * (1.0 - pct / 100.0)
        }
    };

    let discount_amount = (original_total - target_price).max(0.0).min(original_total);
    rounded_percentage(discount_amount, original_total)
}

fn build_addon_candidate(id: String, percentage: f64) -> schema::ProductDiscountCandidate {
    schema::ProductDiscountCandidate {
        associated_discount_code: None,
        message: Some(ADDON_DISCOUNT_MESSAGE.to_string()),
        prerequisites: None,
        targets: vec![schema::ProductDiscountCandidateTarget::CartLine(
            schema::CartLineTarget { id, quantity: None },
        )],
        value: schema::ProductDiscountCandidateValue::Percentage(schema::Percentage {
            value: Decimal(percentage),
        }),
    }
}

pub(crate) fn build_automatic_addon_candidates(
    input: &schema::cart_lines_discounts_generate_run::Input,
    scope: impl DiscountScope,
) -> Vec<schema::ProductDiscountCandidate> {
    let Some(runtime_secret) = input
        .discount()
        .runtime_token_secret()
        .map(|metafield| metafield.value().as_str())
        .filter(|value| !value.trim().is_empty())
    else {
        return vec![];
    };
    let policy_revisions = input
        .shop()
        .ppb_policy_revisions()
        .map(|metafield| metafield.value());
    let current_country = current_country(input);

    // Reuse each verified static authorization for totals and candidate construction.
    let mut bundle_tokens = HashMap::new();
    let validated_lines: Vec<_> = input
        .cart()
        .lines()
        .iter()
        .map(|line| {
            if !is_addon_line(
                line.step_type()
                    .and_then(|attribute| attribute.value())
                    .map(|value| value.as_str()),
            ) {
                return None;
            }
            line.line_authorization()
                .and_then(|attribute| attribute.value())?;
            let token = line.runtime_token()?.value()?;
            let bundle = bundle_tokens
                .entry(token.as_str())
                .or_insert_with(|| verify_ppb_bundle_token(token, runtime_secret))
                .as_ref()?
                .clone();
            validate_ppb_line_with_bundle(
                line,
                bundle,
                runtime_secret,
                policy_revisions,
                &current_country,
                scope,
            )
        })
        .collect();
    let mut authorized_quantities: HashMap<(String, String, String), i64> = HashMap::new();
    let mut line_authorized_quantities: HashMap<String, i64> = HashMap::new();
    for (line, validated) in input.cart().lines().iter().zip(&validated_lines) {
        if let Some((bundle, line_token)) = validated {
            *authorized_quantities
                .entry((
                    bundle.bundle_id.clone(),
                    bundle.revision.clone(),
                    line_token.group_id.clone(),
                ))
                .or_default() += *line.quantity() as i64;
            if let Some(authorization) = line
                .line_authorization()
                .and_then(|attribute| attribute.value())
            {
                *line_authorized_quantities
                    .entry(authorization.clone())
                    .or_default() += *line.quantity() as i64;
            }
        }
    }

    input
        .cart()
        .lines()
        .iter()
        .zip(&validated_lines)
        .filter_map(|(line, validated)| {
            let percentage = parse_addon_percentage(
                line.step_type()
                    .and_then(|attribute| attribute.value())
                    .map(|value| value.as_str()),
            )?;
            let token = line
                .runtime_token()
                .and_then(|attribute| attribute.value())
                .map(|value| value.as_str())?;
            let variant_id = match line.merchandise() {
                schema::cart_lines_discounts_generate_run::input::cart::lines::Merchandise::ProductVariant(variant) => {
                    variant.id().to_string()
                }
                _ => return None,
            };
            let authorized = if line.line_authorization().and_then(|attribute| attribute.value()).is_some() {
                None
            } else { verify_runtime_token(token, runtime_secret)
                .map(|payload| scope.allows(policy_revisions, &payload.shop, &payload.bundle_id, &payload.revision)
                    && country_is_eligible(&payload.country_rule, &current_country)
                    && payload.addons.iter().any(|addon| {
                    addon.variant_id == variant_id
                        && addon.quantity == *line.quantity() as i64
                        && addon.discount.as_ref().map(|discount| {
                            discount.discount_type.eq_ignore_ascii_case("PERCENTAGE")
                                && (discount.value - percentage).abs() < 0.0001
                        }).unwrap_or(false)
                })) }
                .or_else(|| validated.as_ref().map(|(bundle, line_token)| {
                    let group = bundle.groups.iter().find(|group| group.id == line_token.group_id);
                    let line_quantity_is_authorized = line
                        .line_authorization()
                        .and_then(|attribute| attribute.value())
                        .and_then(|authorization| line_authorized_quantities.get(authorization))
                        .map(|quantity| *quantity <= line_token.max_quantity)
                        .unwrap_or(false);
                    line_token.role == "addon"
                        && percentage <= line_token.max_discount_percentage
                        && line_quantity_is_authorized
                        && group
                            .and_then(|group| authorized_quantities.get(&(
                                bundle.bundle_id.clone(), bundle.revision.clone(), group.id.clone(),
                            )).map(|quantity| (*quantity, group)))
                            .map(|(quantity, group)| quantity >= group.min_quantity && quantity <= group.max_quantity)
                            .unwrap_or(false)
                }))
                .unwrap_or(false);
            if !authorized {
                return None;
            }

            Some(build_addon_candidate(line.id().clone(), percentage))
        })
        .collect()
}

pub(crate) fn build_subscription_candidates(
    input: &schema::cart_lines_discounts_generate_run::Input,
    recurring_bundle_discount: bool,
    scope: impl DiscountScope,
) -> Vec<schema::ProductDiscountCandidate> {
    let Some(runtime_secret) = input
        .discount()
        .runtime_token_secret()
        .map(|metafield| metafield.value().as_str())
        .filter(|value| !value.trim().is_empty())
    else {
        return vec![];
    };
    let policy_revisions = input
        .shop()
        .ppb_policy_revisions()
        .map(|metafield| metafield.value());
    let current_country = current_country(input);
    let mut groups: HashMap<String, Vec<usize>> = HashMap::new();
    for (index, line) in input.cart().lines().iter().enumerate() {
        if line.selling_plan_allocation().is_none()
            || is_addon_line(line.step_type().and_then(|a| a.value()).map(|v| v.as_str()))
        {
            continue;
        }
        let Some(group_id) = line
            .wolfpack_product_bundle_offer_id()
            .and_then(|attribute| attribute.value())
            .and_then(|value| wolfpack_product_bundle_offer_group_id(value.as_str()))
        else {
            continue;
        };
        groups.entry(group_id).or_default().push(index);
    }

    let mut candidates = Vec::new();
    for (group_id, indices) in groups {
        let Some(token) = indices.iter().find_map(|&index| {
            input.cart().lines()[index]
                .runtime_token()
                .and_then(|attribute| attribute.value())
                .map(|value| value.as_str())
        }) else {
            continue;
        };
        let v1_payload = verify_runtime_token(token, runtime_secret).filter(|payload| {
            scope.allows(
                policy_revisions,
                &payload.shop,
                &payload.bundle_id,
                &payload.revision,
            )
        });
        let v2_bundle = if v1_payload.is_none() {
            indices.iter().find_map(|&index| {
                validate_ppb_line(
                    &input.cart().lines()[index],
                    runtime_secret,
                    policy_revisions,
                    &current_country,
                    scope,
                )
                .map(|value| value.0)
            })
        } else {
            None
        };
        if v1_payload.is_none() && v2_bundle.is_none() {
            continue;
        }
        if v1_payload
            .as_ref()
            .is_some_and(|payload| !country_is_eligible(&payload.country_rule, &current_country))
            || v2_bundle
                .as_ref()
                .is_some_and(|bundle| !country_is_eligible(&bundle.country_rule, &current_country))
        {
            continue;
        }
        let plan_matches = if let Some(payload) = v1_payload.as_ref() {
            let Some(subscription) = payload.subscription.as_ref() else {
                continue;
            };
            if subscription.selling_plan_group_id.trim().is_empty()
                || subscription.recurring_bundle_discount != recurring_bundle_discount
            {
                continue;
            }
            indices.iter().all(|&index| {
                input.cart().lines()[index]
                    .selling_plan_allocation()
                    .map(|allocation| {
                        allocation.selling_plan().id() == &subscription.selling_plan_id
                    })
                    .unwrap_or(false)
            })
        } else {
            let bundle = v2_bundle.as_ref().unwrap();
            let mut group_quantities: HashMap<String, i64> = HashMap::new();
            let mut line_quantities: HashMap<String, (i64, i64)> = HashMap::new();
            let lines_match = indices.iter().all(|&index| {
                let line = &input.cart().lines()[index];
                let Some(plan_id) = line
                    .selling_plan_allocation()
                    .map(|allocation| allocation.selling_plan().id().as_str())
                else {
                    return false;
                };
                validate_ppb_line(
                    line,
                    runtime_secret,
                    policy_revisions,
                    &current_country,
                    scope,
                )
                .map(|(candidate, line_token)| {
                    let Some(authorization) = line
                        .line_authorization()
                        .and_then(|attribute| attribute.value())
                    else {
                        return false;
                    };
                    *group_quantities
                        .entry(line_token.group_id.clone())
                        .or_default() += *line.quantity() as i64;
                    let line_quantity = line_quantities
                        .entry(authorization.clone())
                        .or_insert((0, line_token.max_quantity));
                    line_quantity.0 += *line.quantity() as i64;
                    candidate.bundle_id == bundle.bundle_id
                        && candidate.revision == bundle.revision
                        && ppb_subscription_allows(&candidate, plan_id, recurring_bundle_discount)
                })
                .unwrap_or(false)
            });
            lines_match
                && line_quantities
                    .values()
                    .all(|(quantity, max_quantity)| quantity <= max_quantity)
                && bundle
                    .groups
                    .iter()
                    .filter(|group| group.role != "addon")
                    .all(|group| {
                        let quantity = *group_quantities.get(&group.id).unwrap_or(&0);
                        quantity >= group.min_quantity && quantity <= group.max_quantity
                    })
        };
        if !plan_matches {
            continue;
        }

        let mut actual_components = Vec::new();
        let mut targets = Vec::new();
        let mut total = 0.0;
        let mut quantity = 0i64;
        let mut unit_prices = Vec::new();
        for &index in &indices {
            let line = &input.cart().lines()[index];
            let schema::cart_lines_discounts_generate_run::input::cart::lines::Merchandise::ProductVariant(variant) = line.merchandise() else {
                actual_components.clear();
                break;
            };
            let line_quantity = *line.quantity() as i64;
            let unit_price = decimal_to_f64(line.cost().amount_per_quantity().amount());
            actual_components.push((variant.id().to_string(), line_quantity));
            quantity += line_quantity;
            total += unit_price * line_quantity as f64;
            for _ in 0..line_quantity.max(0) {
                unit_prices.push(unit_price);
            }
            targets.push(schema::ProductDiscountCandidateTarget::CartLine(
                schema::CartLineTarget {
                    id: line.id().clone(),
                    quantity: None,
                },
            ));
        }
        if let Some(payload) = v1_payload.as_ref() {
            if !token_components_match(payload, &group_id, &actual_components) {
                continue;
            }
        }
        let price_adjustment = v1_payload
            .as_ref()
            .map(|payload| serde_json::to_string(&payload.price_adjustment).unwrap_or_default())
            .or_else(|| {
                v2_bundle.as_ref().map(|payload| {
                    serde_json::to_string(&payload.price_adjustment).unwrap_or_default()
                })
            })
            .unwrap_or_default();
        let percentage = calculate_parent_discount_percentage(
            &price_adjustment,
            total,
            total,
            quantity,
            &unit_prices,
            decimal_to_f64(input.presentment_currency_rate()),
        );
        if percentage <= 0.0 || targets.is_empty() {
            continue;
        }
        candidates.push(schema::ProductDiscountCandidate {
            associated_discount_code: None,
            message: Some(BUNDLE_DISCOUNT_MESSAGE.to_string()),
            prerequisites: None,
            targets,
            value: schema::ProductDiscountCandidateValue::Percentage(schema::Percentage {
                value: Decimal(percentage),
            }),
        });
    }
    candidates
}

/// Bound verification work even when callers bypass the storefront submission guard.
pub(crate) fn exceeds_bundle_cart_limit(
    input: &schema::cart_lines_discounts_generate_run::Input,
) -> bool {
    input
        .cart()
        .lines()
        .iter()
        .filter(|line| {
            line.runtime_token().and_then(|a| a.value()).is_some()
                || line.line_authorization().and_then(|a| a.value()).is_some()
        })
        .take(11)
        .count()
        > 10
}
