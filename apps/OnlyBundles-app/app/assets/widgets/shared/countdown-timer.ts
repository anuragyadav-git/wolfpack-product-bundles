type CountdownConfig = {
  layout?: "compact" | "full";
  position?: "above" | "below";
  title?: string;
  expiryAction?: "hide" | "show_zeros" | "show_message";
  expiredMessage?: string;
  endsAt?: string;
};

export type CountdownSnapshot = {
  state: "active" | "expired";
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
};

export function resolveCountdownSnapshot(
  deadlineMs: number,
  nowMs = Date.now(),
): CountdownSnapshot {
  const remainingMs = Math.max(0, deadlineMs - nowMs);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return {
    state: deadlineMs > nowMs ? "active" : "expired",
    days,
    hours,
    minutes,
    seconds,
    totalHours: Math.floor(totalSeconds / 3_600),
  };
}

function twoDigits(value: number) {
  return String(value).padStart(2, "0");
}

function renderActiveCountdown(
  surface: HTMLElement,
  config: CountdownConfig,
  snapshot: CountdownSnapshot,
) {
  surface.hidden = false;
  surface.setAttribute("role", "timer");
  surface.setAttribute("aria-live", "off");
  surface.replaceChildren();

  if (config.title) {
    const title = document.createElement("span");
    title.className = "wpb-countdown__title";
    title.textContent = config.title;
    surface.appendChild(title);
  }

  const time = document.createElement("span");
  time.className = "wpb-countdown__time";
  if (config.layout === "full") {
    time.textContent = `${snapshot.days}d ${twoDigits(snapshot.hours)}h ${twoDigits(snapshot.minutes)}m ${twoDigits(snapshot.seconds)}s`;
  } else {
    time.textContent = `${twoDigits(snapshot.totalHours)}:${twoDigits(snapshot.minutes)}:${twoDigits(snapshot.seconds)}`;
  }
  surface.appendChild(time);
}

function renderExpiredCountdown(
  surface: HTMLElement,
  config: CountdownConfig,
  snapshot: CountdownSnapshot,
) {
  if (config.expiryAction === "hide") {
    surface.hidden = true;
    return;
  }

  if (config.expiryAction === "show_message" && config.expiredMessage) {
    surface.hidden = false;
    surface.setAttribute("role", "status");
    surface.setAttribute("aria-live", "polite");
    surface.textContent = config.expiredMessage;
    return;
  }

  renderActiveCountdown(surface, config, snapshot);
}

export const SharedCountdownMethods: Record<string, any> & ThisType<any> = {
  teardownCountdown() {
    if (this._countdownIntervalId != null) {
      window.clearInterval(this._countdownIntervalId);
      this._countdownIntervalId = null;
    }
    if (this._countdownVisibilityHandler) {
      document.removeEventListener(
        "visibilitychange",
        this._countdownVisibilityHandler,
      );
      this._countdownVisibilityHandler = null;
    }
    this.elements?.countdown?.remove?.();
    if (this.elements) this.elements.countdown = null;
  },

  setupCountdown() {
    this.teardownCountdown?.();
    const config = this.selectedBundle?.countdown as CountdownConfig | null;
    const deadlineMs = Date.parse(config?.endsAt ?? "");
    if (!config || !Number.isFinite(deadlineMs) || !this.container) return;

    const surface = document.createElement("div");
    surface.className = `wpb-countdown wpb-countdown--${config.layout === "full" ? "full" : "compact"}`;
    surface.setAttribute("data-wpb-countdown", "");

    if (config.position === "below") {
      this.container.appendChild(surface);
    } else {
      this.container.prepend(surface);
    }

    const update = () => {
      const snapshot = resolveCountdownSnapshot(deadlineMs);
      if (snapshot.state === "expired") {
        renderExpiredCountdown(surface, config, snapshot);
        if (this._countdownIntervalId != null) {
          window.clearInterval(this._countdownIntervalId);
          this._countdownIntervalId = null;
        }
        return;
      }
      renderActiveCountdown(surface, config, snapshot);
    };

    update();
    if (resolveCountdownSnapshot(deadlineMs).state === "active") {
      this._countdownIntervalId = window.setInterval(update, 1_000);
    }
    this._countdownVisibilityHandler = update;
    document.addEventListener("visibilitychange", update);
    this.elements.countdown = surface;
  },
};
