import type { AdminRole } from "@/lib/auth/types";

export function roleLabel(role: AdminRole | string): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "company_admin":
      return "Company Admin";
    case "staff":
      return "Staff";
    default:
      return role;
  }
}

export function accessLevelLabel(role: AdminRole | string): string {
  switch (role) {
    case "super_admin":
      return "All Companies";
    case "company_admin":
      return "Assigned Company";
    case "staff":
      return "Assigned Company";
    default:
      return "Limited";
  }
}

export function userInitials(name: string | null | undefined, email: string | null): string {
  const source = (name || email || "SW").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

/** Category eyebrow for company cards, derived from slug / name. */
export function companyCategoryLabel(slug: string, name?: string | null): string {
  const key = slug.toLowerCase();
  const map: Record<string, string> = {
    scholarship: "Education",
    freight: "Logistics",
    outfit: "Fashion",
    medical: "Healthcare",
    travels: "Travel & Tourism",
    catering: "Catering & Events",
  };
  if (map[key]) return map[key];

  const n = (name || "").toLowerCase();
  if (n.includes("scholarship")) return "Education";
  if (n.includes("freight")) return "Logistics";
  if (n.includes("outfit")) return "Fashion";
  if (n.includes("medical")) return "Healthcare";
  if (n.includes("travel")) return "Travel & Tourism";
  if (n.includes("catering")) return "Catering & Events";
  return "Division";
}
