import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useEffect, useState } from "react";
import {
  getThemeExtensionStatusFromAppBridge,
  type AppBridgeThemeStatus,
} from "../lib/app-embed-status-check.client";

type ThemeExtensionStatusState = AppBridgeThemeStatus & {
  loading: boolean;
  error: boolean;
};

const EMPTY_STATUS: ThemeExtensionStatusState = {
  resources: [],
  appEmbedEnabled: false,
  loading: true,
  error: false,
};

export function useThemeExtensionStatus() {
  const shopify = useAppBridge();
  const [state, setState] = useState<ThemeExtensionStatusState>(EMPTY_STATUS);

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: false }));
    try {
      const result = await getThemeExtensionStatusFromAppBridge(shopify);
      setState({ ...result, loading: false, error: false });
      return result;
    } catch {
      setState((current) => ({ ...current, loading: false, error: true }));
      return null;
    }
  }, [shopify]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
