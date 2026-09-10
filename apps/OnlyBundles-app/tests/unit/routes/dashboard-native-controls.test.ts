import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardBundlesPanel } from "../../../app/routes/app/app.dashboard/DashboardBundlesPanel";

jest.mock("@remix-run/react", () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown) =>
      typeof fallback === "string" ? fallback : key,
  }),
}));

describe("Dashboard native filter controls", () => {
  it("renders the supported status and bundle-type choices through Polaris selects", () => {
    const view = renderToStaticMarkup(
      React.createElement(DashboardBundlesPanel, {
        bundles: [
          {
            id: "bundle-1",
            name: "Bundle One",
            status: "active",
            bundleType: "product_page",
          },
        ],
        deletedBundleIds: new Set<string>(),
        renamedBundleNames: {},
        editingBundleId: null,
        previewingBundleId: null,
        activeActionMenuBundleId: null,
        onActionMenuRequest: jest.fn(),
        onEdit: jest.fn(),
        onRename: jest.fn(),
        onClone: jest.fn(),
        onDelete: jest.fn(),
        onPreview: jest.fn(),
      })
    );

    expect(view).toContain('<s-select name="status-filter-list"');
    expect(view).toContain('label="dashboard.table.status"');
    expect(view).toContain('<s-option value="active">');
    expect(view).toContain('<s-option value="draft">');
    expect(view).toContain('<s-option value="unlisted">');
    expect(view).toContain('<s-select name="type-filter-list"');
    expect(view).toContain('label="dashboard.table.type"');
    expect(view).toContain('<s-option value="product_page">');
    expect(view).toContain('<s-option value="full_page">');
    expect(view).toContain(
      '<s-select name="bundles-per-page-list" label="dashboard.pagination.perPageLabel" labelAccessibilityVisibility="exclusive" value="20"><s-option value="20">'
    );
    expect(view).not.toContain(
      'name="status-filter-list" label="dashboard.filters.byStatus" labelAccessibilityVisibility="exclusive"'
    );
    expect(view).not.toContain(
      'name="type-filter-list" label="dashboard.filters.byType" labelAccessibilityVisibility="exclusive"'
    );
  });
});
