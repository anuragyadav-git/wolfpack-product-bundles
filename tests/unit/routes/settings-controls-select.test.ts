import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ControlsField,
  ControlsFormGroup,
} from "../../../app/routes/app/app.settings/SettingsControls";
import { LanguageSettingsView } from "../../../app/routes/app/app.settings/LanguageSettingsView";

describe("Settings Controls select", () => {
  it("uses selector-safe option values while preserving merchant-facing labels", () => {
    const options = [
      "Amount and percentage (Eg: \"You save $73.00 (19%)\")",
      "Amount only (Eg: \"You save $73.00\")",
      "Percentage only (Eg: \"You save 19%\")",
    ];

    const view = renderToStaticMarkup(React.createElement(ControlsField, {
      field: {
        key: "shared.cartMessaging.discountDisplay.format",
        label: "Discount format",
        kind: "select",
        options,
      },
      value: options[0],
      onChange: jest.fn(),
    }));

    expect(view).toContain('value="controls-option-0"');
    expect(view).toContain("You save $73.00 (19%)");
    expect(view).not.toContain('value="Amount and percentage');
  });

  it("uses the Polaris overlay command for the variables action", () => {
    const view = renderToStaticMarkup(React.createElement(ControlsFormGroup, {
      title: "Product Card",
      fields: [{
        key: "productCardAddedText_inPage",
        label: "Product Added label",
        kind: "text",
        value: "Added x{{allowedQuantity}}",
      }],
      values: { productCardAddedText_inPage: "Added x{{allowedQuantity}}" },
      onFieldChange: jest.fn(),
      onShowVariables: jest.fn(),
    }));

    expect(view).toContain('commandFor="settings-language-variables"');
    expect(view).toContain('command="--show"');
  });

  it("opens Language field variables through the Polaris modal command", () => {
    const view = renderToStaticMarkup(React.createElement(LanguageSettingsView, {
      activeLayout: "Product Page Layout",
      activePanel: "Product Card",
      fieldGroups: [{
        title: "Product Card",
        fields: [{
          key: "productCardAddedText_inPage",
          label: "Product Added label",
          kind: "text",
          value: "Added x{{allowedQuantity}}",
        }],
      }],
      fieldValues: { productCardAddedText_inPage: "Added x{{allowedQuantity}}" },
      languageMode: "MULTIPLE",
      localeFieldValues: { en: {} },
      selectedLocale: "en",
      onBack: jest.fn(),
      onFieldChange: jest.fn(),
      onLayoutChange: jest.fn(),
      onModeChange: jest.fn(),
      onPanelChange: jest.fn(),
      onRemoveLocale: jest.fn(),
      onSelectLocale: jest.fn(),
      onShowVariables: jest.fn(),
    }));

    expect(view).toContain('commandFor="settings-language-variables"');
    expect(view).toContain('command="--show"');
  });

  it("uses concise Language labels and exposes mobile section pills", () => {
    const view = renderToStaticMarkup(React.createElement(LanguageSettingsView, {
      activeLayout: "Landing Page Layout",
      activePanel: "Product Card",
      fieldGroups: [],
      fieldValues: {},
      languageMode: "MULTIPLE",
      localeFieldValues: { en: {} },
      selectedLocale: "en",
      onBack: jest.fn(),
      onFieldChange: jest.fn(),
      onLayoutChange: jest.fn(),
      onModeChange: jest.fn(),
      onPanelChange: jest.fn(),
      onRemoveLocale: jest.fn(),
      onSelectLocale: jest.fn(),
      onShowVariables: jest.fn(),
    }));

    expect(view).toContain("Add or edit languages");
    expect(view).toContain("Shared labels");
    expect(view).toContain("Bundle labels");
    expect(view).toContain("Choose a layout, then edit its labels.");
    expect(view).toContain("<s-clickable-chip");
  });
});
