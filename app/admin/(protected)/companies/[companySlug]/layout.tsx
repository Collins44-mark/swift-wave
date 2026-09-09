import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { getAccessibleCompanyBySlug } from "@/lib/admin/companies";
import { CompanySubnav } from "@/components/admin/CompanySubnav";

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ companySlug: string }>;
}) {
  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");

  const { companySlug } = await params;
  const { company, error } = await getAccessibleCompanyBySlug(
    access.admin,
    companySlug
  );

  if (error === "unauthorized" || error === "not_found" || !company) {
    notFound();
  }

  if (error === "fetch_failed") {
    return (
      <div className="sw-admin-alert is-error" role="alert">
        Unable to load this company right now. Please try again.
      </div>
    );
  }

  return (
    <>
      <section className="sw-admin-panel sw-admin-company-hero">
        <div className="sw-admin-company-hero-main">
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="sw-admin-company-logo"
              src={company.logo_url}
              alt=""
              style={{ width: "3.5rem", height: "3.5rem" }}
            />
          ) : (
            <div
              className="sw-admin-company-logo-fallback"
              aria-hidden="true"
              style={{ width: "3.5rem", height: "3.5rem" }}
            >
              {company.name
                .split(/\s+/)
                .slice(0, 2)
                .map((p) => p[0])
                .join("")
                .toUpperCase()}
            </div>
          )}
          <div>
            <h1>{company.name}</h1>
            <div className="sw-admin-company-meta">
              <span
                className={`sw-admin-badge ${company.is_active ? "is-active" : "is-inactive"}`}
              >
                {company.is_active ? "Active" : "Inactive"}
              </span>
              <span className="sw-admin-badge">/{company.slug}</span>
            </div>
          </div>
        </div>
        <p className="sw-admin-company-desc" style={{ WebkitLineClamp: 4 }}>
          {company.description || "No description available yet."}
        </p>
        {!company.is_active ? (
          <div className="sw-admin-alert is-error" role="status">
            This company is currently marked inactive.
          </div>
        ) : null}
      </section>

      <CompanySubnav companySlug={company.slug} />
      {children}
    </>
  );
}
