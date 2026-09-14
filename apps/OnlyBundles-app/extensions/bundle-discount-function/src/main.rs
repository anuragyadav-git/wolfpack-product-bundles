#[cfg(test)]
#[path = "signing.rs"]
mod signing;
mod hmac;
use shopify_function::prelude::*;
use std::process;

mod candidates {
    include!("candidates.rs");
    pub(crate) mod checkout { include!("checkout_candidates.rs"); }
}
pub mod cart_lines_discounts_generate_run;
mod published_policy;
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
