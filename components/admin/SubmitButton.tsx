"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "sw-admin-btn",
  pendingLabel = "Saving...",
  disabled = false,
  pending: pendingProp,
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  disabled?: boolean;
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  const isBusy = pending || disabled;
  return (
    <button type="submit" className={className} disabled={isBusy}>
      {pending ? (
        <>
          <span className="sw-admin-btn-spinner" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
