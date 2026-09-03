type ThemeSectionResponse = {
  ok: boolean;
  headers: { get(name: string): string | null };
  text(): Promise<string>;
  url: string;
};

export async function parseThemeSectionResponse(
  response: ThemeSectionResponse,
  selector: string,
  runtimeDocument: Document = document,
): Promise<Element | null> {
  if (!response?.ok || !selector.trim()) return null;
  const contentType = response.headers?.get?.('content-type') ?? '';
  if (!/^text\/html(?:;|$)/i.test(contentType.trim())) return null;

  try {
    const responseUrl = new URL(response.url, runtimeDocument.location.href);
    if (responseUrl.origin !== runtimeDocument.location.origin) return null;
    const Parser = runtimeDocument.defaultView?.DOMParser;
    if (!Parser) return null;
    const parsed = new Parser().parseFromString(await response.text(), 'text/html');
    const match = parsed.querySelector(selector);
    return match ? runtimeDocument.importNode(match, true) : null;
  } catch {
    return null;
  }
}
