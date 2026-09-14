use hmac::{Hmac, Mac};
use sha2::Sha256;

pub fn sign(key: &[u8], message: &[u8]) -> [u8; 32] {
    let mut mac = Hmac::<Sha256>::new_from_slice(key).expect("HMAC accepts arbitrary key lengths");
    mac.update(message);
    mac.finalize().into_bytes().into()
}
