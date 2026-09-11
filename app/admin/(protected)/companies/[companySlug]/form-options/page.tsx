import type { Metadata } from "next";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { getCompanySettings } from "@/lib/admin/data/company-settings";
import { ClientActionForm } from "@/components/admin/ClientActionForm";

export const metadata: Metadata = {
  title: "Form Options — Swift Wave Admin",
  robots: { index: false, follow: false },
};

function asLines(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join("\n");
  return "";
}

export default async function FormOptionsPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const { company } = await requireCompanyAccess(companySlug, "form_options");
  const settings = await getCompanySettings(company.id);
  const form =
    (settings?.settings?.scholarship_form as Record<string, unknown>) ?? {};

  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>Form options</h2>
      <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
        One option per line. These power the scholarship application selects.
      </p>
      <ClientActionForm
        actionName="updateScholarshipFormOptions"
        companySlug={companySlug}
        successMessage="Changes saved successfully"
        submitLabel="Save options"
      >
        <div className="sw-admin-field sw-admin-field-span">
          <label htmlFor="nationalities">Nationalities</label>
          <textarea
            id="nationalities"
            name="nationalities"
            rows={6}
            defaultValue={asLines(form.nationalities)}
          />
        </div>
        <div className="sw-admin-field sw-admin-field-span">
          <label htmlFor="destinations">Destinations</label>
          <textarea
            id="destinations"
            name="destinations"
            rows={6}
            defaultValue={asLines(form.destinations)}
          />
        </div>
        <div className="sw-admin-field sw-admin-field-span">
          <label htmlFor="education_levels">Education levels</label>
          <textarea
            id="education_levels"
            name="education_levels"
            rows={4}
            defaultValue={asLines(form.education_levels)}
          />
        </div>
        <div className="sw-admin-field sw-admin-field-span">
          <label htmlFor="fields_of_study">Fields of study</label>
          <textarea
            id="fields_of_study"
            name="fields_of_study"
            rows={6}
            defaultValue={asLines(form.fields_of_study)}
          />
        </div>
      </ClientActionForm>
    </section>
  );
}
