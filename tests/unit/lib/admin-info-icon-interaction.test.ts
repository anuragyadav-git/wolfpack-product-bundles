import { suppressInfoIconPointerActivation } from "../../../app/lib/admin-info-icon-interaction";

describe("suppressInfoIconPointerActivation", () => {
  it("prevents pointer activation and stops it from reaching nearby controls", () => {
    const event = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };

    suppressInfoIconPointerActivation(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
  });
});
