export type AdminRole = "super_admin" | "company_admin" | "staff";

export type AdminCompany = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export type AdminProfile = {
  id: string;
  full_name: string | null;
  role: AdminRole;
  /** Legacy primary company (optional). Prefer `companies` on CurrentAdmin. */
  company_id: string | null;
  is_active: boolean;
};

export type CurrentAdmin = {
  user: {
    id: string;
    email: string | null;
  };
  profile: AdminProfile;
  /** Primary/legacy company (first assigned or profiles.company_id). */
  company: AdminCompany | null;
  /** All companies this admin may access (empty for broken staff; all for super via fetch). */
  companies: AdminCompany[];
};

export type AdminAccessError =
  | "unauthenticated"
  | "no_profile"
  | "inactive"
  | "invalid_role"
  | "missing_company";
