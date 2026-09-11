"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { CategoryRowActions } from "@/components/admin/CategoryRowActions";
import { ConfirmationDialog } from "@/components/admin/ConfirmationDialog";
import { BulkSelectionToolbar } from "@/components/admin/BulkSelectionToolbar";
import { SelectAllCheckbox } from "@/components/admin/SelectAllCheckbox";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { deleteCategories } from "@/lib/admin/client-actions";
import { bulkDeleteCopy } from "@/lib/admin/delete-copy";
import type { Category } from "@/lib/admin/types-catalog";

export function CategoriesTableClient({
  companySlug,
  initialCategories,
  canDelete,
}: {
  companySlug: string;
  initialCategories: Category[];
  canDelete: boolean;
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkPending, startBulk] = useTransition();
  const { showSuccess, showError } = useAdminToastContext();
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  const visibleIds = useMemo(() => categories.map((c) => c.id), [categories]);
  const selectedCount = selected.size;
  const allSelected =
    categories.length > 0 && selectedCount === categories.length;
  const someSelected = selectedCount > 0 && !allSelected;
  const copy = bulkDeleteCopy(selectedCount, "category", "categories");

  function removeIds(ids: string[]) {
    const gone = new Set(ids);
    setCategories((prev) => prev.filter((c) => !gone.has(c.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  }

  function handleDeleted(categoryId: string) {
    removeIds([categoryId]);
    showSuccess("Category deleted successfully");
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  if (!categories.length) {
    return (
      <div className="sw-admin-empty sw-admin-empty-state" style={{ marginTop: "1rem" }}>
        <strong style={{ display: "block", color: "var(--admin-heading)" }}>
          No categories yet
        </strong>
        <p style={{ margin: "0.35rem 0 0.85rem" }}>
          Create your first product category.
        </p>
        <Link
          className="sw-admin-btn"
          href={`/admin/companies/${companySlug}/categories/new`}
        >
          + Add Category
        </Link>
      </div>
    );
  }

  return (
    <>
      {canDelete ? (
        <BulkSelectionToolbar
          count={selectedCount}
          onClear={() => setSelected(new Set())}
          onDelete={() => {
            setBulkError(null);
            setBulkOpen(true);
          }}
        />
      ) : null}
      <div className="sw-admin-table-wrap" style={{ marginTop: "1rem" }}>
        <table className="sw-admin-table">
          <thead>
            <tr>
              {canDelete ? (
                <th className="sw-admin-select">
                  <SelectAllCheckbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    label="Select all visible categories"
                    onChange={(checked) =>
                      setSelected(checked ? new Set(visibleIds) : new Set())
                    }
                  />
                </th>
              ) : null}
              <th>Category</th>
              <th>Description</th>
              <th>Parent</th>
              <th>Status</th>
              <th>Sort Order</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                {canDelete ? (
                  <td className="sw-admin-select">
                    <input
                      type="checkbox"
                      className="sw-admin-select-input"
                      checked={selected.has(category.id)}
                      onChange={(e) => toggleOne(category.id, e.target.checked)}
                      aria-label={`Select ${category.name}`}
                    />
                  </td>
                ) : null}
                <td>
                  <strong>{category.name}</strong>
                </td>
                <td>{category.description || "—"}</td>
                <td>
                  {category.parent_id
                    ? nameById.get(category.parent_id) ?? "—"
                    : "—"}
                </td>
                <td>
                  <span
                    className={`sw-admin-badge${category.is_active ? "" : " is-muted"}`}
                  >
                    {category.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{category.sort_order}</td>
                <td>
                  <CategoryRowActions
                    companySlug={companySlug}
                    categoryId={category.id}
                    categoryName={category.name}
                    canDelete={canDelete}
                    onDeleted={() => handleDeleted(category.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmationDialog
        open={bulkOpen}
        title={copy.title}
        error={bulkError}
        pending={bulkPending}
        confirmLabel={copy.confirmLabel}
        pendingLabel={copy.pendingLabel}
        onCancel={() => {
          if (bulkPending) return;
          setBulkOpen(false);
          setBulkError(null);
        }}
        onConfirm={() => {
          const ids = [...selected];
          startBulk(async () => {
            const result = await deleteCategories(companySlug, ids);
            if (!result.ok) {
              setBulkError(result.error);
              showError("Unable to delete categories. Please try again.");
              return;
            }
            removeIds(result.deletedIds);
            setBulkOpen(false);
            setBulkError(null);
            setSelected(new Set());
            showSuccess(
              bulkDeleteCopy(
                result.deletedIds.length,
                "category",
                "categories"
              ).success
            );
          });
        }}
      >
        <p>{copy.body}</p>
        <p>This action cannot be undone.</p>
      </ConfirmationDialog>
    </>
  );
}
