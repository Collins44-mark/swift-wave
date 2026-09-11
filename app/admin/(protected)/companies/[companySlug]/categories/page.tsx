import type { Metadata } from "next";
import Link from "next/link";
import {
  requireCompanyAccess,
  canMutate,
} from "@/lib/admin/require-company-access";
import { listCategories } from "@/lib/admin/data/categories";
import { CategoriesTableClient } from "@/components/admin/CategoriesTableClient";

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
  const { company, admin } = await requireCompanyAccess(companySlug, "categories");
  const categories = await listCategories(company.id);

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

      <CategoriesTableClient
        companySlug={companySlug}
        initialCategories={categories}
        canDelete={canMutate(admin)}
      />
    </section>
  );
}
