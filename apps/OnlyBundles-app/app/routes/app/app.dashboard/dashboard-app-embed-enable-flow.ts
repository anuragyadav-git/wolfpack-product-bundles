export type AppEmbedEnablePhase = "idle" | "detecting" | "success" | "failure";

export type AppEmbedEnableFlow = {
  open: boolean;
  phase: AppEmbedEnablePhase;
  visitedThemeEditor: boolean;
};

export type AppEmbedEnableFlowEvent =
  | { type: "open" }
  | { type: "theme_editor_opened" }
  | { type: "check_started" }
  | { type: "check_succeeded" }
  | { type: "check_failed" }
  | { type: "close" };

export const initialAppEmbedEnableFlow: AppEmbedEnableFlow = {
  open: false,
  phase: "idle",
  visitedThemeEditor: false,
};

export function reduceAppEmbedEnableFlow(
  state: AppEmbedEnableFlow,
  event: AppEmbedEnableFlowEvent,
): AppEmbedEnableFlow {
  switch (event.type) {
    case "open":
      return { open: true, phase: "idle", visitedThemeEditor: false };
    case "theme_editor_opened":
      return { ...state, phase: "detecting", visitedThemeEditor: true };
    case "check_started":
      return { ...state, phase: "detecting" };
    case "check_succeeded":
      return { ...state, phase: "success" };
    case "check_failed":
      return { ...state, phase: "failure" };
    case "close":
      return { ...state, open: false };
  }
}

export function shouldCheckAppEmbedOnClose(flow: AppEmbedEnableFlow): boolean {
  return flow.visitedThemeEditor && flow.phase !== "success";
}

export function restoreAppEmbedEnableActionFocus(
  action: { focus: () => void } | null,
  schedule: (callback: () => void) => void = (callback) => {
    window.requestAnimationFrame(callback);
  },
): void {
  schedule(() => action?.focus());
}

export const APP_EMBED_GUIDE_SOURCES = [
  { src: "/media/app-embed-guide.webm", type: "video/webm" },
  { src: "/media/app-embed-guide.mp4", type: "video/mp4" },
] as const;

export function getAppEmbedGuideMediaProps(prefersReducedMotion: boolean) {
  return {
    autoPlay: !prefersReducedMotion,
    controls: prefersReducedMotion,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "metadata" as const,
    accessibilityLabelKey: "dashboard.storefrontSetup.enableModal.mediaLabel",
  };
}

type ModalAction = "open" | "cancel" | "retry" | "support" | "done" | null;

export function getAppEmbedModalView(phase: AppEmbedEnablePhase): {
  tone: "success" | "warning" | null;
  showGuide: boolean;
  showSpinner: boolean;
  primaryAction: ModalAction;
  secondaryAction: ModalAction;
} {
  switch (phase) {
    case "idle":
      return {
        tone: null,
        showGuide: true,
        showSpinner: false,
        primaryAction: "open",
        secondaryAction: "cancel",
      };
    case "detecting":
      return {
        tone: null,
        showGuide: false,
        showSpinner: true,
        primaryAction: null,
        secondaryAction: null,
      };
    case "success":
      return {
        tone: "success",
        showGuide: false,
        showSpinner: false,
        primaryAction: "done",
        secondaryAction: null,
      };
    case "failure":
      return {
        tone: "warning",
        showGuide: true,
        showSpinner: false,
        primaryAction: "retry",
        secondaryAction: "support",
      };
  }
}

export async function checkAppEmbedActivation(
  check: () => Promise<{ appEmbedEnabled: boolean }>,
): Promise<{ phase: "success" | "failure"; appEmbedEnabled: boolean }> {
  try {
    const status = await check();
    if (status.appEmbedEnabled) {
      return { phase: "success", appEmbedEnabled: true };
    }
  } catch {
    // A failed status request is unresolved and must never produce success.
  }
  return { phase: "failure", appEmbedEnabled: false };
}

export function createAppEmbedReturnCheckCoordinator<T>(check: () => Promise<T>) {
  let armed = false;
  let inFlight: Promise<T> | null = null;

  const checkNow = (): Promise<T> => {
    if (inFlight) return inFlight;
    inFlight = Promise.resolve()
      .then(check)
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  };

  return {
    arm(): void {
      armed = true;
    },
    requestOnReturn(): Promise<T> | null {
      if (!armed) return null;
      armed = false;
      return checkNow();
    },
    checkNow,
  };
}
