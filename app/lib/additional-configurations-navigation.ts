import { CONTROL_LAYOUTS } from "./admin-configuration-surfaces";

export type AdditionalConfigurationsNavigation = {
  layout: string;
  tab: string;
  group: string;
};

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseAdditionalConfigurationsNavigation(
  searchParams: URLSearchParams,
): AdditionalConfigurationsNavigation {
  const requestedLayout = searchParams.get("layout") ?? "";
  const layout = CONTROL_LAYOUTS.find((candidate) => (
    candidate.id === requestedLayout
    || toSlug(candidate.label) === requestedLayout
  )) ?? CONTROL_LAYOUTS[0];
  const requestedTab = searchParams.get("tab") ?? "";
  const tab = layout.tabs.find((candidate) => (
    toSlug(candidate.title) === requestedTab
  )) ?? layout.tabs[0];
  const groupNames = Array.from(new Set(
    tab.fields.map((field) => field.group ?? tab.contentTitle ?? tab.title),
  ));
  const requestedGroup = searchParams.get("group") ?? "";
  const group = groupNames.find((candidate) => toSlug(candidate) === requestedGroup)
    ?? groupNames[0]
    ?? tab.contentTitle
    ?? tab.title;

  return {
    layout: layout.label,
    tab: tab.title,
    group,
  };
}

export function serializeAdditionalConfigurationsNavigation(
  navigation: AdditionalConfigurationsNavigation,
) {
  return new URLSearchParams({
    layout: toSlug(navigation.layout).replace(/-layout$/, ""),
    tab: toSlug(navigation.tab),
    group: toSlug(navigation.group),
  });
}
