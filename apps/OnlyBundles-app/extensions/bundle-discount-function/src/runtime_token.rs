#[derive(serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeTokenPayload {
    pub version: i64,
    pub shop: String,
    pub bundle_id: String,
    pub revision: String,
    pub offer_group_id: String,
    #[serde(default)]
    pub components: Vec<RuntimeTokenLine>,
    #[serde(default)]
    pub addons: Vec<RuntimeTokenAddonLine>,
    #[serde(default)]
    pub price_adjustment: serde_json::Value,
    #[serde(default)]
    pub subscription: Option<RuntimeTokenSubscription>,
    #[serde(default)]
    pub country_rule: String,
}

pub fn country_is_eligible(rule: &str, current_country: &str) -> bool {
    if rule.is_empty() {
        return true;
    }
    let Some((mode, countries)) = rule.split_once(':') else {
        return false;
    };
    let matches = countries
        .split(',')
        .any(|country| country == current_country);
    match mode {
        "include" => matches,
        "exclude" => !matches,
        _ => false,
    }
}

#[derive(serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeTokenSubscription {
    pub selling_plan_group_id: String,
    pub selling_plan_id: String,
    pub recurring_bundle_discount: bool,
}

#[derive(serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeTokenLine {
    pub variant_id: String,
    pub quantity: i64,
}

#[derive(serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeTokenAddonLine {
    pub variant_id: String,
    pub quantity: i64,
    #[serde(default)]
    pub discount: Option<RuntimeTokenDiscount>,
}

#[derive(serde::Deserialize, Debug, Clone)]
pub struct RuntimeTokenDiscount {
    #[serde(rename = "type")]
    pub discount_type: String,
    pub value: f64,
}

#[derive(serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PpbBundleTokenV2 {
    pub version: i64,
    pub kind: String,
    pub shop: String,
    pub bundle_id: String,
    pub revision: String,
    #[serde(rename = "parentVariantId")]
    pub _parent_variant_id: String,
    #[serde(default)]
    pub price_adjustment: serde_json::Value,
    #[serde(default)]
    pub subscription: Option<serde_json::Value>,
    #[serde(default)]
    pub groups: Vec<PpbSelectionGroupV2>,
    #[serde(default)]
    pub country_rule: String,
}

#[derive(serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PpbSelectionGroupV2 {
    pub id: String,
    pub role: String,
    pub min_quantity: i64,
    pub max_quantity: i64,
}

#[derive(serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PpbLineTokenV2 {
    pub version: i64,
    pub kind: String,
    pub shop: String,
    pub bundle_id: String,
    pub revision: String,
    pub group_id: String,
    #[serde(default)]
    pub variant_id: String,
    #[serde(default)]
    pub product_id: Option<String>,
    pub role: String,
    pub max_quantity: i64,
    #[serde(default)]
    pub max_discount_percentage: f64,
}

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

pub fn verify_runtime_token(token: &str, secret: &str) -> Option<RuntimeTokenPayload> {
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
    let payload_bytes = base64url_decode(payload_part)?;
    let payload: RuntimeTokenPayload = serde_json::from_slice(&payload_bytes).ok()?;
    (payload.version == 1).then_some(payload)
}

pub(crate) fn verified_payload_bytes(token: &str, secret: &str) -> Option<Vec<u8>> {
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
    base64url_decode(payload_part)
}

pub fn verify_ppb_bundle_token(token: &str, secret: &str) -> Option<PpbBundleTokenV2> {
    let payload: PpbBundleTokenV2 =
        serde_json::from_slice(&verified_payload_bytes(token, secret)?).ok()?;
    (payload.version == 2 && payload.kind == "bundle").then_some(payload)
}

pub fn verify_ppb_line_token(token: &str, secret: &str) -> Option<PpbLineTokenV2> {
    let payload: PpbLineTokenV2 =
        serde_json::from_slice(&verified_payload_bytes(token, secret)?).ok()?;
    (payload.version == 2 && payload.kind == "line").then_some(payload)
}

#[cfg(test)]
pub fn sign_runtime_token_for_test(payload_json: &str, secret: &str) -> String {
    let payload_part = base64url_encode(payload_json.as_bytes());
    let signature_part = base64url_encode(&crate::signing::sign(
        secret.as_bytes(),
        payload_part.as_bytes(),
    ));
    format!("{payload_part}.{signature_part}")
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
