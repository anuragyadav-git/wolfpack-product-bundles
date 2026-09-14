use bundle_cart_transform_rs::runtime_token::sign_runtime_token_for_test;

#[test]
fn signature_matches_node_crypto_for_short_and_long_keys() {
    assert_eq!(
        sign_runtime_token_for_test(r#"{"message":"bundle"}"#, "secret"),
        "eyJtZXNzYWdlIjoiYnVuZGxlIn0.dF2E9UlkRrVzKCJ_-G9eGZKWv9fZYBoJ0G2dn9_2CgY"
    );
    assert_eq!(
        sign_runtime_token_for_test(r#"{"message":"bundle"}"#, &"a".repeat(100)),
        "eyJtZXNzYWdlIjoiYnVuZGxlIn0.nGuuF6PSNE-BCHGxtL2KJW724ZxElYdQAgBtvHPoXcI"
    );
}
