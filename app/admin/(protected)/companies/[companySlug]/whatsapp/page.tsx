import type { Metadata } from "next";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { updateWhatsappNumber } from "@/lib/admin/actions/company-settings";
import { redirect } from "next/navigation";
import { WhatsappSettingsForm } from "@/components/admin/WhatsappSettingsForm";

export const metadata: Metadata = {
  title: "WhatsApp — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function WhatsappPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { companySlug } = await params;
  const { error: queryError, saved } = await searchParams;
  const { company } = await requireCompanyAccess(companySlug, "whatsapp");
  const number = company.whatsapp_number ?? "";

  async function action(formData: FormData) {
    "use server";
    const result = await updateWhatsappNumber(companySlug, formData);
    if (!result.ok) {
      redirect(
        `/admin/companies/${companySlug}/whatsapp?error=${encodeURIComponent(result.error)}`
      );
    }
    redirect(`/admin/companies/${companySlug}/whatsapp?saved=1`);
  }

  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>WhatsApp</h2>
      <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
        Used by public checkout and inquiry flows for {company.name}.
      </p>
      {saved === "1" ? (
        <div className="sw-admin-alert" role="status" style={{ marginBottom: "1rem" }}>
          WhatsApp number saved.
        </div>
      ) : null}
      <WhatsappSettingsForm
        companySlug={companySlug}
        initialNumber={number}
        action={action}
        serverError={queryError ? decodeURIComponent(queryError) : null}
      />
    </section>
  );
}
