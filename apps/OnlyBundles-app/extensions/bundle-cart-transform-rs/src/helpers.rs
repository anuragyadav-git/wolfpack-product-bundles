use crate::types::Operator;
use shopify_function::scalars::Decimal;

/// Convert a shopify_function Decimal scalar to f64.
///
/// Decimal stores its value as a string representation (e.g. "29.99", "1.35").
/// We format it via Display and parse; returns 0.0 on any error or non-finite value.
pub fn decimal_to_f64(d: &Decimal) -> f64 {
    format!("{d}")
        .parse::<f64>()
        .ok()
        .filter(|v| v.is_finite())
        .unwrap_or(0.0)
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
