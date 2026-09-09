"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductDeleteButton } from "@/components/admin/ProductDeleteButton";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import type { Product } from "@/lib/admin/types-catalog";

function priceDisplay(p: Product): string {
  if (p.price_label) return p.price_label;
  if (p.price != null) {
    return `${p.currency} ${Number(p.price).toLocaleString("en-US")}`;
  }
  return "—";
}

export function ProductsTableClient({
  companySlug,
  initialProducts,
  categoryName,
}: {
  companySlug: string;
  initialProducts: Product[];
  categoryName: Map<string, string>;
}) {
  const [products, setProducts] = useState(initialProducts);
  const { showSuccess } = useAdminToastContext();

  function handleDeleted(productId: string) {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showSuccess("Product deleted.");
  }

  if (!products.length) {
    return (
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
    );
  }

  return (
    <div className="sw-admin-table-wrap" style={{ marginTop: "1rem" }}>
      <table className="sw-admin-table">
        <thead>
          <tr>
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
              <td>
                <strong>{p.name}</strong>
                {p.subcategory ? (
                  <div className="sw-admin-muted-sm">{p.subcategory}</div>
                ) : null}
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
                  <ProductDeleteButton
                    companySlug={companySlug}
                    productId={p.id}
                    productName={p.name}
                    onDeleted={() => handleDeleted(p.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
