import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import styles from "./LocalAppModal.module.css";

interface LocalAppModalProps {
  title: string;
  children: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  onClose: () => void;
}

export function LocalAppModal({
  title,
  children,
  primaryAction,
  secondaryAction,
  onClose,
}: LocalAppModalProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (dialog && !dialog.open && typeof dialog.showModal === "function") {
      dialog.showModal();
      dialog
        .querySelector<HTMLElement>(
          "s-button, button, [href], input, select, textarea"
        )
        ?.focus();
    }

    return () => {
      if (dialog?.open) dialog.close();
      window.requestAnimationFrame(() => previousFocusRef.current?.focus());
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), s-button, [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hasAttribute("hidden"));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      onCloseRef.current();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-modal="true"
      aria-labelledby="local-app-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onCloseRef.current();
      }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <header className={styles.header}>
        <h2 id="local-app-modal-title" className={styles.title}>
          {title}
        </h2>
        <s-button
          variant="tertiary"
          icon="x"
          accessibilityLabel={t("common.actions.close")}
          onClick={() => onCloseRef.current()}
        />
      </header>
      <div className={styles.body}>{children}</div>
      {(primaryAction || secondaryAction) && (
        <footer className={styles.footer}>
          {secondaryAction}
          {primaryAction}
        </footer>
      )}
    </dialog>
  );
}
