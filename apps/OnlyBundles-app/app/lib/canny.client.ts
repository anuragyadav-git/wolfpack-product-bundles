type Canny = (command: "initChangelog" | "closeChangelog" | "render", options?: Record<string, unknown>) => void;

declare global {
  interface Window { Canny?: Canny }
}

let sdk: Promise<Canny> | undefined;

/** Loaded only inside the embedded Admin, after idle delay or merchant intent. */
export function loadCanny(): Promise<Canny> {
  if (sdk) return sdk;
  sdk = new Promise<Canny>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "canny-jssdk";
    script.async = true;
    script.src = "https://sdk.canny.io/sdk.js";
    const finish = (error?: Error) => {
      clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      if (error) {
        script.remove();
        sdk = undefined;
        reject(error);
      } else {
        resolve(window.Canny!);
      }
    };
    const timeout = setTimeout(() => finish(new Error("Canny SDK timed out")), 15000);
    script.onload = () => finish(typeof window.Canny === "function" ? undefined : new Error("Canny SDK unavailable"));
    script.onerror = () => finish(new Error("Canny SDK unavailable"));
    document.head.appendChild(script);
  });
  return sdk;
}
