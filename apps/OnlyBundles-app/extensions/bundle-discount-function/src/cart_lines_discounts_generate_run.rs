use super::schema;
use crate::candidates::*;
use crate::candidates::checkout::*;
use shopify_function::prelude::*;
use shopify_function::Result;

#[shopify_function]
fn cart_lines_discounts_generate_run(
    input: schema::cart_lines_discounts_generate_run::Input,
) -> Result<schema::CartLinesDiscountsGenerateRunResult> {
    if crate::candidates::exceeds_bundle_cart_limit(&input) {
        return Ok(schema::CartLinesDiscountsGenerateRunResult { operations: vec![] });
    }
    let has_product_discount_class = input
        .discount()
        .discount_classes()
        .contains(&schema::DiscountClass::Product);

    if !has_product_discount_class {
        return Ok(schema::CartLinesDiscountsGenerateRunResult { operations: vec![] });
    }

    let discount_role = input
        .discount()
        .discount_role()
        .map(|metafield| metafield.value().as_str())
        .unwrap_or("addons");
    let candidates = if discount_role == "subscription_initial" {
        build_subscription_candidates(&input, false, StandardScope)
    } else if discount_role == "subscription_recurring" {
        build_subscription_candidates(&input, true, StandardScope)
    } else if is_checkout_integration_code_mode(&input) {
        let rate = decimal_to_f64(input.presentment_currency_rate());
        let presentment_currency_rate = if rate.is_finite() && rate > 0.0 {
            rate
        } else {
            0.0
        };
        build_checkout_integration_candidates(&input, presentment_currency_rate)
    } else if has_generated_checkout_code(&input) {
        vec![]
    } else {
        build_automatic_addon_candidates(&input, StandardScope)
    };

    if candidates.is_empty() {
        return Ok(schema::CartLinesDiscountsGenerateRunResult { operations: vec![] });
    }

    Ok(schema::CartLinesDiscountsGenerateRunResult {
        operations: vec![schema::CartOperation::ProductDiscountsAdd(
            schema::ProductDiscountsAddOperation {
                selection_strategy: schema::ProductDiscountSelectionStrategy::All,
                candidates,
            },
        )],
    })
}

#[cfg(test)]
#[path = "cart_lines_discounts_generate_run_tests.rs"]
mod tests;
