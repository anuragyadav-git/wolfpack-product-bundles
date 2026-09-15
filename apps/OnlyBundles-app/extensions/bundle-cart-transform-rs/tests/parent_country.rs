use bundle_cart_transform_rs::{cart_transform_run, schema};
use serde_json::{json, Value};
use shopify_function::run_function_with_input;

fn run(country: &str, pricing: Option<Value>) -> schema::FunctionRunResult {
    let input = json!({
        "presentmentCurrencyRate": "1.0",
        "localization": {"country": {"isoCode": country}},
        "shop": {"ppbPolicyRevisions": {"value": json!({"bundle-1":{"revision":"rev-1","pricingMode":"standard"}})}},
        "cartTransform": {"runtimeConfiguration": null},
        "cart": {"bundleDetails": null, "lines": [{
            "id": "parent-line", "quantity": 1,
            "wolfpackProductBundleOfferId": null, "lineAuthorization": null,
            "stepType": null, "sellingPlanAllocation": null,
            "cost": {"amountPerQuantity": {"amount": "100"}},
            "merchandise": {"__typename": "ProductVariant", "id": "gid://shopify/ProductVariant/1",
                "product": {"id": "gid://shopify/Product/1", "title": "Bundle"},
                "component_reference": {"value": "[\"gid://shopify/ProductVariant/2\"]"},
                "component_quantities": {"value": "[1]"},
                "component_pricing": null,
                "price_adjustment": pricing.map(|mut value| { if value.get("componentQuantities").is_none() { value["componentQuantities"] = json!([1]); } value["shop"] = json!("test.myshopify.com"); value["bundleId"] = json!("bundle-1"); value["revision"] = json!("rev-1"); json!({"value": value.to_string()}) })
            }
        }]}
    });
    run_function_with_input(cart_transform_run, &input.to_string()).unwrap()
}

#[test]
fn parent_country_policy_controls_expansion_without_display_data() {
    for (rule, country, eligible) in [
        ("include:CA", "CA", true),
        ("include:CA", "US", false),
        ("exclude:CA", "CA", false),
        ("exclude:CA", "US", true),
        ("", "US", true),
        ("invalid", "US", false),
        ("other:US", "US", false),
    ] {
        let output = run(
            country,
            Some(json!({"countryRule": rule, "method": "percentage_off", "value": 20})),
        );
        assert_eq!(
            output.operations.len(),
            usize::from(eligible),
            "{rule}, {country}"
        );
        if eligible {
            let schema::CartOperation::LineExpand(operation) = &output.operations[0] else {
                panic!("expected expand")
            };
            assert_eq!(
                operation
                    .price
                    .as_ref()
                    .unwrap()
                    .percentage_decrease
                    .as_ref()
                    .unwrap()
                    .value
                    .to_string(),
                "20.0"
            );
        }
    }
}

#[test]
fn parent_without_an_explicit_valid_country_policy_fails_closed() {
    for pricing in [
        None,
        Some(json!({"method": "percentage_off", "value": 20})),
        Some(json!({"countryRule": null})),
        Some(json!({"countryRule": 123})),
    ] {
        assert!(run("US", pricing).operations.is_empty());
    }
}

#[test]
fn invalid_optional_discount_does_not_erase_authorized_composition() {
    let output = run(
        "CA",
        Some(json!({"countryRule": "include:CA", "method": "invalid", "value": "invalid"})),
    );
    assert_eq!(output.operations.len(), 1);
    let schema::CartOperation::LineExpand(operation) = &output.operations[0] else {
        panic!("expected expand")
    };
    assert!(operation.price.is_none());
}

#[test]
fn critical_quantities_are_required_and_positive() {
    for quantities in [
        json!(null),
        json!([]),
        json!([0]),
        json!([-1]),
        json!([1, 2]),
        json!("[1]"),
    ] {
        assert!(run(
            "CA",
            Some(json!({"countryRule":"", "componentQuantities":quantities}))
        )
        .operations
        .is_empty());
    }
}
