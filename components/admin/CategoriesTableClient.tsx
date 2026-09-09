"use client";

import Link from "next/link";
import { useState } from "react";
import { CategoryRowActions } from "@/components/admin/CategoryRowActions";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import type { Category } from "@/lib/admin/types-catalog";

export function CategoriesTableClient({
  companySlug,
  initialCategories,
}: {
  companySlug: string;
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const { showSuccess } = useAdminToastContext();
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  function handleDeleted(categoryId: string) {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    showSuccess("Category deleted.");
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
    <div className="sw-admin-table-wrap" style={{ marginTop: "1rem" }}>
      <table className="sw-admin-table">
        <thead>
          <tr>
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
                  onDeleted={() => handleDeleted(category.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
