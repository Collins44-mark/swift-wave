import type { Metadata } from "next";
import {
  requireCompanyAccess,
  canMutate,
} from "@/lib/admin/require-company-access";
import { listCategories } from "@/lib/admin/data/categories";
import { listMediaAssets } from "@/lib/admin/data/media";
import { listColorLibrary, listSizeLibrary } from "@/lib/admin/data/products";
import { createProduct } from "@/lib/admin/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = {
  title: "Add Product — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "products"
  );
  const [categories, mediaLibrary, sizeLibrary, colorLibrary] = await Promise.all([
    listCategories(company.id),
    listMediaAssets(company.id),
    listSizeLibrary(),
    listColorLibrary(),
  ]);

  async function action(
    _prev: { error?: string } | null,
    formData: FormData
  ) {
    "use server";
    const result = await createProduct(companySlug, formData);
    if (!result.ok) return { error: result.error };
    return {
      success: "Product created successfully",
      redirectTo: `/admin/companies/${companySlug}/products`,
    };
  }

  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>Add product</h2>
      <ProductForm
        companySlug={companySlug}
        categories={categories}
        mediaLibrary={mediaLibrary}
        sizeLibrary={sizeLibrary}
        colorLibrary={colorLibrary}
        canUpload={canMutate(admin)}
        action={action}
      />
    </section>
  );
}
