import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PricingTierBadgeFields } from "../../../app/routes/app/_shared/bundle-configure/PricingTierBadgeFields";
import {
  DESIGN_CONFIGURATION,
} from "../../../app/lib/admin-configuration-surfaces";
import {
  SETTINGS_DESIGN_DEFAULT_FIELD_VALUES,
} from "../../../app/lib/settings-design-contract";

jest.mock("../../../app/i18n/config", () => ({
  translateAdmin: (key: string) => key,
  translateAdminCopy: (key: string) => key,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("Tier Badge Settings Design Migration", () => {
  describe("PricingTierBadgeFields", () => {
    it("renders only enablement, text input, and Show variables button without shape/visibility/color fields", () => {
      const onChange = jest.fn();
      const rule = {
        id: "rule-1",
        conditionValue: 2,
        discountValue: 10,
        tierBadge: {
          enabled: true,
          text: "Save {{saved_percentage}}",
          shape: "pill" as const,
          visibility: "always" as const,
        },
      } as any;

      const view = renderToStaticMarkup(
        React.createElement(PricingTierBadgeFields, {
          rule,
          onChange,
          validationErrors: {},
        }),
      );

      // Renders text field
      expect(view).toContain('id="configure-discount-rules-rule-1-tierBadge-text"');

      // Does NOT render shape/visibility/color inputs
      expect(view).not.toContain('id="configure-discount-rules-rule-1-tierBadge-shape"');
      expect(view).not.toContain('id="configure-discount-rules-rule-1-tierBadge-visibility"');
      expect(view).not.toContain('id="configure-discount-rules-rule-1-tierBadge-foregroundColor"');
      expect(view).not.toContain('id="configure-discount-rules-rule-1-tierBadge-backgroundColor"');

      // Renders Show variables button
      expect(view).toContain("adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.showVariables");

      // Renders Variables modal
      expect(view).toContain('id="tier-badge-variables-modal-rule-1"');
      expect(view).toContain("{{saved_percentage}}");
      expect(view).toContain("{{saved_total}}");
    });
  });

  describe("Settings -> Design configuration", () => {
    it("includes Tier Badge styling fields in DESIGN_CONFIGURATION", () => {
      const tierBadgeTab = DESIGN_CONFIGURATION.find(
        (tab) => tab.title === "Tier Badge" || tab.title === "Discount Tier Badge",
      );
      expect(tierBadgeTab).toBeDefined();

      const fieldKeys = tierBadgeTab!.fields.map((f) => f.key ?? f.label);
      expect(fieldKeys).toContain("stylePresets.tierBadge.shape");
      expect(fieldKeys).toContain("stylePresets.tierBadge.visibility");
      expect(fieldKeys).toContain("stylePresets.tierBadge.textColor");
      expect(fieldKeys).toContain("stylePresets.tierBadge.backgroundColor");
    });

    it("has defaults for Tier Badge styling fields in SETTINGS_DESIGN_DEFAULT_FIELD_VALUES", () => {
      expect(
        SETTINGS_DESIGN_DEFAULT_FIELD_VALUES["stylePresets.tierBadge.shape"],
      ).toBe("Pill");
      expect(
        SETTINGS_DESIGN_DEFAULT_FIELD_VALUES[
          "stylePresets.tierBadge.visibility"
        ],
      ).toBe("Always");
      expect(
        SETTINGS_DESIGN_DEFAULT_FIELD_VALUES[
          "stylePresets.tierBadge.textColor"
        ],
      ).toBe("#ffffff");
      expect(
        SETTINGS_DESIGN_DEFAULT_FIELD_VALUES[
          "stylePresets.tierBadge.backgroundColor"
        ],
      ).toBe("#1f2937");
    });
  });
});
