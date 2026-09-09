"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AdminToast } from "@/components/admin/AdminToast";

type ToastVariant = "success" | "error";

type ToastState = {
  message: string;
  variant: ToastVariant;
} | null;

type AdminToastContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  dismiss: () => void;
};

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

export function useAdminToastContext() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    throw new Error("useAdminToastContext must be used within AdminToastProvider");
  }
  return ctx;
}

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);

  const dismiss = useCallback(() => setToast(null), []);

  const showSuccess = useCallback((message: string) => {
    setToast({ message, variant: "success" });
  }, []);

  const showError = useCallback((message: string) => {
    setToast({ message, variant: "error" });
  }, []);

  const value = useMemo(
    () => ({ showSuccess, showError, dismiss }),
    [showSuccess, showError, dismiss]
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="sw-admin-toast-host">
          <AdminToast
            message={toast.message}
            variant={toast.variant}
            onDismiss={dismiss}
          />
        </div>
      ) : null}
    </AdminToastContext.Provider>
  );
}
