import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const submit = jest.fn();

jest.mock("@remix-run/react", () => ({
  useFetcher: jest.fn(() => ({
    data: undefined,
    state: "idle",
    submit,
  })),
}));

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: jest.fn(() => new Proxy({}, {
    get() {
      throw new Error("App Bridge property accessed during server render");
    },
  })),
}));

describe("PixelStatusCard", () => {
  it("does not access App Bridge APIs during server rendering", async () => {
    const { PixelStatusCard } = await import(
      "../../../app/routes/app/app.attribution/PixelStatusCard"
    );

    expect(() => renderToStaticMarkup(
      React.createElement(PixelStatusCard, { pixelActive: false }),
    )).not.toThrow();
  });
});
