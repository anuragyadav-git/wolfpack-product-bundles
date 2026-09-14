#[path = "../../bundle-discount-function/src/signing.rs"]
mod signing;
#[path = "../../bundle-discount-function/src/hmac.rs"]
mod hmac;
use shopify_function::prelude::*;

mod expand;
mod helpers;
mod merge;
mod pricing;
#[path = "../../bundle-discount-function/src/published_policy.rs"]
mod published_policy;
mod run;
#[cfg(debug_assertions)]
pub mod runtime_token;
#[cfg(not(debug_assertions))]
mod runtime_token;
mod types;

#[typegen("schema.graphql")]
pub mod schema {
    #[query("src/run.graphql", custom_scalar_overrides = {"Input.shop.ppbPolicyRevisions.value" => ::shopify_function::wasm_api::Value, "Input.cartTransform.runtimeConfiguration.value" => ::shopify_function::wasm_api::Value})]
    pub mod run {}
}

// Re-export the inner function so integration tests can call run_function_with_input(cart_transform_run, json)
pub use run::cart_transform_run;
