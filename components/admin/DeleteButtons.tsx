"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/lib/admin/actions/products";
import { deleteCategory } from "@/lib/admin/actions/categories";

export function DeleteProductButton({
  companySlug,
  productId,
  productName,
}: {
  companySlug: string;
  productId: string;
  productName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="sw-admin-btn sw-admin-btn-ghost sw-admin-btn-danger"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Delete “${productName}”? This cannot be undone.`)) {
          return;
        }
        startTransition(async () => {
          const result = await deleteProduct(companySlug, productId);
          if (!result.ok) window.alert(result.error);
        });
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

export function DeleteCategoryButton({
  companySlug,
  categoryId,
  categoryName,
}: {
  companySlug: string;
  categoryId: string;
  categoryName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="sw-admin-btn sw-admin-btn-ghost sw-admin-btn-danger"
      disabled={pending}
      onClick={() => {
        if (
          !window.confirm(`Delete “${categoryName}”? This cannot be undone.`)
        ) {
          return;
        }
        startTransition(async () => {
          const result = await deleteCategory(companySlug, categoryId);
          if (!result.ok) window.alert(result.error);
        });
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
