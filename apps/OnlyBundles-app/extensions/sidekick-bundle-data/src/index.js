async function requestBundleData(operation, input) {
  const response = await fetch("/app/sidekick/bundles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation, input }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const code =
      payload && typeof payload.error === "string"
        ? payload.error
        : "sidekick_request_failed";
    throw new Error(code);
  }

  return payload;
}

export default function registerBundleDataTools() {
  shopify.tools.register("search_bundles", (input) =>
    requestBundleData("search_bundles", input),
  );
  shopify.tools.register("get_bundle_summary", (input) =>
    requestBundleData("get_bundle_summary", input),
  );
}
