use super::*;

#[derive(Clone, Copy)]
pub(crate) struct StandardScope;

impl DiscountScope for StandardScope {
    fn allows(
        self,
        policies: Option<&shopify_function::wasm_api::Value>,
        _shop: &str,
        bundle_id: &str,
        revision: &str,
    ) -> bool {
        use crate::published_policy::{pricing_mode, PricingMode};
        pricing_mode(policies, bundle_id, revision) == Some(PricingMode::Standard)
    }
}

const CHECKOUT_INTEGRATION_CODE_PREFIX: &str = "WPB-";

fn is_free_gift_line(step_type_value: Option<&str>) -> bool {
    step_type_value == Some("free_gift")
}

pub(crate) fn has_generated_checkout_code(
    input: &schema::cart_lines_discounts_generate_run::Input,
) -> bool {
    input
        .entered_discount_codes()
        .iter()
        .any(|code| code.code().starts_with(CHECKOUT_INTEGRATION_CODE_PREFIX))
}

pub(crate) fn is_checkout_integration_code_mode(
    input: &schema::cart_lines_discounts_generate_run::Input,
) -> bool {
    input
        .triggering_discount_code()
        .map(|code| code.starts_with(CHECKOUT_INTEGRATION_CODE_PREFIX))
        .unwrap_or(false)
}

pub(crate) fn build_checkout_integration_candidates(
    input: &schema::cart_lines_discounts_generate_run::Input,
    presentment_currency_rate: f64,
) -> Vec<schema::ProductDiscountCandidate> {
    let lines = input.cart().lines();
    let current_country = current_country(input);
    let runtime_secret = input
        .discount()
        .runtime_token_secret()
        .map(|metafield| metafield.value().as_str())
        .filter(|value| !value.trim().is_empty());
    let mut groups: HashMap<String, Vec<usize>> = HashMap::new();
    let mut candidates = Vec::new();

    for (idx, line) in lines.iter().enumerate() {
        let step_type = line.step_type().and_then(|a| a.value()).map(|s| s.as_str());
        if let Some(percentage) = parse_addon_percentage(step_type) {
            if let Some(secret) = runtime_secret {
                let token = line
                    .runtime_token()
                    .and_then(|attribute| attribute.value())
                    .map(|value| value.as_str());
                let variant_id = match line.merchandise() {
                    schema::cart_lines_discounts_generate_run::input::cart::lines::Merchandise::ProductVariant(variant) => {
                        variant.id().to_string()
                    }
                    _ => String::new(),
                };
                let authorized = token
                    .and_then(|runtime_token| verify_runtime_token(runtime_token, secret))
                    .map(|payload| {
                        StandardScope.allows(
                            input.shop().ppb_policy_revisions().map(|m| m.value()),
                            &payload.shop,
                            &payload.bundle_id,
                            &payload.revision,
                        ) && country_is_eligible(&payload.country_rule, &current_country)
                            && payload.addons.iter().any(|addon| {
                                addon.variant_id == variant_id
                                    && addon.quantity == *line.quantity() as i64
                                    && addon
                                        .discount
                                        .as_ref()
                                        .map(|discount| {
                                            discount
                                                .discount_type
                                                .eq_ignore_ascii_case("PERCENTAGE")
                                                && (discount.value - percentage).abs() < 0.0001
                                        })
                                        .unwrap_or(false)
                            })
                    })
                    .unwrap_or(false);
                if authorized {
                    candidates.push(build_addon_candidate(line.id().clone(), percentage));
                }
            }
            continue;
        }

        if is_addon_line(step_type) {
            continue;
        }

        let Some(group_id) = line
            .wolfpack_product_bundle_offer_id()
            .and_then(|attribute| attribute.value())
            .and_then(|value| wolfpack_product_bundle_offer_group_id(value.as_str()))
        else {
            continue;
        };

        groups.entry(group_id).or_default().push(idx);
    }

    for (_, line_indices) in groups {
        let mut paid_total = 0.0;
        let mut free_gift_total = 0.0;
        let mut paid_quantity = 0;
        let mut paid_unit_prices = Vec::new();
        let mut targets = Vec::new();
        let mut actual_components = Vec::new();

        for &idx in &line_indices {
            let line = &lines[idx];
            let quantity = *line.quantity() as f64;
            let unit_price = decimal_to_f64(line.cost().amount_per_quantity().amount());
            let line_total = unit_price * quantity;
            let step_type = line.step_type().and_then(|a| a.value()).map(|s| s.as_str());

            if is_free_gift_line(step_type) {
                free_gift_total += line_total;
            } else {
                paid_total += line_total;
                paid_quantity += *line.quantity() as i64;
                for _ in 0..(*line.quantity() as i64).max(0) {
                    paid_unit_prices.push(unit_price);
                }
            }

            targets.push(schema::ProductDiscountCandidateTarget::CartLine(
                schema::CartLineTarget {
                    id: line.id().clone(),
                    quantity: None,
                },
            ));
            if !is_addon_line(step_type) {
                if let schema::cart_lines_discounts_generate_run::input::cart::lines::Merchandise::ProductVariant(variant) = line.merchandise() {
                    actual_components.push((variant.id().to_string(), *line.quantity() as i64));
                }
            }
        }

        let original_total = paid_total + free_gift_total;
        let Some(secret) = runtime_secret else {
            continue;
        };
        let token = line_indices.iter().find_map(|&idx| {
            lines[idx]
                .runtime_token()
                .and_then(|attribute| attribute.value())
                .map(|value| value.as_str())
                .filter(|value| !value.trim().is_empty())
        });
        let Some(payload) =
            token.and_then(|runtime_token| verify_runtime_token(runtime_token, secret))
        else {
            continue;
        };
        let Some(group_id) = line_indices.iter().find_map(|&idx| {
            lines[idx]
                .wolfpack_product_bundle_offer_id()
                .and_then(|attribute| attribute.value())
                .and_then(|value| wolfpack_product_bundle_offer_group_id(value.as_str()))
        }) else {
            continue;
        };
        if !token_components_match(&payload, &group_id, &actual_components) {
            continue;
        }
        if !StandardScope.allows(
            input.shop().ppb_policy_revisions().map(|m| m.value()),
            &payload.shop,
            &payload.bundle_id,
            &payload.revision,
        ) || !country_is_eligible(&payload.country_rule, &current_country)
        {
            continue;
        }
        let price_adjustment_json =
            serde_json::to_string(&payload.price_adjustment).unwrap_or_default();
        let percentage = calculate_parent_discount_percentage(
            &price_adjustment_json,
            paid_total,
            original_total,
            paid_quantity,
            &paid_unit_prices,
            presentment_currency_rate,
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
