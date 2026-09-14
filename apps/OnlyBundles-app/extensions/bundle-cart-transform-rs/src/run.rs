use shopify_function::prelude::*;
use shopify_function::Result;

use crate::expand::process_expand_operations;
use crate::helpers::decimal_to_f64;
use crate::merge::process_merge_operations;
use crate::schema;
use crate::types::CartTransformRuntimeConfiguration;

/// Inner cart transform logic — called by the #[shopify_function] wrapper and
/// directly by integration tests via run_function_with_input(cart_transform_run, json).
pub fn cart_transform_run(input: schema::run::Input) -> Result<schema::FunctionRunResult> {
    if input.cart().lines().is_empty() {
        return Ok(schema::FunctionRunResult { operations: vec![] });
    }

    // Whole-cart bound, before signature verification. Native blockOnFailure rejects bypasses.
    // Keep aligned with MAX_BUNDLE_CART_LINES in app/lib/cart-bundle-details.ts.
    let bundle_lines = input.cart().lines().iter().filter(|line| {
        line.wolfpack_product_bundle_offer_id().and_then(|a| a.value()).is_some()
            || line.step_type().and_then(|a| a.value()).is_some_and(|v| v.starts_with("addon"))
            || line.line_authorization().and_then(|a| a.value()).is_some()
            || matches!(line.merchandise(), schema::run::input::cart::lines::Merchandise::ProductVariant(v) if v.component_reference().is_some())
    }).take(11).count();
    if bundle_lines > 10 { return Err("BUNDLE_CART_LINE_LIMIT_EXCEEDED".into()); }

    // presentmentCurrencyRate is Decimal! — convert to f64 once.
    // Returns 0.0 if non-finite or <= 0 so amount-based discount paths bail out cleanly.
    let rate = decimal_to_f64(input.presentment_currency_rate());
    let presentment_currency_rate = if rate.is_finite() && rate > 0.0 {
        rate
    } else {
        0.0
    };

    let mut processed_lines: Vec<bool> = input
        .cart()
        .lines()
        .iter()
        .map(|line| line.selling_plan_allocation().is_some())
        .collect();
    let runtime_configuration = CartTransformRuntimeConfiguration::from_value(
        input
            .cart_transform()
            .runtime_configuration()
            .map(|metafield| metafield.value()),
    );
    let runtime_token_secret = (!runtime_configuration.runtime_token_secret.trim().is_empty())
        .then_some(runtime_configuration.runtime_token_secret.as_str());

    // Pass 1: MERGE — component lines grouped by `_wolfpackProductBundle:OfferId`
    let mut operations = process_merge_operations(
        &input,
        presentment_currency_rate,
        &mut processed_lines,
        &runtime_configuration.bundle_cart_line_messaging,
        runtime_token_secret,
    );

    // Pass 2: EXPAND — Flex Bundle parent variants (skips MERGE-processed lines)
    operations.extend(process_expand_operations(
        &input,
        &processed_lines,
        presentment_currency_rate,
        runtime_token_secret,
    ));

    Ok(schema::FunctionRunResult { operations })
}

/// WASM export — thin wrapper so #[shopify_function] can generate the export
/// while keeping cart_transform_run directly testable.
#[shopify_function]
fn run(input: schema::run::Input) -> Result<schema::FunctionRunResult> {
    cart_transform_run(input)
}
