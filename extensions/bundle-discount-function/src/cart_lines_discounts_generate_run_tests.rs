use super::*;
use crate::runtime_token::sign_runtime_token_for_test;
use shopify_function::run_function_with_input;

fn test_runtime_secret() -> String {
    std::env::var("WPB_TEST_RUNTIME_SECRET")
        .unwrap_or_else(|_| "wpb-runtime-token-test-secret".to_string())
}

fn run_discount(input: &str) -> schema::CartLinesDiscountsGenerateRunResult {
    let mut value: serde_json::Value =
        serde_json::from_str(input).expect("discount test input should be valid JSON");
    value["localization"] = serde_json::json!({ "country": { "isoCode": "CA" } });
    run_function_with_input(cart_lines_discounts_generate_run, &value.to_string())
        .expect("should run")
}

fn addon_runtime_payload() -> String {
    serde_json::json!({
        "version": 1,
        "shop": "test-shop.myshopify.com",
        "bundleId": "bundle-1",
        "bundleType": "full_page",
        "offerGroupId": "FBP-bundle-1_ABC",
        "parentVariantId": "gid://shopify/ProductVariant/999",
        "bundleName": "Runtime Bundle",
        "components": [
            { "variantId": "gid://shopify/ProductVariant/101", "quantity": 1 }
        ],
        "addons": [
            {
                "variantId": "gid://shopify/ProductVariant/201",
                "quantity": 1,
                "discount": { "type": "PERCENTAGE", "value": 10 }
            }
        ],
        "priceAdjustment": { "method": "percentage_off", "value": 20 }
    })
    .to_string()
}

fn addon_runtime_payload_for(addons: serde_json::Value) -> String {
    serde_json::json!({
        "version": 1,
        "shop": "test-shop.myshopify.com",
        "bundleId": "bundle-1",
        "bundleType": "full_page",
        "offerGroupId": "FBP-bundle-1_ABC",
        "parentVariantId": "gid://shopify/ProductVariant/999",
        "bundleName": "Runtime Bundle",
        "components": [
            { "variantId": "gid://shopify/ProductVariant/101", "quantity": 1 }
        ],
        "addons": addons,
        "priceAdjustment": { "method": "percentage_off", "value": 20 }
    })
    .to_string()
}

fn addon_line(
    id: &str,
    variant_id: &str,
    quantity: i64,
    percentage: f64,
    runtime_token: &str,
) -> serde_json::Value {
    serde_json::json!({
        "id": id,
        "quantity": quantity,
        "wolfpackProductBundleOfferId": { "value": "FBP-bundle-1_ABC_2" },
        "runtimeToken": { "value": runtime_token },
        "stepType": { "value": format!("addon:PERCENTAGE:{percentage}") },
        "merchandise": {
            "__typename": "ProductVariant",
            "id": variant_id,
            "component_parents": null
        },
        "cost": { "amountPerQuantity": { "amount": "30.00" } }
    })
}

fn run_automatic_addon_lines(
    lines: Vec<serde_json::Value>,
    runtime_secret: &str,
    entered_discount_codes: Vec<&str>,
) -> schema::CartLinesDiscountsGenerateRunResult {
    let input = serde_json::json!({
        "localization": { "country": { "isoCode": "CA" } },
        "cart": { "lines": lines },
        "discount": {
            "discountClasses": ["PRODUCT"],
            "runtimeTokenSecret": { "value": runtime_secret },
            "checkoutIntegrationConfig": null
        },
        "enteredDiscountCodes": entered_discount_codes
            .into_iter()
            .map(|code| serde_json::json!({ "code": code }))
            .collect::<Vec<_>>(),
        "triggeringDiscountCode": null,
        "shop":{"ppbPolicyRevisions":{"value":"{\"bundle-1\":\"rev-1\"}"}},"presentmentCurrencyRate": "1.0"
    })
    .to_string();

    run_discount(input.as_str())
}

#[test]
fn rejects_addon_discount_for_ineligible_shopify_country() {
    let runtime_secret = test_runtime_secret();
    let mut payload: serde_json::Value = serde_json::from_str(&addon_runtime_payload())
        .expect("runtime payload should be valid JSON");
    payload["countryRule"] = serde_json::json!("include:US");
    let runtime_token = sign_runtime_token_for_test(&payload.to_string(), &runtime_secret);

    let output = run_automatic_addon_lines(
        vec![addon_line(
            "gid://shopify/CartLine/addon",
            "gid://shopify/ProductVariant/201",
            1,
            10.0,
            &runtime_token,
        )],
        &runtime_secret,
        vec![],
    );

    assert!(output.operations.is_empty());
}

fn run_subscription_lines_with_role(
    plan_ids: &[&str],
    component_count: usize,
    recurring_bundle_discount: bool,
    discount_role: &str,
) -> schema::CartLinesDiscountsGenerateRunResult {
    let runtime_secret = test_runtime_secret();
    let payload = serde_json::json!({
        "version": 1,
        "shop": "test-shop.myshopify.com",
        "bundleId": "bundle-1",
        "bundleType": "product_page",
        "offerGroupId": "bundle-1_SESSION",
        "parentVariantId": "gid://shopify/ProductVariant/999",
        "bundleName": "Subscription Bundle",
        "components": [
            { "variantId": "gid://shopify/ProductVariant/101", "quantity": 1 },
            { "variantId": "gid://shopify/ProductVariant/102", "quantity": 1 }
        ],
        "addons": [],
        "priceAdjustment": { "method": "percentage_off", "value": 20 },
        "subscription": {
            "sellingPlanGroupId": "gid://shopify/SellingPlanGroup/1",
            "sellingPlanId": "gid://shopify/SellingPlan/1",
            "recurringBundleDiscount": recurring_bundle_discount
        }
    })
    .to_string();
    let runtime_token = sign_runtime_token_for_test(&payload, &runtime_secret);
    let lines = plan_ids.iter().take(component_count).enumerate().map(|(index, plan_id)| serde_json::json!({
        "id": format!("gid://shopify/CartLine/{index}"),
        "quantity": 1,
        "wolfpackProductBundleOfferId": { "value": format!("bundle-1_SESSION_{}", index + 1) },
        "runtimeToken": { "value": runtime_token },
        "stepType": null,
        "sellingPlanAllocation": { "sellingPlan": { "id": plan_id } },
        "merchandise": {
            "__typename": "ProductVariant",
            "id": format!("gid://shopify/ProductVariant/{}", 101 + index),
            "component_parents": null
        },
        "cost": { "amountPerQuantity": { "amount": "50.00" } }
    })).collect::<Vec<_>>();
    let input = serde_json::json!({
        "cart": { "lines": lines },
        "discount": {
            "discountClasses": ["PRODUCT"],
            "runtimeTokenSecret": { "value": runtime_secret },
            "discountRole": { "value": discount_role },
            "checkoutIntegrationConfig": null
        },
        "enteredDiscountCodes": [],
        "triggeringDiscountCode": null,
        "shop":{"ppbPolicyRevisions":{"value":"{\"bundle-1\":\"rev-1\"}"}},"presentmentCurrencyRate": "1.0"
    }).to_string();
    run_discount(&input)
}

fn run_subscription_lines(
    plan_ids: &[&str],
    component_count: usize,
) -> schema::CartLinesDiscountsGenerateRunResult {
    run_subscription_lines_with_role(plan_ids, component_count, false, "subscription_initial")
}

#[test]
fn subscription_initial_role_discounts_exact_signed_plan_group_once() {
    let output = run_subscription_lines(
        &["gid://shopify/SellingPlan/1", "gid://shopify/SellingPlan/1"],
        2,
    );
    assert_eq!(output.operations.len(), 1);
    let schema::CartOperation::ProductDiscountsAdd(operation) = &output.operations[0] else {
        panic!("expected product discounts add operation")
    };
    assert_eq!(operation.candidates.len(), 1);
    assert_eq!(operation.candidates[0].targets.len(), 2);
}

#[test]
fn subscription_initial_role_rejects_mixed_plan_and_partial_groups() {
    assert!(run_subscription_lines(
        &["gid://shopify/SellingPlan/1", "gid://shopify/SellingPlan/2"],
        2,
    )
    .operations
    .is_empty());
    assert!(run_subscription_lines(&["gid://shopify/SellingPlan/1"], 1)
        .operations
        .is_empty());
}

#[test]
fn subscription_roles_require_the_signed_recurring_mode() {
    assert!(run_subscription_lines_with_role(
        &["gid://shopify/SellingPlan/1", "gid://shopify/SellingPlan/1"],
        2,
        true,
        "subscription_initial",
    )
    .operations
    .is_empty());
    assert_eq!(
        run_subscription_lines_with_role(
            &["gid://shopify/SellingPlan/1", "gid://shopify/SellingPlan/1"],
            2,
            true,
            "subscription_recurring",
        )
        .operations
        .len(),
        1
    );
    assert!(run_subscription_lines_with_role(
        &["gid://shopify/SellingPlan/1", "gid://shopify/SellingPlan/1"],
        2,
        false,
        "subscription_recurring",
    )
    .operations
    .is_empty());
}

#[test]
fn parses_partial_percentage_addon_token() {
    assert_eq!(
        parse_addon_percentage(Some("addon:PERCENTAGE:10")),
        Some(10.0)
    );
}

#[test]
fn caps_full_discount_at_one_hundred_percent() {
    assert_eq!(
        parse_addon_percentage(Some("addon:PERCENTAGE:125")),
        Some(100.0)
    );
}

#[test]
fn ignores_invalid_addon_tokens() {
    assert_eq!(parse_addon_percentage(Some("addon:PERCENTAGE")), None);
    assert_eq!(parse_addon_percentage(Some("addon:FIXED:10")), None);
    assert_eq!(parse_addon_percentage(Some("free_gift")), None);
    assert_eq!(parse_addon_percentage(Some("addon:PERCENTAGE:0")), None);
    assert_eq!(parse_addon_percentage(None), None);
}

#[test]
fn ignores_partial_and_full_addon_discount_candidates_without_runtime_token() {
    let input = r#"{
        "cart": {
            "lines": [
                {
                    "id": "gid://shopify/CartLine/paid",
                    "quantity": 1,
                    "wolfpackProductBundleOfferId": null,
                    "stepType": null,
                    "merchandise": {
                        "__typename": "ProductVariant",
                        "id": "gid://shopify/ProductVariant/paid",
                        "component_parents": null
                    },
                    "cost": { "amountPerQuantity": { "amount": "10.00" } }
                },
                {
                    "id": "gid://shopify/CartLine/addon-partial",
                    "quantity": 1,
                    "wolfpackProductBundleOfferId": null,
                    "stepType": { "value": "addon:PERCENTAGE:10" },
                    "merchandise": {
                        "__typename": "ProductVariant",
                        "id": "gid://shopify/ProductVariant/addon-partial",
                        "component_parents": null
                    },
                    "cost": { "amountPerQuantity": { "amount": "10.00" } }
                },
                {
                    "id": "gid://shopify/CartLine/addon-free",
                    "quantity": 1,
                    "wolfpackProductBundleOfferId": null,
                    "stepType": { "value": "addon:PERCENTAGE:100" },
                    "merchandise": {
                        "__typename": "ProductVariant",
                        "id": "gid://shopify/ProductVariant/addon-free",
                        "component_parents": null
                    },
                    "cost": { "amountPerQuantity": { "amount": "10.00" } }
                },
                {
                    "id": "gid://shopify/CartLine/malformed-addon",
                    "quantity": 1,
                    "wolfpackProductBundleOfferId": null,
                    "stepType": { "value": "addon:PERCENTAGE" },
                    "merchandise": {
                        "__typename": "ProductVariant",
                        "id": "gid://shopify/ProductVariant/malformed-addon",
                        "component_parents": null
                    },
                    "cost": { "amountPerQuantity": { "amount": "10.00" } }
                }
            ]
        },
        "discount": {
            "discountClasses": ["PRODUCT"],
            "checkoutIntegrationConfig": null
        },
        "enteredDiscountCodes": [],
        "triggeringDiscountCode": null,
        "shop":{"ppbPolicyRevisions":{"value":"{\"bundle-1\":\"rev-1\"}"}},"presentmentCurrencyRate": "1.0"
    }"#;

    let output: schema::CartLinesDiscountsGenerateRunResult = run_discount(input);

    assert!(output.operations.is_empty());
}

#[test]
fn emits_addon_discount_only_when_runtime_token_authorizes_line() {
    let runtime_secret = test_runtime_secret();
    let runtime_token = sign_runtime_token_for_test(&addon_runtime_payload(), &runtime_secret);
    let input = format!(
        r#"{{
        "cart": {{
            "lines": [
                {{
                    "id": "gid://shopify/CartLine/addon",
                    "quantity": 1,
                    "wolfpackProductBundleOfferId": {{ "value": "FBP-bundle-1_ABC_2" }},
                    "runtimeToken": {{ "value": "{runtime_token}" }},
                    "stepType": {{ "value": "addon:PERCENTAGE:10" }},
                    "merchandise": {{
                        "__typename": "ProductVariant",
                        "id": "gid://shopify/ProductVariant/201",
                        "component_parents": null
                    }},
                    "cost": {{ "amountPerQuantity": {{ "amount": "10.00" }} }}
                }}
            ]
        }},
        "discount": {{
            "discountClasses": ["PRODUCT"],
            "runtimeTokenSecret": {{ "value": "{runtime_secret}" }},
            "checkoutIntegrationConfig": null
        }},
        "enteredDiscountCodes": [],
        "triggeringDiscountCode": null,
        "shop":{{"ppbPolicyRevisions":{{"value":"{{\"bundle-1\":\"rev-1\"}}"}}}},"presentmentCurrencyRate": "1.0"
    }}"#
    );

    let output: schema::CartLinesDiscountsGenerateRunResult = run_discount(input.as_str());

    assert_eq!(output.operations.len(), 1);
    let add_operation = match &output.operations[0] {
        schema::CartOperation::ProductDiscountsAdd(operation) => operation,
        unexpected => panic!("expected product discounts add operation, got {unexpected:?}"),
    };
    assert_eq!(add_operation.candidates.len(), 1);
    assert_eq!(
        add_operation.candidates[0].message.as_deref(),
        Some(ADDON_DISCOUNT_MESSAGE)
    );
    let percentage = match &add_operation.candidates[0].value {
        schema::ProductDiscountCandidateValue::Percentage(percentage) => {
            percentage.value.to_string()
        }
        unexpected => panic!("expected percentage discount value, got {unexpected:?}"),
    };
    assert_eq!(percentage, "10.0");
}

#[test]
fn emits_ppb_v2_addon_discount_only_for_current_shopify_policy() {
    let runtime_secret = test_runtime_secret();
    let bundle_token = sign_runtime_token_for_test(
        &serde_json::json!({
            "version": 2, "kind": "bundle", "shop": "test-shop.myshopify.com",
            "bundleId": "bundle-1", "revision": "rev-1",
            "groups": [{ "id": "addon-step", "role": "addon", "minQuantity": 0, "maxQuantity": 1 }],
            "parentVariantId": "gid://shopify/ProductVariant/999",
            "priceAdjustment": { "method": "percentage_off", "value": 20 }
        })
        .to_string(),
        &runtime_secret,
    );
    let line_token = sign_runtime_token_for_test(
        &serde_json::json!({
            "version": 2, "kind": "line", "shop": "test-shop.myshopify.com",
            "bundleId": "bundle-1", "revision": "rev-1",
            "groupId": "addon-step",
            "productId": "gid://shopify/Product/2", "role": "addon",
            "maxQuantity": 1, "maxDiscountPercentage": 10
        })
        .to_string(),
        &runtime_secret,
    );
    let input = serde_json::json!({
        "cart": { "lines": [{
            "id": "gid://shopify/CartLine/addon", "quantity": 1,
            "wolfpackProductBundleOfferId": { "value": "MIX-bundle-1_ABC_2" },
            "runtimeToken": { "value": bundle_token },
            "lineAuthorization": { "value": line_token },
            "stepType": { "value": "addon:PERCENTAGE:10" },
            "sellingPlanAllocation": null,
            "merchandise": {
                "__typename": "ProductVariant", "id": "gid://shopify/ProductVariant/201",
                "product": { "id": "gid://shopify/Product/2", "ppbComponentPolicies": { "value": "{\"bundle-1\":\"rev-1\"}" } },
                "component_parents": null
            },
            "cost": { "amountPerQuantity": { "amount": "10.00" } }
        }] },
        "discount": {
            "discountClasses": ["PRODUCT"],
            "runtimeTokenSecret": { "value": runtime_secret },
            "discountRole": null, "checkoutIntegrationConfig": null
        },
        "enteredDiscountCodes": [], "triggeringDiscountCode": null,
        "shop":{"ppbPolicyRevisions":{"value":"{\"bundle-1\":\"rev-1\"}"}},"presentmentCurrencyRate": "1.0"
    });
    let output = run_discount(&input.to_string());
    assert_eq!(output.operations.len(), 1);
}

#[test]
fn rejects_ppb_v2_addon_lines_split_beyond_signed_quantity() {
    let runtime_secret = test_runtime_secret();
    let bundle_token = sign_runtime_token_for_test(
        &serde_json::json!({
            "version": 2, "kind": "bundle", "shop": "test-shop.myshopify.com",
            "bundleId": "bundle-1", "revision": "rev-1",
            "groups": [{ "id": "addon-step", "role": "addon", "minQuantity": 0, "maxQuantity": 2 }],
            "parentVariantId": "gid://shopify/ProductVariant/999",
            "priceAdjustment": { "method": "percentage_off", "value": 20 }
        })
        .to_string(),
        &runtime_secret,
    );
    let line_token = sign_runtime_token_for_test(
        &serde_json::json!({
            "version": 2, "kind": "line", "shop": "test-shop.myshopify.com",
            "bundleId": "bundle-1", "revision": "rev-1",
            "groupId": "addon-step",
            "productId": "gid://shopify/Product/2", "role": "addon",
            "maxQuantity": 1, "maxDiscountPercentage": 10
        })
        .to_string(),
        &runtime_secret,
    );
    let line = |id: &str| {
        serde_json::json!({
            "id": id, "quantity": 1,
            "wolfpackProductBundleOfferId": { "value": "MIX-bundle-1_ABC_2" },
            "runtimeToken": { "value": bundle_token },
            "lineAuthorization": { "value": line_token },
            "stepType": { "value": "addon:PERCENTAGE:10" },
            "sellingPlanAllocation": null,
            "merchandise": {
                "__typename": "ProductVariant", "id": "gid://shopify/ProductVariant/201",
                "product": { "id": "gid://shopify/Product/2", "ppbComponentPolicies": { "value": "{\"bundle-1\":\"rev-1\"}" } },
                "component_parents": null
            },
            "cost": { "amountPerQuantity": { "amount": "10.00" } }
        })
    };
    let input = serde_json::json!({
        "cart": { "lines": [line("addon-1"), line("addon-2")] },
        "discount": {
            "discountClasses": ["PRODUCT"],
            "runtimeTokenSecret": { "value": runtime_secret },
            "discountRole": null, "checkoutIntegrationConfig": null
        },
        "enteredDiscountCodes": [], "triggeringDiscountCode": null,
        "shop":{"ppbPolicyRevisions":{"value":"{\"bundle-1\":\"rev-1\"}"}},"presentmentCurrencyRate": "1.0"
    });
    let output = run_discount(&input.to_string());
    assert!(output.operations.is_empty());
}

#[test]
fn emits_one_hundred_percent_addon_candidate_with_native_message() {
    let runtime_secret = test_runtime_secret();
    let payload = addon_runtime_payload_for(serde_json::json!([
        {
            "variantId": "gid://shopify/ProductVariant/201",
            "quantity": 1,
            "discount": { "type": "PERCENTAGE", "value": 100 }
        }
    ]));
    let runtime_token = sign_runtime_token_for_test(&payload, &runtime_secret);
    let output = run_automatic_addon_lines(
        vec![addon_line(
            "gid://shopify/CartLine/addon-free",
            "gid://shopify/ProductVariant/201",
            1,
            100.0,
            &runtime_token,
        )],
        &runtime_secret,
        vec![],
    );

    let add_operation = match &output.operations[0] {
        schema::CartOperation::ProductDiscountsAdd(operation) => operation,
        unexpected => panic!("expected product discounts add operation, got {unexpected:?}"),
    };
    assert_eq!(add_operation.candidates.len(), 1);
    assert_eq!(
        add_operation.candidates[0].message.as_deref(),
        Some(ADDON_DISCOUNT_MESSAGE)
    );
    let percentage = match &add_operation.candidates[0].value {
        schema::ProductDiscountCandidateValue::Percentage(percentage) => {
            percentage.value.to_string()
        }
        unexpected => panic!("expected percentage discount value, got {unexpected:?}"),
    };
    assert_eq!(percentage, "100.0");
}

#[test]
fn emits_independent_candidates_for_multiple_authorized_addons() {
    let runtime_secret = test_runtime_secret();
    let payload = addon_runtime_payload_for(serde_json::json!([
        {
            "variantId": "gid://shopify/ProductVariant/201",
            "quantity": 1,
            "discount": { "type": "PERCENTAGE", "value": 10 }
        },
        {
            "variantId": "gid://shopify/ProductVariant/202",
            "quantity": 2,
            "discount": { "type": "PERCENTAGE", "value": 100 }
        }
    ]));
    let runtime_token = sign_runtime_token_for_test(&payload, &runtime_secret);
    let output = run_automatic_addon_lines(
        vec![
            addon_line(
                "gid://shopify/CartLine/addon-partial",
                "gid://shopify/ProductVariant/201",
                1,
                10.0,
                &runtime_token,
            ),
            addon_line(
                "gid://shopify/CartLine/addon-free",
                "gid://shopify/ProductVariant/202",
                2,
                100.0,
                &runtime_token,
            ),
        ],
        &runtime_secret,
        vec![],
    );

    let add_operation = match &output.operations[0] {
        schema::CartOperation::ProductDiscountsAdd(operation) => operation,
        unexpected => panic!("expected product discounts add operation, got {unexpected:?}"),
    };
    assert_eq!(add_operation.candidates.len(), 2);
    assert!(add_operation
        .candidates
        .iter()
        .all(|candidate| candidate.message.as_deref() == Some(ADDON_DISCOUNT_MESSAGE)));
}

#[test]
fn rejects_tampered_and_mismatched_addon_runtime_tokens() {
    let runtime_secret = test_runtime_secret();
    let payload = addon_runtime_payload_for(serde_json::json!([
        {
            "variantId": "gid://shopify/ProductVariant/201",
            "quantity": 1,
            "discount": { "type": "PERCENTAGE", "value": 10 }
        }
    ]));
    let runtime_token = sign_runtime_token_for_test(&payload, &runtime_secret);
    let mut tampered_token = runtime_token.clone();
    tampered_token.push('x');

    let output = run_automatic_addon_lines(
        vec![
            addon_line(
                "gid://shopify/CartLine/tampered",
                "gid://shopify/ProductVariant/201",
                1,
                10.0,
                &tampered_token,
            ),
            addon_line(
                "gid://shopify/CartLine/wrong-percentage",
                "gid://shopify/ProductVariant/201",
                1,
                20.0,
                &runtime_token,
            ),
            addon_line(
                "gid://shopify/CartLine/wrong-quantity",
                "gid://shopify/ProductVariant/201",
                2,
                10.0,
                &runtime_token,
            ),
        ],
        &runtime_secret,
        vec![],
    );

    assert!(output.operations.is_empty());
}

#[test]
fn skips_signed_automatic_addon_when_generated_checkout_code_is_present() {
    let runtime_secret = test_runtime_secret();
    let payload = addon_runtime_payload_for(serde_json::json!([
        {
            "variantId": "gid://shopify/ProductVariant/201",
            "quantity": 1,
            "discount": { "type": "PERCENTAGE", "value": 10 }
        }
    ]));
    let runtime_token = sign_runtime_token_for_test(&payload, &runtime_secret);
    let output = run_automatic_addon_lines(
        vec![addon_line(
            "gid://shopify/CartLine/addon",
            "gid://shopify/ProductVariant/201",
            1,
            10.0,
            &runtime_token,
        )],
        &runtime_secret,
        vec!["WPB-GOKWIK-12345678"],
    );

    assert!(output.operations.is_empty());
}

#[test]
fn ignores_unsigned_addon_discount_markers() {
    let runtime_secret = test_runtime_secret();
    let input = r#"{
        "cart": {
            "lines": [
                {
                    "id": "gid://shopify/CartLine/addon",
                    "quantity": 1,
                    "wolfpackProductBundleOfferId": { "value": "FBP-bundle-1_ABC_2" },
                    "runtimeToken": null,
                    "stepType": { "value": "addon:PERCENTAGE:10" },
                    "merchandise": {
                        "__typename": "ProductVariant",
                        "id": "gid://shopify/ProductVariant/201",
                        "component_parents": null
                    },
                    "cost": { "amountPerQuantity": { "amount": "10.00" } }
                }
            ]
        },
        "discount": {
            "discountClasses": ["PRODUCT"],
            "runtimeTokenSecret": { "value": "__RUNTIME_SECRET__" },
            "checkoutIntegrationConfig": null
        },
        "enteredDiscountCodes": [],
        "triggeringDiscountCode": null,
        "shop":{"ppbPolicyRevisions":{"value":"{\"bundle-1\":\"rev-1\"}"}},"presentmentCurrencyRate": "1.0"
    }"#
    .replace("__RUNTIME_SECRET__", &runtime_secret);

    let output: schema::CartLinesDiscountsGenerateRunResult = run_discount(input.as_str());

    assert!(output.operations.is_empty());
}

#[test]
fn ignores_addon_lines_when_product_discount_class_is_unavailable() {
    let input = r#"{
        "cart": {
            "lines": [
                {
                    "id": "gid://shopify/CartLine/addon-partial",
                    "quantity": 1,
                    "wolfpackProductBundleOfferId": null,
                    "stepType": { "value": "addon:PERCENTAGE:10" },
                    "merchandise": {
                        "__typename": "ProductVariant",
                        "id": "gid://shopify/ProductVariant/addon-partial",
                        "component_parents": null
                    },
                    "cost": { "amountPerQuantity": { "amount": "10.00" } }
                }
            ]
        },
        "discount": {
            "discountClasses": ["ORDER"],
            "checkoutIntegrationConfig": null
        },
        "enteredDiscountCodes": [],
        "triggeringDiscountCode": null,
        "shop":{"ppbPolicyRevisions":{"value":"{\"bundle-1\":\"rev-1\"}"}},"presentmentCurrencyRate": "1.0"
    }"#;

    let output: schema::CartLinesDiscountsGenerateRunResult = run_discount(input);

    assert!(output.operations.is_empty());
}

#[test]
fn automatic_addon_branch_skips_when_generated_checkout_code_is_entered() {
    let input = r#"{
        "cart": {
            "lines": [
                {
                    "id": "gid://shopify/CartLine/addon-partial",
                    "stepType": { "value": "addon:PERCENTAGE:10" },
                    "wolfpackProductBundleOfferId": { "value": "FBP-1_ABC_1" },
                    "merchandise": {
                        "__typename": "ProductVariant",
                        "id": "gid://shopify/ProductVariant/1",
                        "component_parents": null
                    },
                    "cost": { "amountPerQuantity": { "amount": "100.00" } },
                    "quantity": 1
                }
            ]
        },
        "discount": {
            "discountClasses": ["PRODUCT"],
            "checkoutIntegrationConfig": null
        },
        "enteredDiscountCodes": [{ "code": "WPB-GOKWIK-12345678" }],
        "triggeringDiscountCode": null,
        "shop":{"ppbPolicyRevisions":{"value":"{\"bundle-1\":\"rev-1\"}"}},"presentmentCurrencyRate": "1.0"
    }"#;

    let output: schema::CartLinesDiscountsGenerateRunResult = run_discount(input);

    assert!(output.operations.is_empty());
}

#[test]
fn code_mode_emits_bundle_discount_candidate_from_component_parent_pricing() {
    let input = r#"{
        "cart": {
            "lines": [
                {
                    "id": "gid://shopify/CartLine/paid-1",
                    "quantity": 1,
                    "wolfpackProductBundleOfferId": { "value": "FBP-1_ABC_1" },
                    "stepType": null,
                    "merchandise": {
                        "__typename": "ProductVariant",
                        "id": "gid://shopify/ProductVariant/1",
                        "component_parents": {
                            "value": "[{\"id\":\"gid://shopify/ProductVariant/999\",\"component_reference\":{\"value\":[\"gid://shopify/ProductVariant/1\",\"gid://shopify/ProductVariant/2\"]},\"price_adjustment\":{\"method\":\"percentage_off\",\"value\":20}}]"
                        }
                    },
                    "cost": { "amountPerQuantity": { "amount": "50.00" } }
                },
                {
                    "id": "gid://shopify/CartLine/paid-2",
                    "quantity": 1,
                    "wolfpackProductBundleOfferId": { "value": "FBP-1_ABC_2" },
                    "stepType": null,
                    "merchandise": {
                        "__typename": "ProductVariant",
                        "id": "gid://shopify/ProductVariant/2",
                        "component_parents": null
                    },
                    "cost": { "amountPerQuantity": { "amount": "50.00" } }
                }
            ]
        },
        "discount": {
            "discountClasses": ["PRODUCT"],
            "checkoutIntegrationConfig": {
                "jsonValue": {
                    "mode": "checkout_integration",
                    "providerId": "gokwik"
                }
            }
        },
        "enteredDiscountCodes": [{ "code": "WPB-GOKWIK-12345678" }],
        "triggeringDiscountCode": "WPB-GOKWIK-12345678",
        "shop":{"ppbPolicyRevisions":{"value":"{\"bundle-1\":\"rev-1\"}"}},"presentmentCurrencyRate": "1.0"
    }"#;

    let output: schema::CartLinesDiscountsGenerateRunResult = run_discount(input);

    assert_eq!(output.operations.len(), 1);
    let add_operation = match &output.operations[0] {
        schema::CartOperation::ProductDiscountsAdd(operation) => operation,
        unexpected => panic!("expected product discounts add operation, got {unexpected:?}"),
    };
    assert_eq!(add_operation.candidates.len(), 1);
    assert_eq!(
        add_operation.candidates[0].message.as_deref(),
        Some("Bundle Discount")
    );
    assert_eq!(add_operation.candidates[0].targets.len(), 2);
    let percentage = match &add_operation.candidates[0].value {
        schema::ProductDiscountCandidateValue::Percentage(percentage) => {
            percentage.value.to_string()
        }
        unexpected => panic!("expected percentage discount value, got {unexpected:?}"),
    };
    assert_eq!(percentage, "20.0");
}

#[test]
fn code_mode_emits_buy_x_get_y_bundle_discount_candidate() {
    let input = r#"{
        "cart": {
            "lines": [
                {
                    "id": "gid://shopify/CartLine/paid-1",
                    "quantity": 1,
                    "wolfpackProductBundleOfferId": { "value": "FBP-1_BXY_1" },
                    "stepType": null,
                    "merchandise": {
                        "__typename": "ProductVariant",
                        "id": "gid://shopify/ProductVariant/1",
                        "component_parents": {
                            "value": "[{\"id\":\"gid://shopify/ProductVariant/999\",\"price_adjustment\":{\"method\":\"buy_x_get_y\",\"value\":100,\"customerBuys\":1,\"customerGets\":1,\"discountType\":\"percentage\"}}]"
                        }
                    },
                    "cost": { "amountPerQuantity": { "amount": "50.00" } }
                },
                {
                    "id": "gid://shopify/CartLine/paid-2",
                    "quantity": 1,
                    "wolfpackProductBundleOfferId": { "value": "FBP-1_BXY_2" },
                    "stepType": null,
                    "merchandise": {
                        "__typename": "ProductVariant",
                        "id": "gid://shopify/ProductVariant/2",
                        "component_parents": null
                    },
                    "cost": { "amountPerQuantity": { "amount": "50.00" } }
                }
            ]
        },
        "discount": {
            "discountClasses": ["PRODUCT"],
            "checkoutIntegrationConfig": null
        },
        "enteredDiscountCodes": [{ "code": "WPB-GOKWIK-12345678" }],
        "triggeringDiscountCode": "WPB-GOKWIK-12345678",
        "shop":{"ppbPolicyRevisions":{"value":"{\"bundle-1\":\"rev-1\"}"}},"presentmentCurrencyRate": "1.0"
    }"#;

    let output: schema::CartLinesDiscountsGenerateRunResult = run_discount(input);

    let add_operation = match &output.operations[0] {
        schema::CartOperation::ProductDiscountsAdd(operation) => operation,
        unexpected => panic!("expected product discounts add operation, got {unexpected:?}"),
    };
    let percentage = match &add_operation.candidates[0].value {
        schema::ProductDiscountCandidateValue::Percentage(percentage) => {
            percentage.value.to_string()
        }
        unexpected => panic!("expected percentage discount value, got {unexpected:?}"),
    };
    assert_eq!(percentage, "50.0");
}
