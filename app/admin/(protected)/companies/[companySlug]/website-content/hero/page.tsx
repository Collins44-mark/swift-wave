import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  requireCompanyAccess,
  canMutate,
} from "@/lib/admin/require-company-access";
import { getWebsitePageSections } from "@/lib/admin/data/website-content";
import { listMediaAssets } from "@/lib/admin/data/media";
import { HeroImageEditor } from "@/components/admin/HeroImageEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { getHeroPage } from "@/lib/cms/hero-pages";

export const metadata: Metadata = {
  title: "Hero Image — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function CompanyHeroEditorPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "website_content"
  );

  const hero = getHeroPage(companySlug, companySlug);
  if (!hero) notFound();

  const [sections, mediaLibrary] = await Promise.all([
    getWebsitePageSections(company.id, companySlug),
    listMediaAssets(company.id),
  ]);

  const heroRecord = sections.find((s) => s.section_key === "hero");
  const content = (heroRecord?.content ?? {}) as Record<string, unknown>;

  return (
    <>
      <PageHeader
        title={hero.label}
        description={`Manage the hero image for ${company.name}.`}
      />
      <HeroImageEditor
        hero={hero}
        content={{
          image_url: typeof content.image_url === "string" ? content.image_url : null,
          image_public_id:
            typeof content.image_public_id === "string"
              ? content.image_public_id
              : null,
          alt_text: typeof content.alt_text === "string" ? content.alt_text : null,
        }}
        mediaLibrary={mediaLibrary}
        canUpload={canMutate(admin)}
        backHref={`/admin/companies/${companySlug}/website-content`}
      />
    </>
  );
}
