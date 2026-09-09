import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { ModuleCompanyHub } from "@/components/admin/ModuleCompanyHub";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  COMPANY_HERO_PAGES,
  CORPORATE_HERO_PAGES,
} from "@/lib/cms/hero-pages";

export const metadata: Metadata = {
  title: "Hero Images — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function HeroManagementHubPage() {
  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");

  const isSuper = access.admin.profile.role === "super_admin";

  return (
    <>
      <PageHeader
        title="Hero Images"
        description="Manage the hero/banner image for each public page independently."
      />

      {isSuper ? (
        <>
          <div className="sw-admin-section-head">
            <div>
              <h2>Corporate</h2>
              <p>Group website pages with hero sections.</p>
            </div>
          </div>
          <div className="sw-admin-hub-grid" style={{ marginBottom: "1.5rem" }}>
            {CORPORATE_HERO_PAGES.map((hero) => (
              <Link
                key={hero.pageKey}
                className="sw-admin-hub-card"
                href={`/admin/website-content/hero/${hero.pageKey}`}
              >
                <strong>{hero.label}</strong>
                <span>
                  {hero.route} · {hero.heroType} hero →
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : null}

      <div className="sw-admin-section-head">
        <div>
          <h2>Company websites</h2>
          <p>Division pages with shop-style hero banners.</p>
        </div>
      </div>
      <div className="sw-admin-hub-grid" style={{ marginBottom: "1.5rem" }}>
        {COMPANY_HERO_PAGES.map((hero) => (
          <Link
            key={hero.pageKey}
            className="sw-admin-hub-card"
            href={`/admin/companies/${hero.companySlug}/website-content/hero`}
          >
            <strong>{hero.label}</strong>
            <span>
              {hero.route} · shop hero →
            </span>
          </Link>
        ))}
      </div>

      {!isSuper ? (
        <ModuleCompanyHub admin={access.admin} hubKey="website-content" />
      ) : null}
    </>
  );
}
