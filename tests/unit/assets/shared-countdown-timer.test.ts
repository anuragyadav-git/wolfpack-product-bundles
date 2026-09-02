import { JSDOM } from "jsdom";
import {
  SharedCountdownMethods,
  resolveCountdownSnapshot,
} from "../../../app/assets/widgets/shared/countdown-timer";

describe("shared countdown runtime", () => {
  const originalDocument = global.document;
  const originalWindow = global.window;

  beforeEach(() => {
    jest.useFakeTimers();
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    global.document = dom.window.document;
    global.window = dom.window as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    jest.useRealTimers();
    global.document = originalDocument;
    global.window = originalWindow;
  });

  it("recomputes remaining units from the absolute deadline", () => {
    const deadline = Date.parse("2030-01-03T04:05:06.000Z");
    const now = Date.parse("2030-01-01T00:00:00.000Z");

    expect(resolveCountdownSnapshot(deadline, now)).toEqual({
      state: "active",
      days: 2,
      hours: 4,
      minutes: 5,
      seconds: 6,
      totalHours: 52,
    });
  });

  it("reports expiry without allowing negative units", () => {
    expect(resolveCountdownSnapshot(1_000, 1_001)).toEqual({
      state: "expired",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalHours: 0,
    });
  });

  it("does not mount when the runtime config has no valid deadline", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const context: any = {
      container,
      selectedBundle: { countdown: null },
      elements: {},
    };

    SharedCountdownMethods.setupCountdown.call(context);

    expect(container.querySelector("[data-wpb-countdown]")).toBeNull();
  });

  it("renders above the widget without per-second live announcements", () => {
    jest.setSystemTime(new Date("2030-01-01T00:00:00.000Z"));
    const container = document.createElement("div");
    container.appendChild(document.createElement("main"));
    document.body.appendChild(container);
    const context: any = {
      container,
      selectedBundle: {
        countdown: {
          layout: "compact",
          position: "above",
          title: "Ends soon",
          expiryAction: "hide",
          expiredMessage: "",
          endsAt: "2030-01-01T01:02:03.000Z",
        },
      },
      elements: {},
    };

    SharedCountdownMethods.setupCountdown.call(context);
    const countdown = container.querySelector<HTMLElement>("[data-wpb-countdown]")!;

    expect(container.firstElementChild).toBe(countdown);
    expect(countdown.getAttribute("aria-live")).toBe("off");
    expect(countdown.textContent).toContain("01:02:03");
  });

  it("recomputes on visibility resume and announces only the expiry message", () => {
    jest.setSystemTime(new Date("2030-01-01T00:00:00.000Z"));
    const container = document.createElement("div");
    document.body.appendChild(container);
    const context: any = {
      container,
      selectedBundle: {
        countdown: {
          layout: "full",
          position: "below",
          title: "Ends soon",
          expiryAction: "show_message",
          expiredMessage: "This offer has ended",
          endsAt: "2030-01-01T00:00:02.000Z",
        },
      },
      elements: {},
    };

    SharedCountdownMethods.setupCountdown.call(context);
    jest.setSystemTime(new Date("2030-01-01T00:00:03.000Z"));
    document.dispatchEvent(new window.Event("visibilitychange"));

    const countdown = container.querySelector<HTMLElement>("[data-wpb-countdown]")!;
    expect(countdown.textContent).toContain("This offer has ended");
    expect(countdown.getAttribute("role")).toBe("status");
    expect(countdown.getAttribute("aria-live")).toBe("polite");
  });
});
