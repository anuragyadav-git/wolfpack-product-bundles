import {
  installSupportChatLoader,
  installSupportChatPresentation,
  openSupportChat,
  openSupportChatWithMessage,
  openSupportChatWithDraft,
  type SupportChatWindow,
} from "../../../app/lib/support-chat.client";

function createMediaQueryList(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: { matches: boolean }) => void>();

  return {
    get matches() {
      return matches;
    },
    addEventListener: jest.fn(
      (_name: "change", listener: (event: { matches: boolean }) => void) => {
        listeners.add(listener);
      },
    ),
    removeEventListener: jest.fn(
      (_name: "change", listener: (event: { matches: boolean }) => void) => {
        listeners.delete(listener);
      },
    ),
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      listeners.forEach((listener) => listener({ matches }));
    },
  };
}

describe("support chat client", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("defers automatic chat configuration until the fallback delay", () => {
    const configure = jest.fn();
    const idleCallback = jest.fn(() => 7);
    const win: SupportChatWindow = {
      requestIdleCallback: idleCallback,
      cancelIdleCallback: jest.fn(),
      setTimeout: jest.fn((callback: () => void, delay?: number) => {
        return setTimeout(callback, delay);
      }) as unknown as typeof setTimeout,
      clearTimeout: jest.fn((handle?: ReturnType<typeof setTimeout>) => {
        clearTimeout(handle);
      }) as typeof clearTimeout,
    };

    installSupportChatLoader({ win, configure, fallbackDelayMs: 5000 });

    expect(configure).not.toHaveBeenCalled();
    expect(win.__wpbLoadSupportChat).toEqual(expect.any(Function));
    expect(idleCallback).not.toHaveBeenCalled();
    expect(win.setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);

    jest.advanceTimersByTime(4999);
    expect(configure).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(configure).toHaveBeenCalledTimes(1);
  });

  it("loads chat immediately before queueing an explicit support open request", () => {
    const configure = jest.fn();
    const win: SupportChatWindow = {};

    installSupportChatLoader({ win, configure });

    expect(configure).not.toHaveBeenCalled();

    openSupportChat(win);

    expect(configure).toHaveBeenCalledTimes(1);
    expect(win.$crisp).toEqual([
      ["do", "chat:show"],
      ["do", "chat:open"],
    ]);
  });

  it("opens chat with a draft that remains unsent", () => {
    const win: SupportChatWindow = {};

    openSupportChatWithDraft("Please add an integration for Acme Checkout.", win);

    expect(win.$crisp).toEqual([
      ["on", "chat:opened", expect.any(Function)],
      ["do", "chat:show"],
      ["do", "chat:open"],
    ]);

    const openRegistration = win.$crisp?.[0] as [string, string, () => void];
    openRegistration[2]();

    expect(win.$crisp?.slice(-2)).toEqual([
      ["off", "chat:opened"],
      ["set", "message:text", ["Please add an integration for Acme Checkout."]],
    ]);
    openRegistration[2]();
    expect(
      win.$crisp?.filter(
        (command: any) => command[0] === "set" && command[1] === "message:text",
      ),
    ).toHaveLength(1);
    expect(win.$crisp).not.toContainEqual(
      expect.arrayContaining(["message:send"]),
    );
  });

  it("sets the draft immediately when chat is already open", () => {
    const commands = Object.assign([] as unknown[], {
      is: jest.fn(() => true),
    });
    const win = { $crisp: commands } as SupportChatWindow;

    openSupportChatWithDraft("Please add Acme Checkout.", win);

    expect(commands.is).toHaveBeenCalledWith("chat:opened");
    expect(commands.slice()).toEqual([
      ["set", "message:text", ["Please add Acme Checkout."]],
      ["do", "chat:show"],
      ["do", "chat:open"],
    ]);
  });

  it("opens chat and sends an explicit support message", () => {
    const win: SupportChatWindow = {};

    openSupportChatWithMessage(
      "Having issues seeing the bundle on storefront: https://shop.test/bundle",
      win,
    );

    expect(win.$crisp).toEqual([
      ["do", "chat:show"],
      ["do", "chat:open"],
      [
        "do",
        "message:send",
        [
          "text",
          "Having issues seeing the bundle on storefront: https://shop.test/bundle",
        ],
      ],
    ]);
  });

  it("hides the floating launcher on narrow screens and after chat closes", () => {
    const mediaQuery = createMediaQueryList(true);
    const win: SupportChatWindow = {
      matchMedia: jest.fn(() => mediaQuery),
    };

    installSupportChatPresentation({ win });

    expect(win.$crisp?.[0]).toEqual(["do", "chat:hide"]);
    const closeRegistration = win.$crisp?.find(
      (entry: any) => entry[0] === "on" && entry[1] === "chat:closed",
    ) as [string, string, () => void];

    closeRegistration[2]();

    expect(win.$crisp?.at(-1)).toEqual(["do", "chat:hide"]);
  });

  it("keeps chat visible on desktop and follows viewport changes", () => {
    const mediaQuery = createMediaQueryList(false);
    const win: SupportChatWindow = {
      matchMedia: jest.fn(() => mediaQuery),
    };

    installSupportChatPresentation({ win });
    expect(win.$crisp?.[0]).toEqual(["do", "chat:show"]);

    mediaQuery.setMatches(true);
    expect(win.$crisp?.at(-1)).toEqual(["do", "chat:hide"]);

    mediaQuery.setMatches(false);
    expect(win.$crisp?.at(-1)).toEqual(["do", "chat:show"]);
  });

  it("removes responsive and Crisp listeners during cleanup", () => {
    const mediaQuery = createMediaQueryList(true);
    const win: SupportChatWindow = {
      matchMedia: jest.fn(() => mediaQuery),
    };

    const cleanup = installSupportChatPresentation({ win });
    cleanup();

    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
    expect(win.$crisp?.at(-1)).toEqual(["off", "chat:closed"]);
  });
});
