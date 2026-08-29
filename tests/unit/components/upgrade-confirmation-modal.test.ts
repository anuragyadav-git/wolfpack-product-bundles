import { syncUpgradeConfirmationModal } from "../../../app/components/billing/UpgradeConfirmationModal";

describe("syncUpgradeConfirmationModal", () => {
  it("opens and closes the Polaris overlay with its supported lifecycle methods", () => {
    const overlay = {
      showOverlay: jest.fn(),
      hideOverlay: jest.fn(),
    };
    const ref = { current: overlay };

    syncUpgradeConfirmationModal(ref, true);
    expect(overlay.showOverlay).toHaveBeenCalledTimes(1);
    expect(overlay.hideOverlay).not.toHaveBeenCalled();

    syncUpgradeConfirmationModal(ref, false);
    expect(overlay.hideOverlay).toHaveBeenCalledTimes(1);
  });
});
