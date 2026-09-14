use bundle_cart_transform_rs::{
    cart_transform_run, runtime_token::sign_runtime_token_for_test, schema,
};
use serde_json::{json, Value};
use shopify_function::run_function_with_input;

fn input(mode: &str) -> Value {
    let token = sign_runtime_token_for_test(&json!({
        "version": 1, "shop": "test.myshopify.com", "bundleId": "bundle", "revision": "r1",
        "offerGroupId": "group", "parentVariantId": "gid://shopify/ProductVariant/9", "countryRule": "", "componentQuantities": [2],
        "components": [{"variantId": "gid://shopify/ProductVariant/1", "quantity": 2}],
        "addons": [], "priceAdjustment": {"method": "percentage_off", "value": 20}
    }).to_string(), "secret");
    json!({
        "presentmentCurrencyRate": "1.0", "localization": {"country": {"isoCode": "CA"}},
        "shop": {"ppbPolicyRevisions": {"value": json!({"bundle": {"revision": "r1", "pricingMode": mode}})}},
        "cartTransform": {"runtimeConfiguration": {"value": {"runtimeTokenSecret":"secret"}}},
        "cart": {"bundleDetails": {"value": json!([{"key": "group", "runtimeToken": token, "displayProperties": {}}]).to_string()},
        "lines": [{"id": "line1", "quantity": 2, "wolfpackProductBundleOfferId": {"value": "group_0"},
            "stepType": null, "lineAuthorization": null, "sellingPlanAllocation": null,
            "cost": {"amountPerQuantity": {"amount": "10.00"}},
            "merchandise": {"__typename": "ProductVariant", "id": "gid://shopify/ProductVariant/1", "product": {"id": "gid://shopify/Product/1", "title": "Component"},
                "component_reference": null, "component_quantities": null, "component_pricing": null, "price_adjustment": null}
        }]}
    })
}

#[test]
fn scheduled_merge_leaves_price_for_native_discount_and_attaches_signed_receipt() {
    let output =
        run_function_with_input(cart_transform_run, &input("scheduled").to_string()).unwrap();
    let schema::CartOperation::Merge(merge) = &output.operations[0] else {
        panic!("expected merge")
    };
    assert!(merge.price.is_none());
    let attributes = merge.attributes.as_ref().unwrap();
    let token = attributes
        .iter()
        .find(|a| a.key == "_wolfpack_bundle_runtime")
        .unwrap()
        .value
        .as_str();
    assert!(
        bundle_cart_transform_rs::runtime_token::verify_runtime_token(token, "secret").is_some()
    );
    assert!(!attributes
        .iter()
        .any(|a| a.key == "_bundle_total_savings_cents"));
}

#[test]
fn standard_merge_retains_cart_transform_discount() {
    let output =
        run_function_with_input(cart_transform_run, &input("standard").to_string()).unwrap();
    let schema::CartOperation::Merge(merge) = &output.operations[0] else {
        panic!("expected merge")
    };
    assert_eq!(
        merge
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
    assert!(!merge.attributes.as_ref().unwrap().iter().any(|a| matches!(
        a.key.as_str(),
        "_bundle_components"
            | "_bundle_component_count"
            | "_bundle_total_savings_cents"
            | "_bundle_total_price_cents"
            | "_bundle_discount_percent"
    )));
}

#[test]
fn direct_scheduled_parent_expands_without_locked_in_savings() {
    let mut input = input("scheduled");
    input["cart"]["bundleDetails"] = Value::Null;
    let line = &mut input["cart"]["lines"][0];
    line["quantity"] = json!(1);
    line["wolfpackProductBundleOfferId"] = Value::Null;
    line["cost"]["amountPerQuantity"]["amount"] = json!("20.00");
    line["merchandise"]["id"] = json!("gid://shopify/ProductVariant/9");
    line["merchandise"]["component_reference"] =
        json!({"value": "[\"gid://shopify/ProductVariant/1\"]"});
    line["merchandise"]["component_quantities"] = json!({"value": "[2]"});
    line["merchandise"]["price_adjustment"] = json!({"value": json!({"shop":"test.myshopify.com", "bundleId":"bundle", "revision":"r1", "countryRule":"", "componentQuantities":[2], "method":"percentage_off", "value":20}).to_string()});
    let output = run_function_with_input(cart_transform_run, &input.to_string()).unwrap();
    let schema::CartOperation::Expand(expand) = &output.operations[0] else {
        panic!("expected expand")
    };
    assert!(expand.price.is_none());
    let attributes = expand.expanded_cart_items[0].attributes.as_ref().unwrap();
    assert!(attributes
        .iter()
        .any(|attribute| attribute.key == "_wolfpack_bundle_runtime"));
    let mut multiple = input.clone();
    multiple["cart"]["lines"][0]["quantity"] = json!(3);
    let multi_output = run_function_with_input(cart_transform_run, &multiple.to_string()).unwrap();
    let schema::CartOperation::Expand(multi_expand) = &multi_output.operations[0] else {
        panic!("expected expand")
    };
    assert_eq!(multi_expand.expanded_cart_items[0].quantity, 1);
    input["shop"]["ppbPolicyRevisions"] = Value::Null;
    assert!(
        run_function_with_input(cart_transform_run, &input.to_string())
            .unwrap()
            .operations
            .is_empty()
    );
}

#[test]
fn rejects_excess_bundle_lines_before_authorization_work() {
    let mut value = input("scheduled");
    let line = value["cart"]["lines"][0].clone();
    value["cart"]["lines"] = json!(vec![line.clone(); 11]);
    assert!(run_function_with_input(cart_transform_run, &value.to_string()).is_err());
    value["cart"]["lines"] = json!(vec![line; 10]);
    assert!(run_function_with_input(cart_transform_run, &value.to_string()).is_ok());
    for line in value["cart"]["lines"].as_array_mut().unwrap() {
        line["wolfpackProductBundleOfferId"] = Value::Null;
    }
    let mut addon = value["cart"]["lines"][0].clone();
    addon["stepType"] = json!({"value": "addon:PERCENTAGE:20"});
    value["cart"]["lines"] = json!(vec![addon; 11]);
    assert!(run_function_with_input(cart_transform_run, &value.to_string()).is_err());
    let mut ordinary = value["cart"]["lines"][0].clone();
    ordinary["stepType"] = Value::Null;
    value["cart"]["lines"] = json!(vec![ordinary; 100]);
    assert!(run_function_with_input(cart_transform_run, &value.to_string()).is_ok());
}
