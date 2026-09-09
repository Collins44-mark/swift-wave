import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { updateCorporateProfile } from "@/lib/admin/actions/company-settings";
import { CorporateProfileForm } from "@/components/admin/CorporateProfileForm";

export const metadata: Metadata = {
  title: "Corporate Profile — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function CorporateProfilePage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const { admin, company } = await requireCompanyAccess(
    companySlug,
    "corporate_profile"
  );

  async function action(formData: FormData) {
    "use server";
    const result = await updateCorporateProfile(companySlug, formData);
    if (!result.ok) throw new Error(result.error);
    redirect(`/admin/companies/${companySlug}/corporate-profile`);
  }

  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>Corporate Profile</h2>
      <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
        Manage how this company appears on the corporate Our Companies page.
      </p>
      <CorporateProfileForm
        company={company}
        isSuperAdmin={admin.profile.role === "super_admin"}
        action={action}
      />
    </section>
  );
}
