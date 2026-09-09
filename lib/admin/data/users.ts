import { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/auth/types";

export type ManagedUser = {
  id: string;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean;
  company_id: string | null;
  email: string | null;
  companies: { id: string; name: string; slug: string }[];
  created_at: string;
};

export async function listManagedUsers(): Promise<ManagedUser[]> {
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active, company_id, created_at")
    .order("created_at", { ascending: false });

  if (error || !profiles?.length) return [];

  const ids = profiles.map((p) => p.id);

  const { data: access } = await supabase
    .from("user_company_access")
    .select("user_id, company:companies(id, name, slug)")
    .in("user_id", ids);

  const accessMap = new Map<string, { id: string; name: string; slug: string }[]>();
  for (const row of access ?? []) {
    const nested = row.company as
      | { id: string; name: string; slug: string }
      | { id: string; name: string; slug: string }[]
      | null;
    const c = Array.isArray(nested) ? nested[0] : nested;
    if (!c?.id) continue;
    const list = accessMap.get(row.user_id) ?? [];
    list.push(c);
    accessMap.set(row.user_id, list);
  }

  // Emails via auth.users require service role — optional enrichment
  let emailMap = new Map<string, string>();
  try {
    const { createServiceRoleClient } = await import("@/lib/supabase/admin");
    const service = createServiceRoleClient();
    const { data } = await service.auth.admin.listUsers({ perPage: 200 });
    for (const u of data.users ?? []) {
      if (u.email) emailMap.set(u.id, u.email);
    }
  } catch {
    emailMap = new Map();
  }

  return profiles.map((p) => ({
    id: p.id,
    full_name: p.full_name,
    role: p.role as AdminRole,
    is_active: p.is_active,
    company_id: p.company_id,
    email: emailMap.get(p.id) ?? null,
    companies: accessMap.get(p.id) ?? [],
    created_at: p.created_at,
  }));
}

export async function getManagedUser(
  userId: string
): Promise<ManagedUser | null> {
  const all = await listManagedUsers();
  return all.find((u) => u.id === userId) ?? null;
}
