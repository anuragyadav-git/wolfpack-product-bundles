type PointerActivationEvent = {
  preventDefault: () => void;
  stopPropagation: () => void;
};

export function suppressInfoIconPointerActivation(
  event: PointerActivationEvent,
) {
  event.preventDefault();
  event.stopPropagation();
}
