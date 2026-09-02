import { PRICING_FAQ, type FAQItem } from "../../constants/pricing-data";
import { useTranslation } from "react-i18next";
import brandStyles from "../../styles/billing/subscription-brand.module.css";

export interface FAQSectionProps {
  faqs?: FAQItem[];
}

export function FAQSection({ faqs = PRICING_FAQ }: FAQSectionProps) {
  const { t } = useTranslation();
  return (
    <s-section>
      <s-stack direction="block" gap="base">
        <h3 className={brandStyles.sectionTitle}>{t("billing.faq.heading")}</h3>
        <s-stack direction="block" gap="base">
          {faqs.map((faq, index) => (
            <s-stack key={index} direction="block" gap="small-400">
              <p className={brandStyles.featureHeading}>
                {t(faq.questionMessageId)}
              </p>
              <p className={brandStyles.muted}>{t(faq.answerMessageId)}</p>
            </s-stack>
          ))}
        </s-stack>
      </s-stack>
    </s-section>
  );
}
