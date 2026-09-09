"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { Category } from "@/lib/admin/types-catalog";

type FormState = { error?: string; success?: string } | null;

export function CategoryForm({
  companySlug,
  companyName,
  category,
  parentOptions,
  action,
}: {
  companySlug: string;
  companyName: string;
  category?: Category | null;
  parentOptions: { id: string; name: string }[];
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, null);
  const isEdit = Boolean(category);

  return (
    <form action={formAction} className="sw-admin-form-grid">
      {state?.error ? (
        <div className="sw-admin-alert is-error sw-admin-field-span" role="alert">
          {state.error}
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
        <SubmitButton pendingLabel={isEdit ? "Saving…" : "Creating…"}>
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
