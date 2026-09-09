import type { Metadata } from "next";
import Link from "next/link";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { listProducts } from "@/lib/admin/data/products";
import { listCategories } from "@/lib/admin/data/categories";
import { ProductDeleteButton } from "@/components/admin/ProductDeleteButton";
import { ProductsPageToasts } from "@/components/admin/ProductsPageClient";
import type { Product } from "@/lib/admin/types-catalog";

export const metadata: Metadata = {
  title: "Products — Swift Wave Admin",
  robots: { index: false, follow: false },
};

function priceDisplay(p: Product): string {
  if (p.price_label) return p.price_label;
  if (p.price != null) {
    return `${p.currency} ${Number(p.price).toLocaleString("en-US")}`;
  }
  return "—";
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { companySlug } = await params;
  const { q } = await searchParams;
  const { company } = await requireCompanyAccess(companySlug, "products");

  const [products, categories] = await Promise.all([
    listProducts(company.id, { search: q }),
    listCategories(company.id),
  ]);

  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <>
      <ProductsPageToasts />
      <section className="sw-admin-panel">
      <div className="sw-admin-toolbar">
        <div>
          <h2 style={{ margin: 0 }}>Products</h2>
          <p style={{ margin: "0.25rem 0 0", color: "var(--admin-muted)" }}>
            {products.length} product{products.length === 1 ? "" : "s"}
            {q ? ` matching “${q}”` : ""}
          </p>
        </div>
        <Link
          className="sw-admin-btn"
          href={`/admin/companies/${companySlug}/products/new`}
        >
          Add product
        </Link>
      </div>

      <form
        className="sw-admin-inline-form"
        method="get"
        style={{ marginTop: "1rem" }}
      >
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name…"
          aria-label="Search products"
        />
        <button type="submit" className="sw-admin-btn sw-admin-btn-ghost">
          Search
        </button>
        {q ? (
          <Link
            className="sw-admin-btn sw-admin-btn-ghost"
            href={`/admin/companies/${companySlug}/products`}
          >
            Clear
          </Link>
        ) : null}
      </form>

      {products.length === 0 ? (
        <div className="sw-admin-empty" style={{ marginTop: "1rem" }}>
          <p style={{ margin: "0 0 0.35rem", fontWeight: 600 }}>No products yet.</p>
          <p style={{ margin: "0 0 1rem", color: "var(--admin-muted)" }}>
            Add your first product to start building the Outfit catalog.
          </p>
          <Link
            className="sw-admin-btn"
            href={`/admin/companies/${companySlug}/products/new`}
          >
            + Add product
          </Link>
        </div>
      ) : (
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
                    {p.category_id
                      ? categoryName.get(p.category_id) ?? "—"
                      : "—"}
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
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
    </>
  );
}
