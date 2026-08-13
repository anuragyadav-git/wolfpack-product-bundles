import React from "react";

import { DashboardStatusGrid } from "../../../app/routes/app/app.dashboard/DashboardStatusGrid";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const APP_EMBED_RESOURCE = {
  handle: "bundle-app-embed",
  label: "Wolfpack Bundle",
  kind: "embed",
  status: "active" as const,
  enabled: true,
  target: null,
};

describe("dashboard status banner dismissal", () => {
  it("clears the banner after its dismiss event", () => {
    const setDismissed = jest.fn();
    const useStateMock = React.useState as jest.Mock;
    const props = {
      resources: [APP_EMBED_RESOURCE],
      error: false,
      appEmbedEnabled: true,
      themeEditorUrl: "https://theme-editor.test",
      onOpenThemeEditor: jest.fn(),
    };

    useStateMock.mockReturnValueOnce([false, setDismissed]);
    const banner = DashboardStatusGrid(props) as React.ReactElement<{
      onDismiss?: () => void;
    }>;

    banner.props.onDismiss?.();
    expect(setDismissed).toHaveBeenCalledWith(true);

    useStateMock.mockReturnValueOnce([true, setDismissed]);
    expect(DashboardStatusGrid(props)).toBeNull();
  });
});
