use hmac::{Hmac, Mac};
use sha2::Sha256;

pub fn verify(key: &[u8], message: &[u8], signature: &[u8]) -> bool {
    let Ok(mut mac) = Hmac::<Sha256>::new_from_slice(key) else {
        return false;
    };
    mac.update(message);
    mac.verify_slice(signature).is_ok()
}
