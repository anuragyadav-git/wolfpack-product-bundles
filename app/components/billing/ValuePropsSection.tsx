import { VALUE_PROPS, type ValueProp } from "../../constants/pricing-data";
import valuePropStyles from "../../styles/billing/value-props.module.css";
import brandStyles from "../../styles/billing/subscription-brand.module.css";
import { useTranslation } from "react-i18next";

export interface ValuePropsSectionProps {
  valueProps?: ValueProp[];
}

export function ValuePropsSection({
  valueProps = VALUE_PROPS,
}: ValuePropsSectionProps) {
  const { t } = useTranslation();
  return (
    <s-section>
      <s-stack direction="block" gap="base">
        <s-stack direction="inline" alignItems="center" gap="small-100">
          <div className={brandStyles.accent}>
            <s-icon type="check" />
          </div>
          <h3 className={brandStyles.sectionTitle}>{t("billing.cta.heading")}</h3>
        </s-stack>
        <div className={valuePropStyles.grid}>
          {valueProps.map((prop, index) => (
            <div
              key={index}
              className={valuePropStyles.card}
            >
              <s-stack direction="block" gap="small-100">
                <span className={valuePropStyles.icon}>
                  <s-icon type={prop.icon} size="base" />
                </span>
                <h4 className={valuePropStyles.title}>{t(prop.titleMessageId)}</h4>
                <p className={valuePropStyles.description}>{t(prop.descriptionMessageId)}</p>
              </s-stack>
            </div>
          ))}
        </div>
      </s-stack>
    </s-section>
  );
}
