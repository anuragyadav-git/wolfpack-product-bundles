import { useEffect, useRef, useState, type ElementRef } from "react";
import { useTranslation } from "react-i18next";
import {
  INTEGRATION_CATEGORIES,
  type IntegrationCard,
} from "../../../lib/admin-configuration-surfaces";
import { openSupportChatWithDraft } from "../../../lib/support-chat.client";
import { AdminPageTitleBar } from "../../../components/AdminPageNavigation";
import styles from "./IntegrationsRouteShell.module.css";

type IntegrationGuide = IntegrationCard & { category: string };
type PolarisModalElement = ElementRef<"s-modal">;

function IntegrationSetupGuide({
  integration,
  onClose,
}: {
  integration: IntegrationGuide;
  onClose: () => void;
}) {
  const modalRef = useRef<PolarisModalElement | null>(null);

  useEffect(() => {
    const modal = modalRef.current;
    modal?.showOverlay?.();
    return () => modal?.hideOverlay?.();
  }, []);

  return (
    <s-modal
      ref={modalRef}
      id={`integration-setup-${integration.id}`}
      heading={integration.title}
      onHide={onClose}
    >
      <s-stack direction="block" gap="base">
        {integration.guideSummary.map((instruction, index) => (
          <s-stack key={instruction} direction="inline" gap="small" alignItems="start">
            <s-badge>{String(index + 1)}</s-badge>
            <s-paragraph>{instruction}</s-paragraph>
          </s-stack>
        ))}
      </s-stack>
    </s-modal>
  );
}

function IntegrationsCatalog({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationGuide | null>(null);
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
                          <s-icon type="product" size="base" />
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
                        inlineSize="fill"
                        onClick={() => setSelectedIntegration(integration)}
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
      {selectedIntegration ? (
        <IntegrationSetupGuide
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      ) : null}
    </>
  );
}

export default function IntegrationsRouteShell({ onBack }: { onBack: () => void }) {
  return <IntegrationsCatalog onBack={onBack} />;
}
