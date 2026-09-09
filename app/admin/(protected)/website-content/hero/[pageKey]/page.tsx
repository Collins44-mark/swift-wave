import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { getAccessibleCompanyBySlug } from "@/lib/admin/companies";
import { canMutate } from "@/lib/admin/require-company-access";
import { getWebsitePageSections } from "@/lib/admin/data/website-content";
import { listMediaAssets } from "@/lib/admin/data/media";
import { HeroImageEditor } from "@/components/admin/HeroImageEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { getHeroPage } from "@/lib/cms/hero-pages";

export const metadata: Metadata = {
  title: "Edit Hero — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function CorporateHeroEditorPage({
  params,
}: {
  params: Promise<{ pageKey: string }>;
}) {
  const { pageKey } = await params;

  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");
  if (access.admin.profile.role !== "super_admin") {
    redirect("/admin/website-content/hero");
  }

  const hero = getHeroPage("corporate", pageKey);
  if (!hero || !hero.isCorporate) notFound();

  const { company, error } = await getAccessibleCompanyBySlug(
    access.admin,
    "corporate"
  );
  if (error || !company) notFound();

  const [sections, mediaLibrary] = await Promise.all([
    getWebsitePageSections(company.id, pageKey),
    listMediaAssets(company.id),
  ]);

  const heroRecord = sections.find((s) => s.section_key === "hero");
  const content = (heroRecord?.content ?? {}) as Record<string, unknown>;

  return (
    <>
      <PageHeader
        title={hero.label}
        description="Upload or select a hero image. Changes publish to the live corporate page."
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
        canUpload={canMutate(access.admin)}
        backHref="/admin/website-content/hero"
      />
    </>
  );
}
