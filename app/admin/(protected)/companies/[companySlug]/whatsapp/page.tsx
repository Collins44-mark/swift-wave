import type { Metadata } from "next";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { WhatsappSettingsClient } from "@/components/admin/WhatsappSettingsClient";
import { PageHeader } from "@/components/admin/PageHeader";

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
    <>
      <PageHeader
        title="WhatsApp"
        description={`Used by public checkout and inquiry flows for ${company.name}.`}
      />
      <section className="sw-admin-panel">
        <WhatsappSettingsClient companySlug={companySlug} initialNumber={number} />
      </section>
    </>
  );
}
