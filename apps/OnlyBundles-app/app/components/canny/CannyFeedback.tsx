import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { loadCanny } from "../../lib/canny.client";
import type { getCannyPublicConfig } from "../../services/canny.server";

export function CannyFeedback({ config }: { config: ReturnType<typeof getCannyPublicConfig> }) {
  const { t } = useTranslation();
  const container = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const boardToken = config?.boardToken;

  useEffect(() => {
    if (!boardToken) { setState("error"); return; }
    const element = container.current!;
    const controller = new AbortController();
    let active = true;
    setState("loading");
    const fail = () => {
      if (!active) return;
      active = false;
      controller.abort();
      element.replaceChildren();
      setState("error");
    };
    const timeout = setTimeout(fail, 30000);
    void Promise.all([
      loadCanny(),
      fetch("/app/canny/session", { cache: "no-store", signal: controller.signal }).then(async response => {
        if (!response.ok) throw new Error("Canny session unavailable");
        const body = await response.json() as { ssoToken?: string };
        if (!body.ssoToken) throw new Error("Canny session unavailable");
        return body.ssoToken;
      }),
    ]).then(([canny, ssoToken]) => {
      if (!active) return;
      canny("render", {
        boardToken, ssoToken, basePath: null, theme: "light",
        onLoadCallback: () => {
          if (!active) return;
          clearTimeout(timeout);
          setState("ready");
        },
      });
    }).catch(fail);
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
      element.replaceChildren();
    };
  }, [boardToken, attempt]);

  return (
    <s-stack gap="base">
      {state === "loading" && <s-spinner accessibilityLabel={t("canny.loading")} />}
      {state === "error" && (
        <s-banner tone="warning" heading={t("canny.unavailable")}>
          <s-paragraph>{t("canny.retryHelp")}</s-paragraph>
          <s-button onClick={() => setAttempt(value => value + 1)}>{t("canny.retry")}</s-button>
          {config && <s-link href={config.portalURL} target="_blank">{t("canny.openPortal")}</s-link>}
        </s-banner>
      )}
      {/* Canny owns its cross-origin UI and responsive iframe sizing. */}
      <div ref={container} data-canny />
    </s-stack>
  );
}
