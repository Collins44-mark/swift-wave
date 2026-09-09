import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  requireCompanyAccess,
  canMutate,
} from "@/lib/admin/require-company-access";
import { listCategories } from "@/lib/admin/data/categories";
import { listMediaAssets } from "@/lib/admin/data/media";
import { getProduct } from "@/lib/admin/data/products";
import { updateProduct } from "@/lib/admin/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = {
  title: "Edit Product — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ companySlug: string; productId: string }>;
}) {
  const { companySlug, productId } = await params;
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "products"
  );
  const [product, categories, mediaLibrary] = await Promise.all([
    getProduct(company.id, productId),
    listCategories(company.id),
    listMediaAssets(company.id),
  ]);

  if (!product) notFound();

  async function action(
    _prev: { error?: string } | null,
    formData: FormData
  ) {
    "use server";
    const result = await updateProduct(companySlug, productId, formData);
    if (!result.ok) return { error: result.error };
    redirect(`/admin/companies/${companySlug}/products?toast=product_updated`);
  }

  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>Edit product</h2>
      <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>{product.name}</p>
      <ProductForm
        companySlug={companySlug}
        product={product}
        categories={categories}
        mediaLibrary={mediaLibrary}
        canUpload={canMutate(admin)}
        action={action}
      />
    </section>
  );
}
