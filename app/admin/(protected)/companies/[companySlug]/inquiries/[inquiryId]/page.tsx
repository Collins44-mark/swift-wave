import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  requireCompanyAccess,
  canOperate,
} from "@/lib/admin/require-company-access";
import { getInquiryById } from "@/lib/admin/data/inquiries";
import { InquiryDetailView } from "@/components/admin/InquiryDetailView";

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
  searchParams: Promise<{ status?: string }>;
}) {
  const { companySlug, inquiryId } = await params;
  const { status: listStatus } = await searchParams;
  const { admin, company } = await requireCompanyAccess(companySlug, "inquiries");
  const inquiry = await getInquiryById(company.id, inquiryId);

  if (!inquiry) {
    notFound();
  }

  return (
    <section className="sw-admin-panel">
      <InquiryDetailView
        companySlug={companySlug}
        inquiry={inquiry}
        canEditStatus={canOperate(admin)}
        listStatus={listStatus ?? null}
      />
    </section>
  );
}
