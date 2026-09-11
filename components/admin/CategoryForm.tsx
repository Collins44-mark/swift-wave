"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import {
  createCategory,
  updateCategory,
} from "@/lib/admin/client-actions";
import type { Category } from "@/lib/admin/types-catalog";

export function CategoryForm({
  companySlug,
  companyName,
  category,
  parentOptions,
}: {
  companySlug: string;
  companyName: string;
  category?: Category | null;
  parentOptions: { id: string; name: string }[];
}) {
  const { showSuccess, showError } = useAdminToastContext();
  const router = useRouter();
  const isEdit = Boolean(category);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="sw-admin-form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError(null);
        startTransition(async () => {
          const result = isEdit && category
            ? await updateCategory(companySlug, category.id, formData)
            : await createCategory(companySlug, formData);
          if (!result.ok) {
            setError(result.error);
            showError("Couldn't save changes. Please try again.");
            return;
          }
          showSuccess(
            isEdit
              ? "Category updated successfully"
              : "Category created successfully"
          );
          if (!isEdit) {
            router.push(`/admin/companies/${companySlug}/categories`);
          }
        });
      }}
    >
      {error ? (
        <div className="sw-admin-alert is-error sw-admin-field-span" role="alert">
          {error}
        </div>
      ) : null}

      <div className="sw-admin-field">
        <label htmlFor="name">Category Name</label>
        <input
          id="name"
          name="name"
          required
          defaultValue={category?.name ?? ""}
          placeholder="e.g. Dresses"
        />
      </div>

      <div className="sw-admin-field sw-admin-field-span">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={category?.description ?? ""}
          placeholder={`Optional description for ${companyName}`}
        />
      </div>

      <div className="sw-admin-field">
        <label htmlFor="parent_id">Parent Category</label>
        <select
          id="parent_id"
          name="parent_id"
          defaultValue={category?.parent_id ?? ""}
        >
          <option value="">— None —</option>
          {parentOptions.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sw-admin-field">
        <label htmlFor="sort_order">Sort Order</label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={category?.sort_order ?? 0}
        />
      </div>

      <div className="sw-admin-field">
        <label className="sw-admin-check-label" htmlFor="is_active">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            value="true"
            defaultChecked={category?.is_active ?? true}
          />{" "}
          Active
        </label>
      </div>

      <div className="sw-admin-toolbar sw-admin-field-span">
        <SubmitButton
          pending={pending}
          pendingLabel={isEdit ? "Saving..." : "Creating..."}
        >
          {isEdit ? "Save Changes" : "Create Category"}
        </SubmitButton>
        <Link
          className="sw-admin-btn sw-admin-btn-ghost"
          href={`/admin/companies/${companySlug}/categories`}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
