use crate::types::Operator;
use shopify_function::scalars::Decimal;

/// Convert a shopify_function Decimal scalar to f64.
///
/// Shopify's scalar owns conversion; invalid monetary inputs fail closed.
pub fn decimal_to_f64(d: &Decimal) -> f64 {
    let value = d.as_f64();
    if value.is_finite() {
        value
    } else {
        0.0
    }
}

/// Parse a JSON string into `T`, returning `T::default()` on any error.
pub fn parse_json_or_default<T>(json: Option<&str>) -> T
where
    T: serde::de::DeserializeOwned + Default,
{
    json.and_then(|v| serde_json::from_str(v).ok())
        .unwrap_or_default()
}

/// Parse the canonical pricing-condition operator vocabulary.
/// Unknown and non-canonical values fail closed.
pub fn normalize_operator(operator: &str) -> Option<Operator> {
    match operator {
        "gte" => Some(Operator::Gte),
        "gt" => Some(Operator::Gt),
        "lte" => Some(Operator::Lte),
        "lt" => Some(Operator::Lt),
        "eq" => Some(Operator::Eq),
        _ => None,
    }
}

/// Returns true when the cart line's `_bundle_step_type` attribute is `free_gift`.
pub fn is_free_gift_line(step_type_value: Option<&str>) -> bool {
    step_type_value == Some("free_gift")
}

/// Returns true when the cart line's `_bundle_step_type` attribute is `addon`.
pub fn is_addon_line(step_type_value: Option<&str>) -> bool {
    step_type_value
        .map(|value| value == "addon" || value.starts_with("addon:"))
        .unwrap_or(false)
}

#[cfg(test)]
#[path = "helpers_tests.rs"]
mod tests;
/// Evaluate the canonical country rule published by the server for both bundle paths.
pub fn country_is_eligible(rule: &str, current_country: &str) -> bool {
    if rule.is_empty() {
        return true;
    }
    let Some((mode, countries)) = rule.split_once(':') else {
        return false;
    };
    let matches = countries
        .split(',')
        .any(|country| country == current_country);
    match mode {
        "include" => matches,
        "exclude" => !matches,
        _ => false,
    }
}
