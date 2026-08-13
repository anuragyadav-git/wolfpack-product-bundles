import styles from "./SettingsLandingShell.module.css";

export type SettingsWorkspaceView = "design" | "language" | "controls";

const SETTINGS_SECTIONS: Array<{
  id: SettingsWorkspaceView;
  title: string;
  description: string;
  icon: "edit" | "globe" | "filter";
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
    icon: "globe",
  },
  {
    id: "controls",
    title: "Controls",
    description: "Change loading screen gif, add custom CSS, modify checkout settings and more",
    icon: "filter",
  },
];

export function SettingsLandingShell({
  onSelect,
  onIntent,
}: {
  onSelect: (view: SettingsWorkspaceView) => void;
  onIntent?: () => void;
}) {
  return (
    <s-page heading="Settings" inlineSize="large">
      <s-query-container
        containerName="settings-landing"
        className={styles.landingViewport}
      >
        <div className={styles.landingContent}>
          <s-grid
            gridTemplateColumns="@container settings-landing (inline-size > 840px) 1fr 1fr 1fr, 1fr"
            gap="large"
          >
            {SETTINGS_SECTIONS.map((section) => (
              <s-clickable
                key={section.id}
                className={styles.settingsTile}
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
                      className={styles.tileIcon}
                      background="subdued"
                      borderRadius="base"
                      inlineSize="48px"
                      blockSize="48px"
                    >
                      <s-icon type={section.icon} size="base" />
                    </s-box>
                    <s-icon
                      className={styles.tileArrow}
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
