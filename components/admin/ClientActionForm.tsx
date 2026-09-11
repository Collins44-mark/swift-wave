"use client";

import { useTransition, type ReactNode } from "react";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { adminMutate } from "@/lib/admin/client-mutate";
import type { ActionResult } from "@/lib/admin/types-catalog";

export function ClientActionForm({
  actionName,
  companySlug,
  successMessage,
  submitLabel,
  pendingLabel = "Saving...",
  children,
}: {
  actionName: string;
  companySlug: string;
  successMessage: string;
  submitLabel: string;
  pendingLabel?: string;
  children: ReactNode;
}) {
  const { showSuccess, showError } = useAdminToastContext();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="sw-admin-form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        formData.set("companySlug", companySlug);
        startTransition(async () => {
          const result = await adminMutate<ActionResult>(actionName, formData);
          if (!result.ok) {
            showError(result.error || "Couldn't save changes. Please try again.");
            return;
          }
          showSuccess(successMessage);
        });
      }}
    >
      {children}
      <div className="sw-admin-toolbar sw-admin-field-span">
        <SubmitButton pending={pending} pendingLabel={pendingLabel}>
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
