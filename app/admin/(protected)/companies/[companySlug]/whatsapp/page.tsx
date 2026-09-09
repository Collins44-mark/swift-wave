import type { Metadata } from "next";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { WhatsappSettingsClient } from "@/components/admin/WhatsappSettingsClient";

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

  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>WhatsApp</h2>
      <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
        Used by public checkout and inquiry flows for {company.name}.
      </p>
      <WhatsappSettingsClient companySlug={companySlug} initialNumber={number} />
    </section>
  );
}
