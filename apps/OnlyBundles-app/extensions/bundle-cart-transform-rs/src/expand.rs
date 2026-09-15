use shopify_function::scalars::Decimal;

use crate::helpers::{country_is_eligible, decimal_to_f64, parse_json_or_default};
use crate::pricing::calculate_discount_percentage;
use crate::schema;
use crate::types::{ParentOfferPolicy, PriceAdjustmentConfig, RuntimeTokenLine};

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct ExpandedParentAuthorization<'a> {
    version: u8,
    shop: &'a str,
    bundle_id: &'a str,
    revision: &'a str,
    parent_variant_id: &'a str,
    offer_group_id: &'a str,
    country_rule: &'a str,
    components: Vec<RuntimeTokenLine>,
    addons: Vec<RuntimeTokenLine>,
}

/// Process all EXPAND operations for one cart pass.
///
/// FLEX BUNDLES PATTERN: keeps the SAME bundle variant (merchandiseId = input line's variant).
/// Does NOT expand to individual component products.
/// Shopify owns component presentation and final discount allocations.
///
/// Triggered when:
/// - Line NOT already processed by MERGE pass
/// - Line's variant has `component_reference` and quantities in `price_adjustment`
pub fn process_expand_operations(
    input: &schema::run::Input,
    processed_lines: &[bool],
    presentment_currency_rate: f64,
    runtime_token_secret: Option<&str>,
) -> Vec<schema::CartOperation> {
    let mut operations: Vec<schema::CartOperation> = Vec::new();
    let lines = input.cart().lines();

    for (line_index, line) in lines.iter().enumerate() {
        if processed_lines.get(line_index).copied().unwrap_or(false) {
            continue;
        }

        // Composition and its current published policy are required.
        let variant = match line.merchandise() {
            schema::run::input::cart::lines::Merchandise::ProductVariant(v) => v,
            _ => continue,
        };

        let parent_policy = variant.price_adjustment().and_then(|metafield| {
            serde_json::from_str::<ParentOfferPolicy>(metafield.value()).ok()
        });
        let Some(parent_policy) = parent_policy else {
            continue;
        };
        let Some(mode) = crate::published_policy::pricing_mode(
            input.shop().ppb_policy_revisions().map(|m| m.value()),
            &parent_policy.bundle_id,
            &parent_policy.revision,
        ) else {
            continue;
        };
        let scheduled = mode == crate::published_policy::PricingMode::Scheduled;

        if !country_is_eligible(
            &parent_policy.country_rule,
            input.localization().country().iso_code().as_str(),
        ) {
            continue;
        }

        let cr_json = match variant.component_reference() {
            Some(m) => m.value().clone(),
            None => continue,
        };
        let component_references: Vec<String> = parse_json_or_default(Some(&cr_json));
        let component_quantities = &parent_policy.component_quantities;

        if component_references.is_empty()
            || component_quantities.is_empty()
            || component_quantities.iter().any(|quantity| *quantity <= 0)
            || component_references.len() != component_quantities.len()
        {
            continue;
        }

        // -------------------------------------------------------------------------
        // Compute discount percentage.
        // -------------------------------------------------------------------------
        let Some(total_quantity) = component_quantities
            .iter()
            .try_fold(0_i64, |sum, quantity| sum.checked_add(*quantity))
            .and_then(|sum| sum.checked_mul(*line.quantity() as i64))
        else {
            continue;
        };
        let original_total =
            decimal_to_f64(line.cost().amount_per_quantity().amount()) * (*line.quantity() as f64);

        let discount_percentage = variant
            .price_adjustment()
            .map(|m| m.value().clone())
            .and_then(|pa_json| {
                serde_json::from_str::<PriceAdjustmentConfig>(pa_json.as_str()).ok()
            })
            .map(|pa| {
                calculate_discount_percentage(
                    &pa,
                    original_total,
                    original_total,
                    total_quantity,
                    total_quantity,
                    presentment_currency_rate,
                )
            })
            .unwrap_or(0.0);

        let bundle_name = variant.product().title().to_string();

        let merchandise_id = variant.id().to_string();

        // Price on the EXPAND op only when discount > 0 (matches TS spread pattern).
        let price: Option<schema::PriceAdjustment> = if discount_percentage > 0.0 && !scheduled {
            Some(schema::PriceAdjustment {
                percentage_decrease: Some(schema::PriceAdjustmentValue {
                    value: Decimal::from(discount_percentage),
                }),
            })
        } else {
            None
        };

        let mut attributes = vec![
            schema::AttributeOutput {
                key: "_is_bundle_parent".into(),
                value: "true".into(),
            },
            schema::AttributeOutput {
                key: "_bundle_name".into(),
                value: bundle_name,
            },
            schema::AttributeOutput {
                key: "_bundle_total_retail_cents".into(),
                value: ((original_total * 100.0).round() as i64).to_string(),
            },
        ];

        if scheduled {
            let Some(secret) = runtime_token_secret else {
                continue;
            };
            let group = format!("parent:{}", line.id());
            let components = component_references
                .iter()
                .zip(component_quantities)
                .map(|(id, quantity)| RuntimeTokenLine {
                    variant_id: id.clone(),
                    quantity: quantity * i64::from(*line.quantity()),
                })
                .collect();
            let envelope = ExpandedParentAuthorization {
                version: 1,
                shop: &parent_policy.shop,
                bundle_id: &parent_policy.bundle_id,
                revision: &parent_policy.revision,
                parent_variant_id: variant.id(),
                offer_group_id: &group,
                components,
                addons: vec![],
                country_rule: &parent_policy.country_rule,
            };
            let Ok(envelope_json) = serde_json::to_string(&envelope) else {
                continue;
            };
            let Some(token) = crate::runtime_token::pricing_receipt_json(
                envelope_json.as_bytes(),
                secret,
                &group,
                i64::from(*line.quantity()),
                decimal_to_f64(line.cost().amount_per_quantity().amount()),
                discount_percentage,
            ) else {
                continue;
            };
            attributes.push(schema::AttributeOutput {
                key: "_wolfpack_bundle_runtime".into(),
                value: token,
            });
            attributes.push(schema::AttributeOutput {
                key: "_wolfpackProductBundle:OfferId".into(),
                value: group,
            });
        }

        let expand_op = schema::LineExpandOperation {
            cart_line_id: line.id().to_string(),
            expanded_cart_items: vec![schema::ExpandedItem {
                merchandise_id,
                quantity: 1, // Shopify multiplies component quantity by the parent cart-line quantity.
                attributes: Some(attributes),
                price: None, // Flex Bundle: per-item price not set; discount on op level
            }],
            price,
            title: None,
            image: None,
        };

        operations.push(schema::CartOperation::LineExpand(expand_op));
    }

    operations
}
