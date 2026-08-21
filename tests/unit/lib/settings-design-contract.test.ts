import {
  createSettingsDesignState,
  parseSettingsDesignPayload,
} from "../../../app/lib/settings-design-contract";

describe("Settings Design DTO", () => {
  it("normalizes a complete known field map", () => {
    const state = createSettingsDesignState();

    expect(parseSettingsDesignPayload(state)).toEqual(state);
  });

  it.each([
    { field: "Primary Color", value: "not-a-color" },
    { field: "Primary Font Size", value: "-1" },
    { field: "Primary Font Weight", value: "Heavy" },
    { field: "Image Fit", value: "Crop" },
    { field: "generalSettings.loadingGifUrl", value: "http://cdn.example.test/loading.gif" },
  ])("rejects invalid $field values", ({ field, value }: any) => {
    const state = createSettingsDesignState();

    expect(() => parseSettingsDesignPayload({
      ...state,
      fieldValues: { ...state.fieldValues, [field]: value },
    })).toThrow(`Invalid Design field: ${field}`);
  });

  it("ignores unmapped or obsolete fields without throwing or persisting them", () => {
    const state = createSettingsDesignState();
    const result = parseSettingsDesignPayload({
      ...state,
      fieldValues: { ...state.fieldValues, obsoleteField: "value", "Bundle Loading GIF": "https://example.com/loader.gif" },
    });

    expect(result.fieldValues["obsoleteField"]).toBeUndefined();
    expect(result.fieldValues["Bundle Loading GIF"]).toBeUndefined();
    expect(result.fieldValues["Primary Color"]).toBe("#000000");
  });
});
