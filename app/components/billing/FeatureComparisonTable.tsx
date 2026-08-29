import { FEATURE_COMPARISON, type FeatureComparisonRow } from "../../constants/pricing-data";
import styles from "./FeatureComparisonTable.module.css";
import brandStyles from "../../styles/billing/subscription-brand.module.css";
import { useTranslation } from "react-i18next";

function renderFeatureValue(value: boolean | string, translate: (messageId: string) => string) {
  if (value === true) {
    return (
      <div className={styles.check}>
        <s-icon type="check" />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className={styles.unavailable}>
        <s-icon type="x" />
      </div>
    );
  }
  return <span className={styles.value}>{translate(value)}</span>;
}

export interface FeatureComparisonTableProps {
  features?: FeatureComparisonRow[];
}

export function FeatureComparisonTable({
  features = FEATURE_COMPARISON,
}: FeatureComparisonTableProps) {
  const { t } = useTranslation();
  return (
    <s-section>
      <s-stack direction="block" gap="base">
        <h3 className={brandStyles.sectionTitle}>{t("billing.route.features")}</h3>
        <div className={styles.scrollRegion} role="region" aria-label="Plan feature comparison" tabIndex={0}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.featureHeading}>
                  Feature
                </th>
                <th className={styles.planHeading}>
                  Free
                </th>
                <th className={`${styles.planHeading} ${styles.growthColumn}`}>
                  Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((row, index) => (
                <tr
                  key={index}
                  className={`${styles.bodyRow} ${row.highlight ? styles.highlightRow : ""}`}
                >
                  <td className={styles.featureCell} data-highlight={row.highlight || undefined}>
                    {t(row.featureMessageId)}
                  </td>
                  <td className={styles.planCell}>
                    {renderFeatureValue(row.free, t)}
                  </td>
                  <td className={`${styles.planCell} ${styles.growthColumn}`}>
                    {renderFeatureValue(row.growth, t)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </s-stack>
    </s-section>
  );
}
