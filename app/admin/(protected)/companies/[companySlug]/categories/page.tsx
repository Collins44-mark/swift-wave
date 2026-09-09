import type { Metadata } from "next";
import Link from "next/link";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { listCategories } from "@/lib/admin/data/categories";
import { CategoryRowActions } from "@/components/admin/CategoryRowActions";

export const metadata: Metadata = {
  title: "Categories — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const { company } = await requireCompanyAccess(companySlug, "categories");
  const categories = await listCategories(company.id);
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <section className="sw-admin-panel">
      <div className="sw-admin-toolbar">
        <div>
          <h2 style={{ margin: 0 }}>Categories</h2>
          <p style={{ margin: "0.25rem 0 0", color: "var(--admin-muted)" }}>
            Manage product categories for {company.name}.
          </p>
        </div>
        <Link
          className="sw-admin-btn"
          href={`/admin/companies/${companySlug}/categories/new`}
        >
          + Add Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="sw-admin-empty sw-admin-empty-state" style={{ marginTop: "1rem" }}>
          <strong style={{ display: "block", color: "var(--admin-heading)" }}>
            No categories yet
          </strong>
          <p style={{ margin: "0.35rem 0 0.85rem" }}>
            Create your first product category for {company.name}.
          </p>
          <Link
            className="sw-admin-btn"
            href={`/admin/companies/${companySlug}/categories/new`}
          >
            + Add Category
          </Link>
        </div>
      ) : (
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
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
