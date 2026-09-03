import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const mockNavigate = jest.fn();
const mockNavigateBackOrFallback = jest.fn();
let mockOnBack: (() => void) | undefined;

jest.mock("@remix-run/react", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

jest.mock("../../../app/lib/navigation", () => ({
  navigateBackOrFallback: mockNavigateBackOrFallback,
}));

jest.mock(
  "../../../app/routes/app/app.integrations/IntegrationsRouteShell",
  () => ({
    __esModule: true,
    default: ({ onBack }: { onBack: () => void }) => {
      mockOnBack = onBack;
      return null;
    },
  }),
);

describe("Integrations back navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnBack = undefined;
  });

  it("uses previous-page navigation with Dashboard as the fallback", async () => {
    const { default: IntegrationsRoute } = await import(
      "../../../app/routes/app/app.integrations"
    );

    renderToStaticMarkup(React.createElement(IntegrationsRoute));
    expect(mockOnBack).toBeDefined();

    mockOnBack?.();

    expect(mockNavigateBackOrFallback).toHaveBeenCalledWith(
      mockNavigate,
      "/app/dashboard",
      { replaceFallback: true },
    );
  });
});
