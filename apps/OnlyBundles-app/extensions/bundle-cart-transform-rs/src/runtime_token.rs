use crate::types::{PpbLineTokenV2, RuntimeTokenPayload};

fn base64url_value(byte: u8) -> Option<u8> {
    match byte {
        b'A'..=b'Z' => Some(byte - b'A'),
        b'a'..=b'z' => Some(byte - b'a' + 26),
        b'0'..=b'9' => Some(byte - b'0' + 52),
        b'-' => Some(62),
        b'_' => Some(63),
        _ => None,
    }
}

fn base64url_decode(input: &str) -> Option<Vec<u8>> {
    let mut out = Vec::new();
    let mut buffer = 0u32;
    let mut bits = 0u8;
    for byte in input.bytes() {
        if byte == b'=' {
            break;
        }
        let value = base64url_value(byte)? as u32;
        buffer = (buffer << 6) | value;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push(((buffer >> bits) & 0xff) as u8);
        }
    }
    Some(out)
}

fn base64url_encode(input: &[u8]) -> String {
    const ALPHABET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let mut out = String::new();
    let mut index = 0;
    while index < input.len() {
        let b0 = input[index];
        let b1 = *input.get(index + 1).unwrap_or(&0);
        let b2 = *input.get(index + 2).unwrap_or(&0);
        out.push(ALPHABET[(b0 >> 2) as usize] as char);
        out.push(ALPHABET[(((b0 & 0x03) << 4) | (b1 >> 4)) as usize] as char);
        if index + 1 < input.len() {
            out.push(ALPHABET[(((b1 & 0x0f) << 2) | (b2 >> 6)) as usize] as char);
        }
        if index + 2 < input.len() {
            out.push(ALPHABET[(b2 & 0x3f) as usize] as char);
        }
        index += 3;
    }
    out
}

#[cfg(debug_assertions)]
pub fn verify_runtime_token(token: &str, secret: &str) -> Option<RuntimeTokenPayload> {
    let payload = verify_token_payload(token, secret)?;
    (payload.version == 1).then_some(payload)
}

fn verify_token_payload(token: &str, secret: &str) -> Option<RuntimeTokenPayload> {
    let mut parts = token.split('.');
    let payload_part = parts.next()?;
    let signature_part = parts.next()?;
    if parts.next().is_some() || payload_part.is_empty() || signature_part.is_empty() {
        return None;
    }
    let signature = base64url_decode(signature_part)?;
    if base64url_encode(&signature) != signature_part
        || !crate::hmac::verify(secret.as_bytes(), payload_part.as_bytes(), &signature)
    {
        return None;
    }
    serde_json::from_slice(&base64url_decode(payload_part)?).ok()
}

pub(crate) fn verify_bundle_token(token: &str, secret: &str) -> Option<RuntimeTokenPayload> {
    let payload = verify_token_payload(token, secret)?;
    (payload.version == 1 || (payload.version == 2 && payload.kind == "bundle")).then_some(payload)
}

pub fn verify_ppb_line_token(token: &str, secret: &str) -> Option<PpbLineTokenV2> {
    let payload = verify_token_payload(token, secret)?;
    (payload.version == 2 && payload.kind == "line").then_some(payload)
}

pub(crate) fn sign_runtime_payload(payload_json: &str, secret: &str) -> String {
    let payload_part = base64url_encode(payload_json.as_bytes());
    let signature_part = base64url_encode(&crate::signing::sign(
        secret.as_bytes(),
        payload_part.as_bytes(),
    ));
    format!("{payload_part}.{signature_part}")
}

#[cfg(debug_assertions)]
pub fn sign_runtime_token_for_test(payload_json: &str, secret: &str) -> String {
    sign_runtime_payload(payload_json, secret)
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct PricingReceipt<'a> {
    offer_group_id: &'a str,
    quantity: i64,
    unit_price: String,
    discount_percentage: f64,
}

pub(crate) fn pricing_receipt_token(
    token: &str,
    secret: &str,
    group: &str,
    quantity: i64,
    unit_price: f64,
    percentage: f64,
) -> Option<String> {
    // Callers have verified the token or created it from trusted parent metadata.
    // RawValue preserves every original field without decoding/rebuilding display or subscription data.
    let bytes = base64url_decode(token.split('.').next()?)?;
    pricing_receipt_json(&bytes, secret, group, quantity, unit_price, percentage)
}

pub(crate) fn pricing_receipt_json(bytes: &[u8], secret: &str, group: &str, quantity: i64, unit_price: f64, percentage: f64) -> Option<String> {
    let mut payload: std::collections::BTreeMap<&str, &serde_json::value::RawValue> =
        serde_json::from_slice(bytes).ok()?;
    let receipt = PricingReceipt {
        offer_group_id: group,
        quantity,
        unit_price: shopify_function::scalars::Decimal::from(unit_price).to_string(),
        discount_percentage: percentage,
    };
    let receipt_json = serde_json::value::to_raw_value(&receipt).ok()?;
    payload.insert("transformedPricing", &receipt_json);
    let signed = sign_runtime_payload(&serde_json::to_string(&payload).ok()?, secret);
    (signed.len() <= 10_000).then_some(signed)
}

pub fn token_components_match(
    payload: &RuntimeTokenPayload,
    group_id: &str,
    actual_components: &[(String, i64)],
) -> bool {
    if payload.offer_group_id != group_id || payload.components.len() != actual_components.len() {
        return false;
    }
    payload.components.iter().all(|expected| {
        actual_components.iter().any(|(variant_id, quantity)| {
            variant_id == &expected.variant_id && *quantity == expected.quantity
        })
    })
}
