import type { Metadata } from "next";
import { requireCompanyAccess, canMutate } from "@/lib/admin/require-company-access";
import { listMediaAssets } from "@/lib/admin/data/media";
import { MediaLibraryClient } from "@/components/admin/MediaLibraryClient";

export const metadata: Metadata = {
  title: "Media — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function MediaPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const { admin, company } = await requireCompanyAccess(companySlug, "media");
  const assets = await listMediaAssets(company.id);

  return (
    <section className="sw-admin-panel">
      <MediaLibraryClient
        companySlug={company.slug}
        companyName={company.name}
        assets={assets}
        canManage={canMutate(admin)}
      />
    </section>
  );
}
