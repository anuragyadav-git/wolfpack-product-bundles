import en from "@shopify/polaris/locales/en.json";
import fr from "@shopify/polaris/locales/fr.json";
import de from "@shopify/polaris/locales/de.json";
import es from "@shopify/polaris/locales/es.json";
import ja from "@shopify/polaris/locales/ja.json";
import ptBR from "@shopify/polaris/locales/pt-BR.json";
import zhCN from "@shopify/polaris/locales/zh-CN.json";

export const POLARIS_LOCALES = {
  en,
  fr,
  de,
  es,
  ja,
  "pt-BR": ptBR,
  "zh-CN": zhCN,
} as const;

export type PolarisLocaleKey = keyof typeof POLARIS_LOCALES;

export function getPolarisLocale(locale: string) {
  return POLARIS_LOCALES[locale as PolarisLocaleKey] ?? POLARIS_LOCALES.en;
}
