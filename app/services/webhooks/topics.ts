export const ACTIVE_WEBHOOK_TOPICS = [
  "app/uninstalled",
  "app/scopes_update",
  "products/delete",
  "customers/data_request",
  "customers/redact",
  "shop/redact",
] as const;

export type ActiveWebhookTopic = (typeof ACTIVE_WEBHOOK_TOPICS)[number];

const ACTIVE_WEBHOOK_TOPIC_SET = new Set<string>(ACTIVE_WEBHOOK_TOPICS);

export function isActiveWebhookTopic(topic: string): topic is ActiveWebhookTopic {
  return ACTIVE_WEBHOOK_TOPIC_SET.has(topic);
}
