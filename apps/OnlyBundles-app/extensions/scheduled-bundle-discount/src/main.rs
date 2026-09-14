#[cfg(test)]
#[path = "../../bundle-discount-function/src/signing.rs"]
mod signing;
#[path = "../../bundle-discount-function/src/hmac.rs"]
mod hmac;
use shopify_function::prelude::*;
use std::process;

mod candidates {
    include!("../../bundle-discount-function/src/candidates.rs");
}
pub mod cart_lines_discounts_generate_run;
#[path = "../../bundle-discount-function/src/published_policy.rs"]
mod published_policy;
#[path = "../../bundle-discount-function/src/runtime_token.rs"]
mod runtime_token;

#[typegen("schema.graphql")]
pub mod schema {
    #[query("src/cart_lines_discounts_generate_run.graphql", custom_scalar_overrides = {"Input.shop.ppbPolicyRevisions.value" => ::shopify_function::wasm_api::Value})]
    pub mod cart_lines_discounts_generate_run {}
}

fn main() {
    log!("Please invoke a named export.");
    process::abort();
}
