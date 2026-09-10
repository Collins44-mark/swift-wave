"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "sw-admin-btn",
  pendingLabel = "Saving...",
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const isBusy = pending || disabled;
  return (
    <button type="submit" className={className} disabled={isBusy}>
      {pending ? pendingLabel : children}
    </button>
  );
}
