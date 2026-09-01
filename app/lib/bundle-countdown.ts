export type CountdownLayout = "compact" | "full";
export type CountdownPosition = "above" | "below";
export type CountdownExpiryAction = "hide" | "show_zeros" | "show_message";

export interface CountdownSettings {
  countdownEnabled: boolean;
  countdownLayout: CountdownLayout;
  countdownPosition: CountdownPosition;
  countdownTitle: string;
  countdownExpiryAction: CountdownExpiryAction;
  countdownExpiredMessage: string;
}

function formText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function parseCountdownSettings(formData: FormData): CountdownSettings {
  const layout = formText(formData, "countdownLayout");
  const position = formText(formData, "countdownPosition");
  const expiryAction = formText(formData, "countdownExpiryAction");

  return {
    countdownEnabled: formData.get("countdownEnabled") === "true",
    countdownLayout: layout === "full" ? "full" : "compact",
    countdownPosition: position === "below" ? "below" : "above",
    countdownTitle: formText(formData, "countdownTitle"),
    countdownExpiryAction:
      expiryAction === "show_zeros" || expiryAction === "show_message"
        ? expiryAction
        : "hide",
    countdownExpiredMessage: formText(formData, "countdownExpiredMessage"),
  };
}
