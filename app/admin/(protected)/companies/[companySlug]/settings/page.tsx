import type { Metadata } from "next";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { updateCompanyProfile } from "@/lib/admin/actions/company-settings";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Company Settings — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function CompanySettingsPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "settings"
  );
  const isSuper = admin.profile.role === "super_admin";

  async function action(formData: FormData) {
    "use server";
    const result = await updateCompanyProfile(companySlug, formData);
    if (!result.ok) throw new Error(result.error);
    redirect(`/admin/companies/${companySlug}/settings`);
  }

  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>Settings</h2>
      <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
        Company identity and activation.
      </p>
      <form action={action} className="sw-admin-form-grid">
        <div className="sw-admin-field">
          <label>Slug</label>
          <input value={company.slug} readOnly disabled />
        </div>
        <div className="sw-admin-field">
          <label htmlFor="website_url">Website URL</label>
          <input
            id="website_url"
            name="website_url"
            defaultValue={company.website_url ?? ""}
          />
        </div>
        <div className="sw-admin-field sw-admin-field-span">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={company.description ?? ""}
          />
        </div>
        {isSuper ? (
          <div className="sw-admin-field">
            <label className="sw-admin-check-label" htmlFor="is_active">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                value="true"
                defaultChecked={company.is_active}
              />{" "}
              Active
            </label>
          </div>
        ) : (
          <div className="sw-admin-field">
            <span className="sw-admin-field-label">Active</span>
            <strong>{company.is_active ? "Yes" : "No"}</strong>
          </div>
        )}
        <div className="sw-admin-toolbar sw-admin-field-span">
          <SubmitButton>Save settings</SubmitButton>
        </div>
      </form>
    </section>
  );
}
