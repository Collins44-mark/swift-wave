import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  requireCompanyAccess,
  canMutate,
} from "@/lib/admin/require-company-access";
import { listCategories } from "@/lib/admin/data/categories";
import { createCategory } from "@/lib/admin/actions/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = {
  title: "Add Category — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function NewCategoryPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "categories"
  );

  if (!canMutate(admin)) {
    redirect(`/admin/companies/${companySlug}/categories`);
  }

  const categories = await listCategories(company.id);
  const parentOptions = categories.filter((c) => !c.parent_id);

  async function action(
    _prev: { error?: string } | null,
    formData: FormData
  ) {
    "use server";
    const result = await createCategory(companySlug, formData);
    if (!result.ok) return { error: result.error };
    redirect(`/admin/companies/${companySlug}/categories`);
  }

  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>Add Category</h2>
      <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
        Create a new product category for {company.name}.
      </p>
      <CategoryForm
        companySlug={companySlug}
        companyName={company.name}
        parentOptions={parentOptions}
        action={action}
      />
    </section>
  );
}
