use shopify_function::wasm_api::Value;

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum PricingMode {
    Standard,
    Scheduled,
}

/// Shopify parses the JSON metafield; only the requested current record is read.
pub fn pricing_mode(value: Option<&Value>, bundle_id: &str, revision: &str) -> Option<PricingMode> {
    if bundle_id.is_empty() || revision.is_empty() {
        return None;
    }
    let policy = value?.get_obj_prop(bundle_id);
    if policy.get_obj_prop("revision").as_string()?.as_str() != revision {
        return None;
    }
    match policy.get_obj_prop("pricingMode").as_string()?.as_str() {
        "standard" => Some(PricingMode::Standard),
        "scheduled" => Some(PricingMode::Scheduled),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn check(json: &str, bundle: &str, revision: &str) -> Option<PricingMode> {
        let context = shopify_function::wasm_api::Context::new_with_input(
            serde_json::from_str(json).unwrap(),
        );
        pricing_mode(Some(&context.input_get().unwrap()), bundle, revision)
    }
    #[test]
    fn only_exact_current_records_authorize() {
        assert_eq!(
            check(
                r#"{"bundle":{"revision":"r","pricingMode":"scheduled"},"other":"old"}"#,
                "bundle",
                "r"
            ),
            Some(PricingMode::Scheduled)
        );
        for value in [
            r#"{"bundle":"r"}"#,
            r#"{"nested":{"bundle":{"revision":"r","pricingMode":"scheduled"}}}"#,
            r#"{"bundle":{"revision":"r","pricingMode":"unknown"}}"#,
            r#"{"bundle":{"revision":"stale","pricingMode":"scheduled"}}"#,
        ] {
            assert_eq!(check(value, "bundle", "r"), None);
        }
    }
}
