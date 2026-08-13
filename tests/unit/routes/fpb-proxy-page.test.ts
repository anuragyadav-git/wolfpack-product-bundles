import { createHmac } from "node:crypto";
import { loader } from "../../../app/routes/root/wpb.$bundleId";
import { createBundlePreviewToken } from "../../../app/lib/bundle-preview-token.server";

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    bundle: {
      findFirst: jest.fn(),
    },
    designSettings: {
      findUnique: jest.fn(),
    },
  },
}));

const getDb = () => require("../../../app/db.server").default;

function makeSignedRequest(bundleId = "1") {
  const params = new URLSearchParams({
    shop: "test-shop.myshopify.com",
    path_prefix: "/apps/onlybundles",
    timestamp: "1770000000",
  });

  const message = [...params.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("");
  params.set("signature", createHmac("sha256", "test_api_secret").update(message).digest("hex"));

  return new Request(`https://test-shop.myshopify.com/apps/onlybundles/wpb/${bundleId}?${params.toString()}`);
}

describe("FPB app proxy page", () => {
  const originalSecret = process.env.SHOPIFY_API_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SHOPIFY_API_SECRET = "test_api_secret";
    getDb().designSettings.findUnique.mockResolvedValue(null);
  });

  afterAll(() => {
    process.env.SHOPIFY_API_SECRET = originalSecret;
  });

  it("renders active bundles as a theme-wrapped Liquid marker", async () => {
    getDb().bundle.findFirst.mockResolvedValue({
      id: "bundle-1",
      name: "Build a Box",
      shopId: "test-shop.myshopify.com",
      bundleType: "full_page",
      status: "active",
      steps: [],
      pricing: null,
    });

    const response = (await loader({
      request: makeSignedRequest(),
      params: { bundleId: "1" },
      context: {},
    } as any)) as Response;
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/liquid");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(text).toContain("data-wpb-full-page-bundle");
    expect(text).toContain("data-bundle-id=\"bundle-1\"");
    expect(text).not.toContain("/apps/onlybundles/assets/");
  });

  it("renders a customizable first-paint loading screen without skeleton cards", async () => {
    getDb().bundle.findFirst.mockResolvedValue({
      id: "bundle-1",
      name: "Build a Box",
      shopId: "test-shop.myshopify.com",
      bundleType: "full_page",
      status: "active",
      steps: [],
      pricing: null,
    });
    getDb().designSettings.findUnique.mockResolvedValue({
      generalSettings: {
        loadingScreen: {
          gifUrl: "https://cdn.example.test/loading.gif",
          backgroundColor: "#f4f1eb",
        },
      },
    });

    const response = (await loader({
      request: makeSignedRequest(),
      params: { bundleId: "1" },
      context: {},
    } as any)) as Response;
    const text = await response.text();

    expect(text).toContain("data-wpb-loading-screen");
    expect(text).toContain('role="status"');
    expect(text).toContain("https://cdn.example.test/loading.gif");
    expect(text).toContain("#f4f1eb");
    expect(text).not.toContain("data-wpb-bootstrap-card");
    expect(text).not.toContain("skeleton");
  });

  it("does not require a linked Shopify page", async () => {
    getDb().bundle.findFirst.mockResolvedValue({
      id: "bundle-1",
      name: "Build a Box",
      shopId: "test-shop.myshopify.com",
      bundleType: "full_page",
      status: "active",
      steps: [],
      pricing: null,
    });

    const response = (await loader({
      request: makeSignedRequest(),
      params: { bundleId: "1" },
      context: {},
    } as any)) as Response;
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).not.toContain("/apps/onlybundles/assets/");
  });

  it("loads ordered step categories before status authorization", async () => {
    const category = {
      id: "category-1",
      name: "Phones",
      sortOrder: 0,
      products: [{ id: "gid://shopify/Product/1", title: "Phone Case" }],
      collections: [],
    };

    getDb().bundle.findFirst.mockResolvedValue({
      id: "bundle-1",
      name: "Build a Box",
      shopId: "test-shop.myshopify.com",
      bundleType: "full_page",
      status: "draft",
      steps: [
        {
          id: "step-1",
          position: 1,
          StepProduct: [],
          StepCategory: [category],
        },
      ],
      pricing: null,
    });

    const response = (await loader({
      request: makeSignedRequest(),
      params: { bundleId: "1" },
      context: {},
    } as any)) as Response;

    expect(getDb().bundle.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          steps: expect.objectContaining({
            include: expect.objectContaining({
              StepProduct: { orderBy: { position: "asc" } },
              StepCategory: { orderBy: { sortOrder: "asc" } },
            }),
          }),
        }),
      }),
    );
    expect(response.status).toBe(404);
  });

  it("renders ordered categories and escaped full configuration", async () => {
    getDb().bundle.findFirst.mockResolvedValue({
      id: "bundle-1",
      name: "Build 'n <Box>",
      description: null,
      shopId: "test-shop.myshopify.com",
      bundleType: "full_page",
      status: "unlisted",
      bundleDesignTemplate: "FBP_SIDE_FOOTER",
      bundleDesignPresetId: "CLASSIC",
      shopifyProductId: null,
      steps: [{
        id: "step-1",
        name: "Choose",
        position: 1,
        enabled: true,
        StepProduct: [],
        StepCategory: [
          { id: "cat-2", name: "Second", sortOrder: 2, products: [], collections: [] },
          { id: "cat-1", name: "First", sortOrder: 1, products: [], collections: [] },
        ],
      }],
      pricing: null,
    });

    const response = await loader({
      request: makeSignedRequest(),
      params: { bundleId: "1" },
      context: {},
    } as any) as Response;
    const text = await response.text();

    expect(text).toContain('data-bundle-config-source="app_proxy"');
    expect(text).toContain("data-fpb-design-preset=\"CLASSIC\"");
    expect(text).toContain("Build &#39;n &lt;Box&gt;");
    expect(text).not.toContain("Build 'n <Box>");
  });

  it("protects storefront message placeholders from Shopify Liquid evaluation", async () => {
    const discountText =
      "Add {{discountConditionDiff}} product(s) to save {{discountValue}}{{discountValueUnit}}!";
    getDb().bundle.findFirst.mockResolvedValue({
      id: "bundle-1",
      name: "Build a Box",
      description: null,
      shopId: "test-shop.myshopify.com",
      bundleType: "full_page",
      status: "active",
      shopifyProductId: null,
      steps: [],
      pricing: {
        enabled: true,
        method: "percentage_off",
        rules: [],
        showFooter: true,
        messages: {
          ruleMessages: {
            "rule-1": {
              discountText,
              successMessage:
                "Success! Your {{discountValue}}{{discountValueUnit}} discount has been applied.",
            },
          },
        },
      },
    });

    const response = (await loader({
      request: makeSignedRequest(),
      params: { bundleId: "1" },
      context: {},
    } as any)) as Response;
    const text = await response.text();

    expect(text).not.toContain("{{discountConditionDiff}}");
    expect(text).toContain("&#123;&#123;discountConditionDiff&#125;&#125;");
    expect(text).toContain("&#123;&#123;discountValue&#125;&#125;");
    expect(text).toContain("&#123;&#123;discountValueUnit&#125;&#125;");
  });

  it("requires a valid bound preview token for drafts", async () => {
    getDb().bundle.findFirst.mockResolvedValue({
      id: "bundle-1",
      name: "Draft",
      description: null,
      shopId: "test-shop.myshopify.com",
      bundleType: "full_page",
      status: "draft",
      shopifyProductId: null,
      steps: [],
      pricing: null,
    });

    const unsigned = await loader({
      request: makeSignedRequest(),
      params: { bundleId: "1" },
      context: {},
    } as any) as Response;
    expect(unsigned.status).toBe(404);

    const request = makeSignedRequest();
    const url = new URL(request.url);
    url.searchParams.set("wpb_preview", createBundlePreviewToken({
      shop: "test-shop.myshopify.com",
      bundleId: "bundle-1",
      apiSecret: "test_api_secret",
    }));
    const paramsWithoutSignature = new URLSearchParams(url.searchParams);
    paramsWithoutSignature.delete("signature");
    const message = [...paramsWithoutSignature.entries()]
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join("");
    url.searchParams.set("signature", createHmac("sha256", "test_api_secret").update(message).digest("hex"));

    const signed = await loader({
      request: new Request(url),
      params: { bundleId: "1" },
      context: {},
    } as any) as Response;
    expect(signed.status).toBe(200);
  });

  it("rejects invalid signatures before querying the bundle", async () => {
    const request = makeSignedRequest();
    const url = new URL(request.url);
    url.searchParams.set("signature", "bad-signature");

    const response = (await loader({
      request: new Request(url.toString()),
      params: { bundleId: "1" },
      context: {},
    } as any)) as Response;

    expect(response.status).toBe(400);
    expect(getDb().bundle.findFirst).not.toHaveBeenCalled();
  });
});
