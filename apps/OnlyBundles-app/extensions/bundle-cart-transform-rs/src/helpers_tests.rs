use super::*;

#[test]
fn normalize_operator_short_forms() {
    assert_eq!(normalize_operator("gte"), Some(Operator::Gte));
    assert_eq!(normalize_operator("gt"), Some(Operator::Gt));
    assert_eq!(normalize_operator("lte"), Some(Operator::Lte));
    assert_eq!(normalize_operator("lt"), Some(Operator::Lt));
    assert_eq!(normalize_operator("eq"), Some(Operator::Eq));
}

#[test]
fn normalize_operator_rejects_long_forms() {
    assert_eq!(normalize_operator("greater_than_or_equal_to"), None);
    assert_eq!(normalize_operator("less_than_or_equal_to"), None);
    assert_eq!(normalize_operator("equal_to"), None);
}

#[test]
fn normalize_operator_rejects_unknown_values() {
    assert_eq!(normalize_operator("unknown"), None);
}

#[test]
fn is_free_gift_true() {
    assert!(is_free_gift_line(Some("free_gift")));
}

#[test]
fn is_free_gift_false() {
    assert!(!is_free_gift_line(Some("default")));
}

#[test]
fn is_free_gift_none() {
    assert!(!is_free_gift_line(None));
}

#[test]
fn is_addon_true() {
    assert!(is_addon_line(Some("addon")));
}

#[test]
fn is_addon_with_discount_true() {
    assert!(is_addon_line(Some("addon:PERCENTAGE:10")));
}

#[test]
fn is_addon_false() {
    assert!(!is_addon_line(Some("free_gift")));
}
