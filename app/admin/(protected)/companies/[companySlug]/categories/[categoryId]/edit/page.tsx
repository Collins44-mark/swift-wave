import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  requireCompanyAccess,
  canMutate,
} from "@/lib/admin/require-company-access";
import { getCategory, listCategories } from "@/lib/admin/data/categories";
import { updateCategory } from "@/lib/admin/actions/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = {
  title: "Edit Category — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ companySlug: string; categoryId: string }>;
}) {
  const { companySlug, categoryId } = await params;
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "categories"
  );

  if (!canMutate(admin)) {
    redirect(`/admin/companies/${companySlug}/categories`);
  }

  const [category, categories] = await Promise.all([
    getCategory(company.id, categoryId),
    listCategories(company.id),
  ]);

  if (!category) notFound();

  const parentOptions = categories.filter(
    (c) => !c.parent_id && c.id !== category.id
  );

  async function action(
    _prev: { error?: string } | null,
    formData: FormData
  ) {
    "use server";
    const result = await updateCategory(companySlug, categoryId, formData);
    if (!result.ok) return { error: result.error };
    return { success: "Category updated." };
  }

  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>Edit Category</h2>
      <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
        Update category details for {company.name}.
      </p>
      <CategoryForm
        companySlug={companySlug}
        companyName={company.name}
        category={category}
        parentOptions={parentOptions}
        action={action}
      />
    </section>
  );
}
