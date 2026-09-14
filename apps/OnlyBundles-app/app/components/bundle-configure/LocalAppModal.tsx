import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  showPolarisModal,
  useModalHideListener,
} from "../../routes/app/_shared/bundle-configure/modal-utils";

interface LocalAppModalProps {
  title: string;
  children: ReactNode;
  primaryAction?: ReactElement<{ slot?: string }>;
  secondaryAction?: ReactElement<{ slot?: string }>;
  onClose: () => void;
}

export function LocalAppModal({
  title,
  children,
  primaryAction,
  secondaryAction,
  onClose,
}: LocalAppModalProps) {
  const dialogRef = useRef<any>(null);

  useEffect(() => {
    showPolarisModal(dialogRef);
  }, []);

  useModalHideListener(dialogRef, onClose);
  const actionWithSlot = (
    action: ReactElement<{ slot?: string }> | undefined,
    slot: string,
  ) => isValidElement(action) ? cloneElement(action, { slot }) : null;

  return (
    <s-modal
      ref={dialogRef}
      id="local-app-modal"
      heading={title}
    >
      {actionWithSlot(primaryAction, "primary-action")}
      {actionWithSlot(secondaryAction, "secondary-actions")}
      {children}
    </s-modal>
  );
}
