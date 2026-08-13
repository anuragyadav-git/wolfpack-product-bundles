import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AdminRouteLoadingBar,
  waitForAdminRouteLoadingBar,
} from "../../../components/AdminRouteLoadingBar";
import { INTEGRATION_CATEGORIES } from "../../../lib/admin-configuration-surfaces";
import { openSupportChatWithDraft } from "../../../lib/support-chat.client";
import styles from "./IntegrationsRouteShell.module.css";

export function waitForIntegrationsRouteReady(
  loadingBar: Promise<void> = waitForAdminRouteLoadingBar(),
) {
  return loadingBar.then(() => null);
}

export function IntegrationsLoadingState() {
  return <AdminRouteLoadingBar label="Loading Integrations" />;
}

function IntegrationsCatalog() {
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
      <ui-title-bar title="Integrations" />
      <s-query-container
        containerName="integrations-page"
        className={styles.queryContainer}
      >
        <main className={styles.page}>
          <header className={styles.header}>
            <s-stack gap="small">
              <s-heading>Integrations Hub</s-heading>
              <s-paragraph color="subdued">
                Connect the tools that support your bundle workflow.
              </s-paragraph>
            </s-stack>
            <s-button variant="primary" onClick={handleRequestIntegration}>
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
                    <div className={styles.cardHeader}>
                      <div className={styles.identity}>
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
                        <s-stack gap="small-100">
                          <s-heading>{integration.title}</s-heading>
                          <s-text color="subdued">{integration.category}</s-text>
                        </s-stack>
                      </div>
                      <s-badge tone={integration.status === "Supported" ? "success" : "info"}>
                        {integration.status}
                      </s-badge>
                    </div>

                    <s-paragraph color="subdued">
                      {integration.description}
                    </s-paragraph>

                    <s-button
                      href={integration.setupUrl}
                      target="_blank"
                      inlineSize="fill"
                    >
                      {integration.ctaLabel}
                    </s-button>
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

export default function IntegrationsRouteShell() {
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

  return ready ? <IntegrationsCatalog /> : <IntegrationsLoadingState />;
}
