import { JSDOM } from "jsdom";
import {
  sanitizeRichHtmlFragment,
} from "../../../app/assets/widgets/shared/rich-html";
import {
  createMessageFragment,
  formatMessageSegments,
} from "../../../app/assets/widgets/shared/message-segments";
import { replaceManagedStyle } from "../../../app/assets/widgets/shared/managed-style";
import { parseThemeSectionResponse } from "../../../app/assets/widgets/shared/theme-section-parser";

function createDom() {
  return new JSDOM("<!doctype html><html><head></head><body></body></html>", {
    url: "https://shop.example/products/bundle",
  });
}

describe("storefront rich HTML boundaries", () => {
  it("preserves product formatting while removing executable markup", () => {
    const dom = createDom();
    const fragment = sanitizeRichHtmlFragment(
      '<p onclick="alert(1)"><strong>Safe</strong><script>alert(1)</script><a href="javascript:alert(1)">link</a><form><input></form><img src="https://cdn.example/p.png" style="position:fixed" onerror="alert(1)"></p>',
      "product-description",
      dom.window as unknown as Window,
    );
    const host = dom.window.document.createElement("div");
    host.append(fragment);

    expect(host.textContent).toContain("Safe");
    expect(host.querySelector("strong")).not.toBeNull();
    expect(host.querySelector("script, form, input")).toBeNull();
    expect(host.querySelector("[onclick], [onerror], [style]")).toBeNull();
    expect(host.querySelector("a")?.hasAttribute("href")).toBe(false);
  });

  it("keeps narrow review badge markup inert", () => {
    const dom = createDom();
    const fragment = sanitizeRichHtmlFragment(
      '<div class="jdgm-widget"><span aria-label="4 stars">★★★★</span><iframe src="https://evil.example"></iframe><svg onload="alert(1)"></svg></div>',
      "review-badge",
      dom.window as unknown as Window,
    );
    const host = dom.window.document.createElement("div");
    host.append(fragment);

    expect(host.textContent).toContain("★★★★");
    expect(host.querySelector("iframe, svg, [onload]")).toBeNull();
  });
});

describe("merchant message segments", () => {
  it("renders merchant templates and variables as text with only owned emphasis nodes", () => {
    const dom = createDom();
    const segments = formatMessageSegments(
      "Add {conditionText}; save {{discountText}} <img src=x onerror=alert(1)>",
      {
        conditionText: "<b>2 items</b>",
        discountText: "10% & more",
      },
    );
    const host = dom.window.document.createElement("div");
    host.append(createMessageFragment(segments, dom.window.document));

    expect(host.textContent).toBe("Add <b>2 items</b>; save 10% & more <img src=x onerror=alert(1)>");
    expect(host.querySelector("img, b")).toBeNull();
    expect(host.querySelectorAll("span")).toHaveLength(2);
    expect(host.querySelector('[data-message-segment="condition"]')?.textContent).toBe("<b>2 items</b>");
    expect(host.querySelector('[data-message-segment="discount"]')?.textContent).toBe("10% & more");
  });
});

describe("managed style lifecycle", () => {
  it("creates, replaces, and removes one keyed style", () => {
    const dom = createDom();
    const runtimeDocument = dom.window.document;

    const first = replaceManagedStyle(runtimeDocument, "controls-theme", ".one { color: red; }");
    const second = replaceManagedStyle(runtimeDocument, "controls-theme", ".two { color: blue; }");

    expect(first).toBe(second);
    expect(runtimeDocument.querySelectorAll("style[data-wpb-managed-style]")).toHaveLength(1);
    expect(second?.textContent).toBe(".two { color: blue; }");
    expect(replaceManagedStyle(runtimeDocument, "controls-theme", "  ")).toBeNull();
    expect(runtimeDocument.querySelector("style[data-wpb-managed-style]")).toBeNull();
  });
});

describe("same-origin theme section parsing", () => {
  it("returns a detached required element for a successful same-origin response", async () => {
    const dom = createDom();
    const response = {
      ok: true,
      headers: { get: (name: string) => name.toLowerCase() === "content-type" ? "text/html; charset=utf-8" : null },
      text: async () => '<section id="shopify-section-cart"><div data-cart-items>Cart</div></section>',
      url: "https://shop.example/?section_id=cart",
    };

    const section = await parseThemeSectionResponse(response, "#shopify-section-cart", dom.window.document);
    expect(section?.ownerDocument).toBe(dom.window.document);
    expect(section?.isConnected).toBe(false);
    expect(section?.textContent).toBe("Cart");
  });

  it("rejects cross-origin, non-HTML, unsuccessful, or missing section responses", async () => {
    const dom = createDom();
    const base = {
      ok: true,
      headers: { get: () => "text/html" },
      text: async () => "<main>Missing</main>",
      url: "https://shop.example/?section_id=cart",
    };

    await expect(parseThemeSectionResponse({ ...base, url: "https://evil.example/cart" }, "main", dom.window.document)).resolves.toBeNull();
    await expect(parseThemeSectionResponse({ ...base, headers: { get: () => "application/json" } }, "main", dom.window.document)).resolves.toBeNull();
    await expect(parseThemeSectionResponse({ ...base, ok: false }, "main", dom.window.document)).resolves.toBeNull();
    await expect(parseThemeSectionResponse(base, "#required", dom.window.document)).resolves.toBeNull();
  });
});
