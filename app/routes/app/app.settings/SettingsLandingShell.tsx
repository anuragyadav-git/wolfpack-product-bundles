export type SettingsWorkspaceView = "design" | "language" | "controls";

const SETTINGS_SECTIONS: Array<{
  id: SettingsWorkspaceView;
  title: string;
  description: string;
  icon: "edit" | "language-translate" | "filter";
}> = [
  {
    id: "design",
    title: "Design",
    description: "Modify and customize all design elements of the bundle here",
    icon: "edit",
  },
  {
    id: "language",
    title: "Language",
    description: "Configure all text, labels, and translations for your bundle here",
    icon: "language-translate",
  },
  {
    id: "controls",
    title: "Controls",
    description: "Change loading screen gif, add custom CSS, modify checkout settings and more",
    icon: "filter",
  },
];

export function SettingsLandingShell({
  onBack,
  onSelect,
  onIntent,
}: {
  onBack: () => void;
  onSelect: (view: SettingsWorkspaceView) => void;
  onIntent?: () => void;
}) {
  return (
    <s-page inlineSize="large">
      <s-query-container
        containerName="settings-landing"
        className="settingsLandingViewport"
      >
        <div className="settingsLandingContent">
          <s-stack direction="inline" gap="small" alignItems="center">
            <s-button
              variant="tertiary"
              icon="arrow-left"
              accessibilityLabel="Back to previous page"
              onClick={onBack}
            />
            <s-heading>Settings</s-heading>
          </s-stack>
          <s-grid
            gridTemplateColumns="@container settings-landing (inline-size > 840px) 1fr 1fr 1fr, 1fr"
            gap="large"
          >
            {SETTINGS_SECTIONS.map((section) => (
              <s-clickable
                key={section.id}
                className="settingsLandingTile"
                accessibilityLabel={`Open ${section.title} settings`}
                background="base"
                padding="large"
                border="base"
                borderRadius="large"
                onFocus={onIntent}
                onClick={() => onSelect(section.id)}
              >
                <s-stack gap="large">
                  <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <s-box
                      background="subdued"
                      borderRadius="base"
                      inlineSize="48px"
                      blockSize="48px"
                    >
                      <s-stack
                        direction="inline"
                        justifyContent="center"
                        alignItems="center"
                        inlineSize="100%"
                        blockSize="100%"
                      >
                        <s-icon type={section.icon} size="large" />
                      </s-stack>
                    </s-box>
                    <s-icon
                      className="settingsLandingTileArrow"
                      type="arrow-right"
                      size="base"
                    />
                  </s-stack>
                  <s-stack gap="small">
                    <s-heading>{section.title}</s-heading>
                    <s-paragraph color="subdued">
                      {section.description}
                    </s-paragraph>
                  </s-stack>
                </s-stack>
              </s-clickable>
            ))}
          </s-grid>
        </div>
      </s-query-container>
    </s-page>
  );
}

export function SettingsWorkspaceError({ onExit }: { onExit: () => void }) {
  return (
    <s-page heading="Settings" inlineSize="large">
      <s-banner
        heading="Settings could not be loaded"
        tone="critical"
        dismissible={false}
        hidden={false}
      >
        <s-stack direction="block" gap="small">
          <s-paragraph>
            Reload the page or return to Settings and try again.
          </s-paragraph>
          <s-button onClick={onExit}>Return to Settings</s-button>
        </s-stack>
      </s-banner>
    </s-page>
  );
}
