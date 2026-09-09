import { redirect } from "next/navigation";

/** Media is managed contextually in product/content editors — no company media library page. */
export default async function CompanyMediaPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  redirect(`/admin/companies/${companySlug}`);
}
