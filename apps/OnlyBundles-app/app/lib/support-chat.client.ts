interface CrispCommandQueue extends Array<unknown> {
  is?: (state: string) => boolean;
}

export interface SupportChatWindow {
  __wpbLoadSupportChat?: () => void;
  $crisp?: CrispCommandQueue;
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
  setTimeout?: typeof setTimeout;
  clearTimeout?: typeof clearTimeout;
}

const CRISP_FALLBACK_DELAY_MS = 8_000;

function queueCrispCommand(win: SupportChatWindow, command: unknown[]) {
  win.$crisp = win.$crisp ?? [];
  win.$crisp.push(command);
}

export function showSupportChatLauncher({
  win,
}: {
  win: SupportChatWindow;
}) {
  queueCrispCommand(win, ["do", "chat:show"]);
}

export function installSupportChatLoader({
  win,
  configure,
  fallbackDelayMs = CRISP_FALLBACK_DELAY_MS,
}: {
  win: SupportChatWindow;
  configure: () => void;
  fallbackDelayMs?: number;
}) {
  let configured = false;
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  const loadSupportChat = () => {
    if (configured) return;
    configured = true;
    if (timeoutHandle !== null) {
      const clearTimer = win.clearTimeout ?? clearTimeout;
      clearTimer(timeoutHandle);
      timeoutHandle = null;
    }
    configure();
  };

  win.__wpbLoadSupportChat = loadSupportChat;

  const setTimer = win.setTimeout ?? setTimeout;
  timeoutHandle = setTimer(loadSupportChat, fallbackDelayMs);

  return () => {
    if (timeoutHandle !== null) {
      const clearTimer = win.clearTimeout ?? clearTimeout;
      clearTimer(timeoutHandle);
    }
    if (win.__wpbLoadSupportChat === loadSupportChat) {
      delete win.__wpbLoadSupportChat;
    }
  };
}

export function openSupportChat(
  win: SupportChatWindow | undefined =
    typeof window === "undefined" ? undefined : window,
) {
  if (!win) return;
  win.__wpbLoadSupportChat?.();
  queueCrispCommand(win, ["do", "chat:show"]);
  queueCrispCommand(win, ["do", "chat:open"]);
}

export function openSupportChatWithDraft(
  message: string,
  win: SupportChatWindow | undefined =
    typeof window === "undefined" ? undefined : window,
) {
  if (!win) return;
  win.__wpbLoadSupportChat?.();

  let draftApplied = false;
  const applyDraft = () => {
    if (draftApplied) return;
    draftApplied = true;
    queueCrispCommand(win, ["set", "message:text", [message]]);
  };
  const handleChatOpened = () => {
    queueCrispCommand(win, ["off", "chat:opened"]);
    applyDraft();
  };

  if (win.$crisp?.is?.("chat:opened")) {
    applyDraft();
  } else {
    queueCrispCommand(win, ["on", "chat:opened", handleChatOpened]);
  }
  queueCrispCommand(win, ["do", "chat:show"]);
  queueCrispCommand(win, ["do", "chat:open"]);
}

export function openSupportChatWithMessage(
  message: string,
  win: SupportChatWindow | undefined =
    typeof window === "undefined" ? undefined : window,
) {
  if (!win) return;
  win.__wpbLoadSupportChat?.();
  queueCrispCommand(win, ["do", "chat:show"]);
  queueCrispCommand(win, ["do", "chat:open"]);
  queueCrispCommand(win, ["do", "message:send", ["text", message]]);
}

declare global {
  interface Window {
    __wpbLoadSupportChat?: () => void;
    $crisp?: CrispCommandQueue;
  }
}
