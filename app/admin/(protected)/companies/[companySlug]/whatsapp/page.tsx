import type { Metadata } from "next";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { updateWhatsappNumber } from "@/lib/admin/actions/company-settings";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "WhatsApp — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function WhatsappPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const { company } = await requireCompanyAccess(companySlug, "whatsapp");
  const number = company.whatsapp_number ?? "";
  const preview = number
    ? `https://wa.me/${number.replace(/\D/g, "")}`
    : null;

  async function action(formData: FormData) {
    "use server";
    const result = await updateWhatsappNumber(companySlug, formData);
    if (!result.ok) throw new Error(result.error);
    redirect(`/admin/companies/${companySlug}/whatsapp`);
  }

  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>WhatsApp</h2>
      <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
        Used by public checkout and inquiry flows. Digits only (country code,
        no +).
      </p>
      <form action={action} className="sw-admin-form-grid">
        <div className="sw-admin-field">
          <label htmlFor="whatsapp_number">WhatsApp number</label>
          <input
            id="whatsapp_number"
            name="whatsapp_number"
            defaultValue={number}
            placeholder="255700000000"
          />
        </div>
        <div className="sw-admin-field">
          <span className="sw-admin-field-label">Preview</span>
          {preview ? (
            <p style={{ margin: 0 }}>
              <a href={preview} target="_blank" rel="noreferrer">
                {preview}
              </a>
            </p>
          ) : (
            <strong>Not set</strong>
          )}
        </div>
        <div className="sw-admin-toolbar sw-admin-field-span">
          <SubmitButton>Save number</SubmitButton>
        </div>
      </form>
    </section>
  );
}
