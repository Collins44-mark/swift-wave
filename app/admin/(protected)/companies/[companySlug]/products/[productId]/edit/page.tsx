import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  requireCompanyAccess,
  canMutate,
} from "@/lib/admin/require-company-access";
import { listCategories } from "@/lib/admin/data/categories";
import { listMediaAssets } from "@/lib/admin/data/media";
import { getProduct, listColorLibrary, listSizeLibrary } from "@/lib/admin/data/products";
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
  const [product, categories, mediaLibrary, sizeLibrary, colorLibrary] =
    await Promise.all([
      getProduct(company.id, productId),
      listCategories(company.id),
      listMediaAssets(company.id),
      listSizeLibrary(),
      listColorLibrary(),
    ]);

  if (!product) notFound();

  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>Edit product</h2>
      <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>{product.name}</p>
      <ProductForm
        companySlug={companySlug}
        product={product}
        categories={categories}
        mediaLibrary={mediaLibrary}
        sizeLibrary={sizeLibrary}
        colorLibrary={colorLibrary}
        canUpload={canMutate(admin)}
      />
    </section>
  );
}
