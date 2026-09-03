export interface AdminTaskAlert {
  id: string;
  heading: string;
  message: string;
}

interface AdminToastHost {
  toast: {
    show: (message: string, options?: { isError?: boolean; duration?: number }) => void;
  };
}

export function createAdminTaskAlert(input: AdminTaskAlert): AdminTaskAlert | null {
  const id = input.id.trim();
  const heading = input.heading.trim();
  const message = input.message.trim();

  if (!id || !heading || !message) return null;

  return { id, heading, message };
}

export function showAdminTransientErrorToast(shopify: AdminToastHost, message: string): void {
  const normalizedMessage = message.trim();
  if (!normalizedMessage) return;

  shopify.toast.show(normalizedMessage, { isError: true, duration: 5000 });
}

export function isPersistentAdminOperationError(intent: string | null): boolean {
  return intent === "saveBundle";
}
