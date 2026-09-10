import type { Metadata } from "next";
import Link from "next/link";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { listProducts } from "@/lib/admin/data/products";
import { listCategories } from "@/lib/admin/data/categories";
import { ProductsTableClient } from "@/components/admin/ProductsTableClient";

export const metadata: Metadata = {
  title: "Products — Swift Wave Admin",
  robots: { index: false, follow: false },
};

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

  const categoryName = new Map(
    categories.map((c) => {
      if (!c.parent_id) return [c.id, c.name] as const;
      const parent = categories.find((p) => p.id === c.parent_id);
      return [c.id, parent ? `${parent.name} / ${c.name}` : c.name] as const;
    })
  );

  return (
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

      <ProductsTableClient
        companySlug={companySlug}
        initialProducts={products}
        categoryName={categoryName}
      />
    </section>
  );
}
