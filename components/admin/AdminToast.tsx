"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const TOAST_MESSAGES: Record<string, string> = {
  product_created: "Product created",
  product_updated: "Product updated",
  product_deleted: "Product deleted",
};

export function AdminToast({
  message,
  variant = "success",
  onDismiss,
}: {
  message: string;
  variant?: "success" | "error";
  onDismiss?: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss?.(), 4200);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`sw-admin-toast${variant === "error" ? " is-error" : ""}`}
      role="status"
      aria-live="polite"
    >
      {variant === "success" ? "✓ " : null}
      {message}
    </div>
  );
}

export function AdminToastFromParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toastKey = searchParams.get("toast");
  const [visible, setVisible] = useState(Boolean(toastKey));

  useEffect(() => {
    setVisible(Boolean(toastKey));
  }, [toastKey]);

  if (!visible || !toastKey) return null;

  const message = TOAST_MESSAGES[toastKey];
  if (!message) return null;

  function dismiss() {
    setVisible(false);
    router.replace(pathname);
  }

  return <AdminToast message={message} onDismiss={dismiss} />;
}

export function useAdminToast() {
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  return {
    toast,
    showSuccess: (message: string) => setToast({ message, variant: "success" }),
    showError: (message: string) => setToast({ message, variant: "error" }),
    dismiss: () => setToast(null),
  };
}
