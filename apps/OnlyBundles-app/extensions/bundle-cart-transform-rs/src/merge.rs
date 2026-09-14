use shopify_function::scalars::Decimal;

use crate::helpers::{
    country_is_eligible, decimal_to_f64, is_addon_line, is_free_gift_line, parse_json_or_default,
};
use crate::pricing::{
    calculate_buy_x_get_y_discount_percentage, calculate_discount_percentage, rounded_percentage,
};
use crate::runtime_token::{token_components_match, verify_bundle_token, verify_ppb_line_token};
use crate::schema;
use crate::types::{
    CartBundleDetailsEntry, CartLineMessagingSettings, ComponentParent, PricingMethod,
    RuntimeTokenPayload,
};

fn non_empty(value: &Option<String>) -> Option<String> {
    value
        .as_ref()
        .map(|value| value.trim())
        .filter(|value| !value.is_empty())
        .map(|value| value.to_string())
}

fn has_fixed_price_display_only_marker(
    lines: &[schema::run::input::cart::Lines],
    line_indices: &[usize],
) -> bool {
    line_indices.iter().any(|&idx| {
        lines[idx]
            .step_type()
            .and_then(|a| a.value())
            .map(|value| value.as_str() == "fixed_price_display_only")
            .unwrap_or(false)
    })
}

fn ppb_role(step_type: Option<&str>) -> &'static str {
    match step_type {
        Some("default") => "default",
        Some("free_gift") => "free_gift",
        Some(value) if value == "addon" || value.starts_with("addon:") => "addon",
        _ => "component",
    }
}

fn validate_ppb_v2_group(
    lines: &[schema::run::input::cart::Lines],
    line_indices: &[usize],
    bundle: &RuntimeTokenPayload,
    secret: &str,
) -> Option<()> {
    // Aggregate once so split lines share the signed quantity ceiling.
    let mut authorizations = std::collections::HashMap::new();
    for &idx in line_indices {
        let line = &lines[idx];
        let token = line.line_authorization()?.value()?.as_str();
        let quantity = authorizations.entry(token).or_insert(0_i64);
        *quantity = quantity.checked_add(i64::from(*line.quantity()))?;
    }
    let mut group_quantities = vec![0_i64; bundle.groups.len()];
    for &idx in line_indices {
        let line = &lines[idx];
        let authorization = line
            .line_authorization()
            .and_then(|value| value.value())
            .map(|value| value.as_str())?;
        let authorized_quantity = authorizations.get(authorization)?;
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
        let group_index = bundle
            .groups
            .iter()
            .position(|group| group.id == line_token.group_id && group.role == line_token.role)?;
        let group = &bundle.groups[group_index];
        if line_token.max_quantity > group.max_quantity {
            return None;
        }
        let quantity = *line.quantity() as i64;
        if *authorized_quantity > line_token.max_quantity {
            return None;
        }
        group_quantities[group_index] += quantity;
        let schema::run::input::cart::lines::Merchandise::ProductVariant(variant) =
            line.merchandise()
        else {
            return None;
        };
        let variant_matches =
            !line_token.variant_id.is_empty() && line_token.variant_id == variant.id().to_string();
        let product_matches =
            line_token.product_id.as_deref() == Some(variant.product().id().as_str());
        if !variant_matches && !product_matches {
            return None;
        }
    }
    for (group_index, group) in bundle.groups.iter().enumerate() {
        if group.role == "addon" {
            continue;
        }
        let quantity = group_quantities[group_index];
        if quantity < group.min_quantity || quantity > group.max_quantity {
            return None;
        }
    }
    Some(())
}

/// Process all MERGE operations for one cart pass.
///
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

/// Groups cart lines by `_wolfpackProductBundle:OfferId` base (O(n) pass), then for each group builds one
/// MERGE operation after verifying the signed runtime token.
///
/// # Returns
/// Vec of CartOperation (merge variant), with processed line IDs added to
/// the `processed_lines` bitmap for the EXPAND pass to skip.
pub fn process_merge_operations(
    input: &schema::run::Input,
    presentment_currency_rate: f64,
    processed_lines: &mut [bool],
    cart_line_messaging: &CartLineMessagingSettings,
    runtime_token_secret: Option<&str>,
) -> Vec<schema::CartOperation> {
    let mut operations: Vec<schema::CartOperation> = Vec::new();

    // Tracks how many times each bundle name appears — duplicate instances get " (2)", " (3)"
    // suffixes to prevent Shopify from consolidating separate bundle instances.
    let mut bundle_name_counts: Vec<(String, u32)> = Vec::new();

    // -------------------------------------------------------------------------
    // Step 1: Group cart lines by `_wolfpackProductBundle:OfferId` base in a single O(n) pass.
    // Using indices to avoid borrow conflicts with `lines` slice.
    // -------------------------------------------------------------------------
    let lines = input.cart().lines();
    let current_country = input.localization().country().iso_code().as_str();
    let mut bundle_groups: Vec<(String, Vec<usize>)> = Vec::new();

    for (idx, line) in lines.iter().enumerate() {
        let step_type = line.step_type().and_then(|a| a.value()).map(|s| s.as_str());
        if step_type == Some("gift_message") {
            continue;
        }

        let offer_group_id = match line
            .wolfpack_product_bundle_offer_id()
            .and_then(|a| a.value())
            .and_then(|value| wolfpack_product_bundle_offer_group_id(value.as_str()))
        {
            Some(v) => v,
            None => continue,
        };
        if let Some((_, indices)) = bundle_groups
            .iter_mut()
            .find(|(group_id, _)| group_id == &offer_group_id)
        {
            indices.push(idx);
        } else {
            bundle_groups.push((offer_group_id, vec![idx]));
        }
    }

    // -------------------------------------------------------------------------
    // Step 2: Build one MERGE operation per bundle group.
    // -------------------------------------------------------------------------
    let ppb_policy_revisions = input
        .shop()
        .ppb_policy_revisions()
        .map(|metafield| metafield.value());
    let cart_bundle_details: Vec<CartBundleDetailsEntry> = parse_json_or_default(
        input
            .cart()
            .bundle_details()
            .map(|metafield| metafield.value().as_str()),
    );

    for (offer_group_id, line_indices) in &bundle_groups {
        if line_indices
            .iter()
            .any(|&idx| lines[idx].selling_plan_allocation().is_some())
        {
            continue;
        }
        let merge_line_indices: Vec<usize> = line_indices
            .iter()
            .copied()
            .filter(|&idx| {
                let step_type = lines[idx]
                    .step_type()
                    .and_then(|a| a.value())
                    .map(|s| s.as_str());
                !is_addon_line(step_type)
            })
            .collect();
        let addon_line_indices: Vec<usize> = line_indices
            .iter()
            .copied()
            .filter(|&idx| {
                let step_type = lines[idx]
                    .step_type()
                    .and_then(|a| a.value())
                    .map(|s| s.as_str());
                is_addon_line(step_type)
            })
            .collect();
        let bundle_addon_offer_id = if addon_line_indices.is_empty() {
            None
        } else {
            Some(offer_group_id.clone())
        };

        if merge_line_indices.is_empty() {
            continue;
        }

        let cart_bundle_entry = cart_bundle_details
            .iter()
            .find(|entry| entry.key == *offer_group_id);
        let runtime_parent = runtime_token_secret.and_then(|secret| {
            let token = cart_bundle_entry
                .and_then(|entry| entry.runtime_token.as_deref())
                .filter(|value| !value.trim().is_empty())?;
            let payload = verify_bundle_token(token, secret)?;
            let mode = crate::published_policy::pricing_mode(
                ppb_policy_revisions,
                &payload.bundle_id,
                &payload.revision,
            )?;
            if !country_is_eligible(&payload.country_rule, current_country) {
                return None;
            }
            if payload.version == 1 {
                let actual_components: Vec<(String, i64)> = merge_line_indices
                    .iter()
                    .filter_map(|&idx| match lines[idx].merchandise() {
                        schema::run::input::cart::lines::Merchandise::ProductVariant(v) => {
                            Some((v.id().to_string(), *lines[idx].quantity() as i64))
                        }
                        _ => None,
                    })
                    .collect();
                if !token_components_match(&payload, offer_group_id, &actual_components) {
                    return None;
                }
            } else {
                validate_ppb_v2_group(lines, &merge_line_indices, &payload, secret)?;
            }
            Some((
                ComponentParent {
                    id: payload.parent_variant_id,
                    price_adjustment: Some(payload.price_adjustment),
                },
                token,
                mode,
            ))
        });
        let Some((parent, validated_runtime_token, mode)) = runtime_parent.as_ref() else {
            continue;
        };
        let parent_variant_id = parent.id.clone();
        let scheduled = *mode == crate::published_policy::PricingMode::Scheduled;

        // -------------------------------------------------------------------------
        // Step 3: Compute paid/free-gift totals.
        // -------------------------------------------------------------------------
        let mut paid_total: f64 = 0.0;
        let mut free_gift_total: f64 = 0.0;
        let mut paid_quantity: i64 = 0;
        let mut total_quantity: i64 = 0;
        let mut paid_unit_prices: Vec<f64> = Vec::new();

        for &idx in &merge_line_indices {
            let line = &lines[idx];
            let qty = *line.quantity() as i64;
            let unit_price = decimal_to_f64(line.cost().amount_per_quantity().amount());
            let line_total = unit_price * (qty as f64);
            total_quantity += qty;
            let step_type = line.step_type().and_then(|a| a.value()).map(|s| s.as_str());
            if is_free_gift_line(step_type) {
                free_gift_total += line_total;
            } else {
                paid_total += line_total;
                paid_quantity += qty;
                for _ in 0..qty.max(0) {
                    paid_unit_prices.push(unit_price);
                }
            }
        }
        let original_total = paid_total + free_gift_total;

        // -------------------------------------------------------------------------
        // Step 4: Calculate effective discount percentage.
        // -------------------------------------------------------------------------
        let fixed_price_display_only =
            has_fixed_price_display_only_marker(lines, &merge_line_indices)
                && parent
                    .price_adjustment
                    .as_ref()
                    .map(|pa| pa.method == PricingMethod::FixedBundlePrice)
                    .unwrap_or(false);

        let effective_price_adjustment = if fixed_price_display_only {
            None
        } else {
            parent.price_adjustment.as_ref()
        };

        let paid_discount_percentage = if let Some(pa) = effective_price_adjustment {
            if pa.method == PricingMethod::BuyXGetY {
                calculate_buy_x_get_y_discount_percentage(
                    pa,
                    &paid_unit_prices,
                    paid_total,
                    paid_total,
                    paid_quantity,
                    presentment_currency_rate,
                )
            } else {
                calculate_discount_percentage(
                    pa,
                    paid_total,
                    paid_total,
                    total_quantity,
                    paid_quantity,
                    presentment_currency_rate,
                )
            }
        } else {
            0.0
        };

        let paid_discount_amount = paid_total * paid_discount_percentage / 100.0;
        let total_discount_amount = (paid_discount_amount + free_gift_total).min(original_total);
        let discount_percentage = if total_discount_amount > 0.0 && original_total > 0.0 {
            rounded_percentage(total_discount_amount, original_total)
        } else {
            0.0
        };

        let source_display_properties = cart_bundle_entry
            .map(|entry| entry.display_properties.clone())
            .unwrap_or_default();

        // -------------------------------------------------------------------------
        // Step 5: Build unique bundle title.
        // -------------------------------------------------------------------------
        let base_name = non_empty(&source_display_properties.bundle_name)
            .unwrap_or_else(|| "Bundle".to_string());

        let count = if let Some((_, count)) = bundle_name_counts
            .iter_mut()
            .find(|(name, _)| name == &base_name)
        {
            *count += 1;
            *count
        } else {
            bundle_name_counts.push((base_name.clone(), 1));
            1
        };
        let bundle_name = if count > 1 {
            format!("{} ({})", base_name, count)
        } else {
            base_name
        };

        // -------------------------------------------------------------------------
        // Step 6: Preserve the retail total used by checkout offer eligibility.
        // -------------------------------------------------------------------------
        let original_total_cents = (original_total * 100.0).round() as i64;

        // -------------------------------------------------------------------------
        // Step 7: Build MERGE operation using schema-generated types.
        // -------------------------------------------------------------------------
        let cart_lines: Vec<schema::CartLineInput> = merge_line_indices
            .iter()
            .map(|&idx| {
                let line = &lines[idx];
                schema::CartLineInput {
                    cart_line_id: line.id().to_string(),
                    quantity: *line.quantity(),
                }
            })
            .collect();

        let Some(secret) = runtime_token_secret else {
            continue;
        };
        let output_token = if scheduled {
            let Some(token) = crate::runtime_token::pricing_receipt_token(
                validated_runtime_token,
                secret,
                offer_group_id,
                1,
                original_total,
                discount_percentage,
            ) else {
                continue;
            };
            token
        } else {
            validated_runtime_token.to_string()
        };

        let mut attributes = vec![
            schema::AttributeOutput {
                key: "_is_bundle_parent".into(),
                value: "true".into(),
            },
            schema::AttributeOutput {
                key: "_bundle_name".into(),
                value: bundle_name.clone(),
            },
            schema::AttributeOutput {
                key: "_bundle_total_retail_cents".into(),
                value: original_total_cents.to_string(),
            },
            schema::AttributeOutput {
                key: "_wolfpackProductBundle:OfferId".into(),
                value: offer_group_id.clone(),
            },
            schema::AttributeOutput {
                key: "_wolfpack_bundle_runtime".into(),
                value: output_token,
            },
        ];
        if let Some(addon_offer_id) = bundle_addon_offer_id {
            attributes.push(schema::AttributeOutput {
                key: "_addon_offer_id".into(),
                value: addon_offer_id,
            });
        }

        if let Some(offer_analytics) = &source_display_properties.offer_analytics {
            if let Ok(value) = serde_json::to_string(offer_analytics) {
                attributes.push(schema::AttributeOutput {
                    key: "_wpb_offer_analytics".into(),
                    value,
                });
            }
        }

        if let Some(box_label) = non_empty(&source_display_properties.box_label) {
            attributes.push(schema::AttributeOutput {
                key: "Box".into(),
                value: box_label,
            });
        }

        if scheduled {}
        if cart_line_messaging.is_enabled {
            let source_items = non_empty(&source_display_properties.items);
            let source_retail_price = non_empty(&source_display_properties.retail_price);
            let source_you_save = non_empty(&source_display_properties.you_save.amount_percentage);
            let source_you_save_amount = non_empty(&source_display_properties.you_save.amount);
            let source_you_save_percentage =
                non_empty(&source_display_properties.you_save.percentage);

            if cart_line_messaging.show_bundle_contains {
                if let Some(value) = source_items {
                    attributes.push(schema::AttributeOutput {
                        key: source_display_properties.labels.items.clone(),
                        value,
                    });
                }
            }

            if cart_line_messaging.show_original_price {
                if let Some(value) = source_retail_price {
                    attributes.push(schema::AttributeOutput {
                        key: source_display_properties.labels.retail_price.clone(),
                        value,
                    });
                }
            }

            if cart_line_messaging.discount_display.is_enabled && !scheduled {
                if let Some(value) = select_you_save_value(
                    &cart_line_messaging.discount_display.format,
                    source_you_save,
                    source_you_save_amount,
                    source_you_save_percentage,
                ) {
                    attributes.push(schema::AttributeOutput {
                        key: source_display_properties.labels.you_save.clone(),
                        value,
                    });
                }
            }
        }

        // Without an adjustment Shopify uses the component sum for MERGE.
        let price = (!scheduled).then_some(schema::PriceAdjustment {
            percentage_decrease: Some(schema::PriceAdjustmentValue {
                value: Decimal::from(discount_percentage),
            }),
        });

        let merge_op = schema::MergeOperation {
            cart_lines,
            parent_variant_id,
            title: Some(bundle_name),
            price,
            attributes: Some(attributes),
            image: None,
        };

        operations.push(schema::CartOperation::Merge(merge_op));

        for &idx in &addon_line_indices {
            processed_lines[idx] = true;
        }

        for &idx in &merge_line_indices {
            processed_lines[idx] = true;
        }
    }

    operations
}

fn select_you_save_value(
    format: &str,
    combined: Option<String>,
    amount: Option<String>,
    percentage: Option<String>,
) -> Option<String> {
    match format {
        "amount_only" => amount.or(combined),
        "percentage_only" => percentage.or(combined),
        _ => combined.or_else(|| match (amount, percentage) {
            (Some(amount), Some(percentage)) => Some(format!("{amount} ({percentage})")),
            (Some(amount), None) => Some(amount),
            (None, Some(percentage)) => Some(percentage),
            (None, None) => None,
        }),
    }
}
