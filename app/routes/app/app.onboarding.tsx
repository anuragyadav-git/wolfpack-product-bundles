import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { BundleType } from "../../constants/bundle";
import { buildBundleCreatePath } from "../../lib/onboarding-bundle-type";
import { openSupportChat } from "../../lib/support-chat.client";

type GuideStep = {
  id: number;
  title: string;
  description: string;
  details: string[];
};

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 0,
    title: "Choose your bundle format",
    description: "Pick the storefront experience that fits your offer.",
    details: [
      "Product-page bundles keep shoppers on a product page.",
      "Full-page bundles give shoppers a dedicated bundle journey.",
    ],
  },
  {
    id: 1,
    title: "Configure your bundle",
    description: "Add products, steps, pricing, and bundle rules in the guided editor.",
    details: [
      "Create the bundle name and choose its products.",
      "Set pricing and save before previewing the customer experience.",
    ],
  },
  {
    id: 2,
    title: "Preview and publish",
    description: "Use the storefront preview and setup status to take the bundle live.",
    details: [
      "Enable the required theme resource when the app asks for it.",
      "Preview the result, then publish the theme changes.",
    ],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [selectedBundleType, setSelectedBundleType] = useState<BundleType>(BundleType.PRODUCT_PAGE);
  const [expandedGuideStep, setExpandedGuideStep] = useState(0);

  const openCreateFlow = () => {
    navigate(buildBundleCreatePath(selectedBundleType));
  };

  return (
    <s-query-container containerName="onboarding-page">
      <s-page heading="Get started with Wolfpack" inlineSize="large">
        <s-stack direction="block" gap="large">
        <s-section>
          <s-stack direction="block" gap="base">
            <s-heading>Build your first bundle</s-heading>
            <s-paragraph>
              Choose a bundle format, then follow the guided editor to configure and publish it in Shopify.
            </s-paragraph>
            <s-grid
              gridTemplateColumns="@container onboarding-page (inline-size <= 680px) 1fr, 1fr 1fr"
              gap="base"
            >
              <s-clickable
                accessibilityLabel="Select Product-page bundle"
                padding="base"
                border="base"
                borderRadius="base"
                background={selectedBundleType === BundleType.PRODUCT_PAGE ? "subdued" : "base"}
                onClick={() => setSelectedBundleType(BundleType.PRODUCT_PAGE)}
              >
                <s-stack direction="block" gap="small">
                  <s-stack direction="inline" alignItems="center" gap="small">
                    <s-icon type="product" size="base" />
                    <s-heading>Product-page bundle</s-heading>
                    {selectedBundleType === BundleType.PRODUCT_PAGE && <s-badge tone="success">Selected</s-badge>}
                  </s-stack>
                  <s-text color="subdued">A bundle widget that appears on the product pages you choose.</s-text>
                </s-stack>
              </s-clickable>
              <s-clickable
                accessibilityLabel="Select Full-page bundle"
                padding="base"
                border="base"
                borderRadius="base"
                background={selectedBundleType === BundleType.FULL_PAGE ? "subdued" : "base"}
                onClick={() => setSelectedBundleType(BundleType.FULL_PAGE)}
              >
                <s-stack direction="block" gap="small">
                  <s-stack direction="inline" alignItems="center" gap="small">
                    <s-icon type="note" size="base" />
                    <s-heading>Full-page bundle</s-heading>
                    {selectedBundleType === BundleType.FULL_PAGE && <s-badge tone="success">Selected</s-badge>}
                  </s-stack>
                  <s-text color="subdued">A dedicated bundle page with a guided, step-by-step shopping flow.</s-text>
                </s-stack>
              </s-clickable>
            </s-grid>
            <s-button-group>
              <s-button variant="primary" onClick={openCreateFlow}>Create your first bundle</s-button>
              <s-button onClick={() => navigate("/app/dashboard")}>Go to dashboard</s-button>
            </s-button-group>
          </s-stack>
        </s-section>

        <s-section>
          <s-stack direction="block" gap="base">
            <s-stack direction="inline" alignItems="center" justifyContent="space-between">
              <s-heading>Setup guide</s-heading>
              <s-text color="subdued">{expandedGuideStep + 1} of {GUIDE_STEPS.length}</s-text>
            </s-stack>
            <s-stack direction="block" gap="small">
              {GUIDE_STEPS.map((step) => {
                const isExpanded = expandedGuideStep === step.id;
                return (
                  <s-box key={step.id} padding="base" border="base" borderRadius="base">
                    <s-stack direction="block" gap="small">
                      <s-stack direction="inline" alignItems="center" justifyContent="space-between" gap="base">
                        <s-stack direction="inline" alignItems="center" gap="small">
                          <s-badge tone={isExpanded ? "info" : "neutral"}>{step.id + 1}</s-badge>
                          <s-heading>{step.title}</s-heading>
                        </s-stack>
                        <s-button
                          variant="tertiary"
                          icon={isExpanded ? "chevron-up" : "chevron-down"}
                          accessibilityLabel={`${isExpanded ? "Collapse" : "Expand"} ${step.title}`}
                          onClick={() => setExpandedGuideStep(isExpanded ? -1 : step.id)}
                        />
                      </s-stack>
                      <s-text color="subdued">{step.description}</s-text>
                      {isExpanded && (
                        <s-unordered-list>
                          {step.details.map((detail) => <s-list-item key={detail}>{detail}</s-list-item>)}
                        </s-unordered-list>
                      )}
                    </s-stack>
                  </s-box>
                );
              })}
            </s-stack>
          </s-stack>
        </s-section>

        <s-section>
          <s-stack direction="inline" alignItems="center" justifyContent="space-between" gap="base">
            <s-stack direction="block" gap="small-100">
              <s-heading>Need help?</s-heading>
              <s-text color="subdued">Our support team can help you set up your first bundle.</s-text>
            </s-stack>
            <s-button onClick={openSupportChat}>Chat with support</s-button>
          </s-stack>
        </s-section>
        </s-stack>
      </s-page>
    </s-query-container>
  );
}
