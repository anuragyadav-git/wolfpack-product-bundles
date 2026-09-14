# Create an Only Bundles product bundle

Use this action when a merchant asks to create a product bundle with Only Bundles. Navigate to the existing bundle creation page and use `stage_bundle_draft` only to prefill a proposed name or bundle type when those details are known.

The merchant must review the staged values and confirm creation in the app. Do not claim the bundle exists until the app returns a successful Shopify Product GID. Do not use this action to edit an existing bundle.

When `stage_bundle_draft` reports that values were staged, tell the merchant that the values are only proposed and wait for the merchant to use Save in the app.

If the app returns an error, report only that creation failed and leave the merchant's existing bundles unchanged.
