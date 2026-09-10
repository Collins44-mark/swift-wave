import { HtmlIsland } from "@/components/legacy/HtmlIsland";
import {
  getLegacyPage,
  readLegacyHtml,
} from "@/lib/legacy-page";
import { ComingSoonRedirect } from "@/components/legacy/ComingSoonRedirect";
import { resolveCmsContext } from "@/lib/cms/resolve-scope";
import {
  getCompanyIdBySlug,
  getPageContent,
} from "@/lib/cms/get-page-content";
import { hydrateLegacyHtml } from "@/lib/cms/hydrate-html";
import { getCorporateCompanyCards } from "@/lib/public/corporate-companies";
import { injectCorporateCompanyCards } from "@/lib/public/render-corporate-cards-html";

type LegacyPageProps = {
  slug: string;
  /** When true, render draft CMS content (admin preview). */
  previewDraft?: boolean;
};

export async function LegacyPage({ slug, previewDraft = false }: LegacyPageProps) {
  const page = getLegacyPage(slug);
  let html = readLegacyHtml(slug);

  const ctx = resolveCmsContext(slug);
  const [cards, companyId] = await Promise.all([
    slug === "companies" ? getCorporateCompanyCards() : Promise.resolve(null),
    getCompanyIdBySlug(ctx.companySlug),
  ]);

  if (cards) {
    html = injectCorporateCompanyCards(html, cards);
  }

  if (companyId) {
    const pageContent = await getPageContent(
      companyId,
      ctx.pageKey,
      previewDraft ? "preview" : "published"
    );
    if (Object.keys(pageContent).length) {
      html = hydrateLegacyHtml(html, pageContent);
    }
  }

  return (
    <>
      {page.refresh ? <ComingSoonRedirect to="/companies" delayMs={2000} /> : null}
      <HtmlIsland
        html={html}
        scripts={page.scripts}
        bodyClassName={page.bodyClass}
        bodyStyle={page.bodyStyle ?? undefined}
        bodyAttrs={
          Object.fromEntries(
            Object.entries(page.bodyAttrs || {}).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string"
            )
          )
        }
      />
    </>
  );
}
