import "@shopify/ui-extensions/preact";
import { render } from "preact";

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  return <s-text>{String(shopify.i18n.translate("managed"))}</s-text>;
}
