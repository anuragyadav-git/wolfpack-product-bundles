import { bundleLevelCssMethods } from "../../../app/assets/widgets/shared/bundle-level-css-methods";

type FakeStyleElement = {
  dataset: Record<string, string>;
  id: string;
  textContent: string;
  type: string;
  remove: () => void;
  getAttribute: (name: string) => string | null;
};

function createFakeDocument() {
  const styles: FakeStyleElement[] = [];

  const documentRef = {
    head: {
      set innerHTML(_value: string) {
        styles.splice(0, styles.length);
      },
      appendChild(style: FakeStyleElement) {
        styles.push(style);
        return style;
      },
    },
    createElement(tagName: string) {
      if (tagName !== "style") {
        throw new Error(`Unexpected tag: ${tagName}`);
      }

      const style: FakeStyleElement = {
        dataset: {},
        id: "",
        textContent: "",
        type: "",
        remove: () => {
          const index = styles.indexOf(style);
          if (index >= 0) styles.splice(index, 1);
        },
        getAttribute: (name: string) => {
          if (name === "data-wpb-managed-style") {
            return style.dataset.wpbManagedStyle ?? null;
          }
          return null;
        },
      };

      return style;
    },
    querySelector(selector: string) {
      return documentRef.querySelectorAll(selector)[0] ?? null;
    },
    querySelectorAll(selector: string) {
      if (!selector.startsWith("style[data-wpb-managed-style")) {
        return [];
      }
      return styles.filter((style) => style.dataset.wpbManagedStyle !== undefined);
    },
  };

  return documentRef;
}

describe("Bundle Level CSS storefront runtime helper", () => {
  beforeEach(() => {
    global.document = createFakeDocument() as unknown as Document;
  });

  it("appends scoped bundle CSS to the document head", () => {
    bundleLevelCssMethods.applyBundleLevelCss({
      id: "bundle/with unsafe chars",
      bundleLevelCss: "#bundle-builder-app { --proof: applied; }",
    });

    const style = document.querySelector("style[data-wpb-managed-style]");

    expect(style?.id).toBe("wpb-bundle-level-css-bundle-with-unsafe-chars");
    expect(style?.getAttribute("data-wpb-managed-style")).toBe("bundle-level-bundle-with-unsafe-chars");
    expect(style?.textContent).toBe("#bundle-builder-app { --proof: applied; }");
  });

  it("deduplicates previous bundle-level CSS style tags", () => {
    bundleLevelCssMethods.applyBundleLevelCss({
      id: "first",
      bundleLevelCss: "#bundle-builder-app { --proof: first; }",
    });
    bundleLevelCssMethods.applyBundleLevelCss({
      id: "second",
      bundleLevelCss: "#bundle-builder-app { --proof: second; }",
    });

    const styles = document.querySelectorAll("style[data-wpb-managed-style]");

    expect(styles).toHaveLength(1);
    expect(styles[0]?.id).toBe("wpb-bundle-level-css-second");
    expect(styles[0]?.textContent).toBe("#bundle-builder-app { --proof: second; }");
  });

  it("removes stale style tags when bundle CSS is empty", () => {
    bundleLevelCssMethods.applyBundleLevelCss({
      id: "first",
      bundleLevelCss: "#bundle-builder-app { --proof: first; }",
    });
    bundleLevelCssMethods.applyBundleLevelCss({
      id: "first",
      bundleLevelCss: "   ",
    });

    expect(document.querySelector("style[data-wpb-bundle-level-css]")).toBeNull();
  });
});
