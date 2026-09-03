import { useId } from "react";
import { useTranslation } from "react-i18next";

import {
  HELP_TOOLTIPS,
  type HelpTooltipKey,
} from "../../../../constants/help-tooltips";
import sharedStyles from "../../../../styles/routes/bundle-configure-shared.module.css";

export function ConfigureHelpPopover({
  tooltipKey,
}: {
  tooltipKey: HelpTooltipKey;
}) {
  const { t } = useTranslation();
  const reactId = useId().replace(/:/g, "");
  const popoverId = `configure-help-${tooltipKey}-${reactId}`;
  const tooltip = HELP_TOOLTIPS[tooltipKey];
  const title = t(`tooltips.${tooltipKey}.title`);
  const description = t(`tooltips.${tooltipKey}.description`);
  const imageAlt = t(`tooltips.${tooltipKey}.imageAlt`);

  return (
    <span className={sharedStyles.configureHelpPopover}>
      <s-button
        type="button"
        variant="tertiary"
        icon="info"
        accessibilityLabel={t("tooltips.helpLabel", { title })}
        commandFor={popoverId}
      />
      <s-popover id={popoverId} inlineSize="320px">
        <s-box padding="base">
          <s-stack direction="block" gap="small">
            {tooltip.imageSrc ? (
              <s-image
                src={tooltip.imageSrc}
                alt={imageAlt}
                objectFit="contain"
                loading="lazy"
              />
            ) : null}
            <s-heading>{title}</s-heading>
            <s-paragraph>{description}</s-paragraph>
          </s-stack>
        </s-box>
      </s-popover>
    </span>
  );
}
