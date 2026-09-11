"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ProductDeleteButton } from "@/components/admin/ProductDeleteButton";
import { ConfirmationDialog } from "@/components/admin/ConfirmationDialog";
import { BulkSelectionToolbar } from "@/components/admin/BulkSelectionToolbar";
import { SelectAllCheckbox } from "@/components/admin/SelectAllCheckbox";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { deleteProducts } from "@/lib/admin/client-actions";
import { bulkDeleteCopy } from "@/lib/admin/delete-copy";
import {
  applyProductDiscount,
  discountLabel,
  formatMoneyAmount,
} from "@/lib/catalog/pricing";
import type { Product } from "@/lib/admin/types-catalog";

function priceDisplay(p: Product): string {
  const original = p.price != null ? Number(p.price) : 0;
  const pricing = applyProductDiscount(
    original,
    p.discount_type,
    p.discount_value
  );
  const label = discountLabel(pricing, p.currency);
  if (label) {
    return `${formatMoneyAmount(p.currency, pricing.sale)} (${label})`;
  }
  if (p.price_label) return p.price_label;
  if (original > 0) return formatMoneyAmount(p.currency, original);
  return "—";
}

export function ProductsTableClient({
  companySlug,
  initialProducts,
  categoryName,
  canDelete,
}: {
  companySlug: string;
  initialProducts: Product[];
  categoryName: Map<string, string>;
  canDelete: boolean;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkPending, startBulk] = useTransition();
  const { showSuccess, showError } = useAdminToastContext();

  const visibleIds = useMemo(() => products.map((p) => p.id), [products]);
  const selectedCount = selected.size;
  const allSelected = products.length > 0 && selectedCount === products.length;
  const someSelected = selectedCount > 0 && !allSelected;
  const copy = bulkDeleteCopy(selectedCount, "product", "products");
  const countLabel = `${products.length} product${products.length === 1 ? "" : "s"}`;

  function removeIds(ids: string[]) {
    const gone = new Set(ids);
    setProducts((prev) => prev.filter((p) => !gone.has(p.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  }

  function handleDeleted(productId: string) {
    removeIds([productId]);
    showSuccess("Product deleted successfully");
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  if (!products.length) {
    return (
      <>
        <p style={{ margin: "0.25rem 0 0", color: "var(--admin-muted)" }}>
          {countLabel}
        </p>
        <div className="sw-admin-empty" style={{ marginTop: "1rem" }}>
          <p style={{ margin: "0 0 0.35rem", fontWeight: 600 }}>No products yet.</p>
          <p style={{ margin: "0 0 1rem", color: "var(--admin-muted)" }}>
            Add your first product to start building the catalog.
          </p>
          <Link
            className="sw-admin-btn"
            href={`/admin/companies/${companySlug}/products/new`}
          >
            + Add product
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <p style={{ margin: "0.25rem 0 0", color: "var(--admin-muted)" }}>
        {countLabel}
      </p>
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
                    label="Select all visible products"
                    onChange={(checked) =>
                      setSelected(checked ? new Set(visibleIds) : new Set())
                    }
                  />
                </th>
              ) : null}
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                {canDelete ? (
                  <td className="sw-admin-select">
                    <input
                      type="checkbox"
                      className="sw-admin-select-input"
                      checked={selected.has(p.id)}
                      onChange={(e) => toggleOne(p.id, e.target.checked)}
                      aria-label={`Select ${p.name}`}
                    />
                  </td>
                ) : null}
                <td>
                  <strong>{p.name}</strong>
                </td>
                <td>
                  {p.category_id ? categoryName.get(p.category_id) ?? "—" : "—"}
                </td>
                <td>{priceDisplay(p)}</td>
                <td>
                  <span className="sw-admin-badge">{p.status}</span>
                </td>
                <td>
                  <div className="sw-admin-row-actions">
                    <Link
                      className="sw-admin-btn sw-admin-btn-ghost"
                      href={`/admin/companies/${companySlug}/products/${p.id}/edit`}
                    >
                      Edit
                    </Link>
                    {canDelete ? (
                      <ProductDeleteButton
                        companySlug={companySlug}
                        productId={p.id}
                        productName={p.name}
                        onDeleted={() => handleDeleted(p.id)}
                      />
                    ) : null}
                  </div>
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
            const result = await deleteProducts(companySlug, ids);
            if (!result.ok) {
              setBulkError(result.error);
              showError("Unable to delete products. Please try again.");
              return;
            }
            removeIds(result.deletedIds);
            setBulkOpen(false);
            setBulkError(null);
            setSelected(new Set());
            showSuccess(
              bulkDeleteCopy(result.deletedIds.length, "product", "products")
                .success
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
