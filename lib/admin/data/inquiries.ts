import { createClient } from "@/lib/supabase/server";
import {
  INQUIRY_SELECT,
  type Inquiry,
  type InquiryStatus,
} from "@/lib/admin/types-catalog";

export async function listInquiries(
  companyId: string,
  opts?: { status?: InquiryStatus | "all" }
): Promise<Inquiry[]> {
  const supabase = await createClient();
  let query = supabase
    .from("inquiries")
    .select(INQUIRY_SELECT)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (opts?.status && opts.status !== "all") {
    query = query.eq("status", opts.status);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data as Inquiry[]) ?? [];
}

export async function countInquiriesByStatus(
  companyId: string
): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("status")
    .eq("company_id", companyId);

  if (error || !data) return {};

  const counts: Record<string, number> = {};
  for (const row of data) {
    const s = (row as { status: string }).status;
    counts[s] = (counts[s] ?? 0) + 1;
  }
  return counts;
}

export async function countInquiries(companyId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);
  if (error) return 0;
  return count ?? 0;
}
