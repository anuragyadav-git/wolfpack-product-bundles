import { shouldDismissProductDrawerSwipe } from "../../../app/assets/bundle-modal-component";

describe("product details mobile drawer gestures", () => {
  it("dismisses only for an intentional downward swipe", () => {
    expect(
      shouldDismissProductDrawerSwipe({
        distanceY: 110,
        distanceX: 8,
        velocityY: 0.2,
      }),
    ).toBe(true);
    expect(
      shouldDismissProductDrawerSwipe({
        distanceY: 42,
        distanceX: 4,
        velocityY: 0.7,
      }),
    ).toBe(true);
    expect(
      shouldDismissProductDrawerSwipe({
        distanceY: 60,
        distanceX: 8,
        velocityY: 0.2,
      }),
    ).toBe(false);
    expect(
      shouldDismissProductDrawerSwipe({
        distanceY: 110,
        distanceX: 140,
        velocityY: 0.8,
      }),
    ).toBe(false);
    expect(
      shouldDismissProductDrawerSwipe({
        distanceY: -120,
        distanceX: 0,
        velocityY: -0.8,
      }),
    ).toBe(false);
  });
});
