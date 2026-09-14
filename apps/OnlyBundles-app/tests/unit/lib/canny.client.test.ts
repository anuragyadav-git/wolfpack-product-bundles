import { JSDOM } from "jsdom";
import type { loadCanny as LoadCanny } from "../../../app/lib/canny.client";

describe("Canny SDK loading", () => {
  let dom: JSDOM;
  let loadCanny: typeof LoadCanny;
  beforeEach(async () => {
    jest.resetModules();
    jest.useFakeTimers();
    dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", { url: "https://app.example.com" });
    Object.assign(global, { window: dom.window, document: dom.window.document });
    ({ loadCanny } = await import("../../../app/lib/canny.client"));
  });
  afterEach(() => {
    dom.window.close();
    delete (global as Record<string, unknown>).window;
    delete (global as Record<string, unknown>).document;
    jest.useRealTimers();
  });
  it("shares one asynchronous script and resolves only after the SDK loads", async () => {
    const one = loadCanny();
    const two = loadCanny();
    const scripts = document.querySelectorAll("script");
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toBe("https://sdk.canny.io/sdk.js");
    const canny = jest.fn();
    Object.assign(window, { Canny: canny });
    scripts[0].dispatchEvent(new dom.window.Event("load"));
    expect(await one).toBe(canny);
    expect(await two).toBe(canny);
    expect(await loadCanny()).toBe(canny);
    expect(document.querySelectorAll("script")).toHaveLength(1);
  });
  it("removes failed scripts and permits retry", async () => {
    const result = loadCanny().catch(error => error);
    document.querySelector("script")!.dispatchEvent(new dom.window.Event("error"));
    expect(await result).toBeInstanceOf(Error);
    expect(document.querySelector("script")).toBeNull();
    const retry = loadCanny();
    Object.assign(window, { Canny: jest.fn() });
    document.querySelector("script")!.dispatchEvent(new dom.window.Event("load"));
    await expect(retry).resolves.toBe(window.Canny);
  });
  it("times out a blocked SDK instead of hanging the merchant UI", async () => {
    const result = loadCanny().catch(error => error);
    jest.advanceTimersByTime(15000);
    expect(await result).toBeInstanceOf(Error);
    expect(document.querySelector("script")).toBeNull();
  });
  it("rejects script load without a functioning SDK", async () => {
    const result = loadCanny().catch(error => error);
    document.querySelector("script")!.dispatchEvent(new dom.window.Event("load"));
    expect(await result).toBeInstanceOf(Error);
  });
});
