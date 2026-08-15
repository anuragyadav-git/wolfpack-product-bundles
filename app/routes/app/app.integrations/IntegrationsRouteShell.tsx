import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AdminRouteLoadingBar,
  waitForAdminRouteLoadingBar,
} from "../../../components/AdminRouteLoadingBar";
import { INTEGRATION_CATEGORIES } from "../../../lib/admin-configuration-surfaces";
import { openSupportChatWithDraft } from "../../../lib/support-chat.client";
import { AdminPageTitleBar } from "../../../components/AdminPageNavigation";
import styles from "./IntegrationsRouteShell.module.css";

export function waitForIntegrationsRouteReady(
  loadingBar: Promise<void> = waitForAdminRouteLoadingBar(),
) {
  return loadingBar.then(() => null);
}

export function IntegrationsLoadingState() {
  return <AdminRouteLoadingBar label="Loading Integrations" />;
}

function IntegrationsCatalog({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const integrations = INTEGRATION_CATEGORIES.flatMap((category) =>
    category.cards.map((integration) => ({
      ...integration,
      category: category.title,
    })),
  );

  const handleRequestIntegration = () => {
    openSupportChatWithDraft(t("integrations.requestMessage"));
  };

  return (
    <>
      <AdminPageTitleBar
        title="Integrations"
        breadcrumbLabel="Dashboard"
        onBack={onBack}
      />
      <s-query-container
        containerName="integrations-page"
        className={styles.queryContainer}
      >
        <main className={styles.page}>
          <header className={styles.header}>
            <s-stack gap="small">
              <s-stack direction="inline" gap="small" alignItems="center">
                <s-button
                  variant="tertiary"
                  icon="arrow-left"
                  accessibilityLabel="Back to previous page"
                  onClick={onBack}
                />
                <s-heading>Integrations Hub</s-heading>
              </s-stack>
              <s-paragraph color="subdued">
                Connect the tools that support your bundle workflow.
              </s-paragraph>
            </s-stack>
            <s-button
              variant="primary"
              icon="apps"
              onClick={handleRequestIntegration}
            >
              Request Integration
            </s-button>
          </header>

          <s-section heading="Available integrations">
            <div className={styles.catalogGrid}>
              {integrations.map((integration) => (
                <s-box
                  key={integration.id}
                  background="base"
                  border="base"
                  borderRadius="large"
                  padding="base"
                >
                  <article className={styles.card}>
                    <div className={`${styles.cardRow} ${styles.mediaRow}`}>
                      <span className={styles.logoFrame}>
                        {integration.logoUrl ? (
                          <img
                            className={styles.logoImage}
                            src={integration.logoUrl}
                            alt={`${integration.title} logo`}
                          />
                        ) : (
                          <s-icon type="product" size="large" />
                        )}
                      </span>
                      <s-badge tone={integration.status === "Supported" ? "success" : "info"}>
                        {integration.status}
                      </s-badge>
                    </div>

                    <div className={styles.cardRow}>
                      <s-heading>{integration.title}</s-heading>
                    </div>

                    <div className={styles.cardRow}>
                      <s-text color="subdued">{integration.category}</s-text>
                    </div>

                    <div className={`${styles.cardRow} ${styles.descriptionRow}`}>
                      <s-paragraph color="subdued">
                        {integration.description}
                      </s-paragraph>
                    </div>

                    <div className={`${styles.cardRow} ${styles.actionRow}`}>
                      <s-button
                        href={integration.setupUrl}
                        target="_blank"
                        inlineSize="fill"
                      >
                        {integration.ctaLabel}
                      </s-button>
                    </div>
                  </article>
                </s-box>
              ))}
            </div>
          </s-section>
        </main>
      </s-query-container>
    </>
  );
}

export default function IntegrationsRouteShell({ onBack }: { onBack: () => void }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void waitForIntegrationsRouteReady().then(() => {
      if (active) setReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return ready ? <IntegrationsCatalog onBack={onBack} /> : <IntegrationsLoadingState />;
}
