import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  requireCompanyAccess,
  canOperate,
} from "@/lib/admin/require-company-access";
import { getInquiryById } from "@/lib/admin/data/inquiries";
import { updateInquiry } from "@/lib/admin/actions/inquiries";
import { InquiryDetailView } from "@/components/admin/InquiryDetailView";
import { InquiriesPageToasts } from "@/components/admin/InquiriesPageToasts";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ companySlug: string; inquiryId: string }>;
}): Promise<Metadata> {
  const { companySlug, inquiryId } = await params;
  const { company } = await requireCompanyAccess(companySlug, "inquiries");
  const inquiry = await getInquiryById(company.id, inquiryId);

  return {
    title: inquiry
      ? `${inquiry.customer_name} — Swift Wave Admin`
      : "Inquiry not found — Swift Wave Admin",
    robots: { index: false, follow: false },
  };
}

export default async function InquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string; inquiryId: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const { companySlug, inquiryId } = await params;
  const { error: queryError, status: listStatus } = await searchParams;
  const { admin, company } = await requireCompanyAccess(companySlug, "inquiries");
  const inquiry = await getInquiryById(company.id, inquiryId);

  if (!inquiry) {
    notFound();
  }

  async function statusAction(formData: FormData) {
    "use server";
    const result = await updateInquiry(companySlug, inquiryId, formData);
    const statusSuffix = listStatus ? `&status=${listStatus}` : "";

    if (!result.ok) {
      redirect(
        `/admin/companies/${companySlug}/inquiries/${inquiryId}?error=${encodeURIComponent(result.error)}${statusSuffix}`
      );
    }

    redirect(
      `/admin/companies/${companySlug}/inquiries/${inquiryId}?toast=inquiry_status_updated${statusSuffix}`
    );
  }

  return (
    <>
      <InquiriesPageToasts />
      <section className="sw-admin-panel">
        <InquiryDetailView
          companySlug={companySlug}
          inquiry={inquiry}
          canEditStatus={canOperate(admin)}
          statusAction={statusAction}
          statusError={queryError ? decodeURIComponent(queryError) : null}
          listStatus={listStatus ?? null}
        />
      </section>
    </>
  );
}
