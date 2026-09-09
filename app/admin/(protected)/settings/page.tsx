import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { roleLabel } from "@/lib/admin/labels";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = {
  title: "Settings — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const access = await getCurrentAdmin();
  if (!access.ok) redirect("/admin/login");
  const { admin } = access;
  const isSuper = admin.profile.role === "super_admin";

  return (
    <>
      <PageHeader
        title="Settings"
        description="Account, administrators, company access, and system configuration."
      />

      <div className="sw-admin-section-head">
        <div>
          <h2>Account</h2>
          <p>Your signed-in administrator profile.</p>
        </div>
      </div>

      <div className="sw-admin-hub-grid">
        <article className="sw-admin-hub-card is-static">
          <strong>{admin.profile.full_name || "Administrator"}</strong>
          <p>
            {admin.user.email}
            <br />
            {roleLabel(admin.profile.role)} · Active
          </p>
        </article>
        <article className="sw-admin-hub-card is-static">
          <strong>Security</strong>
          <p>
            Sign-in is handled by Supabase Auth. Use Logout from the sidebar or
            profile menu to end your session.
          </p>
        </article>
      </div>

      {isSuper ? (
        <>
          <div className="sw-admin-section-head" style={{ marginTop: "1.5rem" }}>
            <div>
              <h2>Administrator Management</h2>
              <p>Create staff and company admins with multi-company access.</p>
            </div>
          </div>
          <div className="sw-admin-hub-grid">
            <Link className="sw-admin-hub-card" href="/admin/settings/users">
              <strong>Administrators</strong>
              <span>View, create, edit, disable, or delete admin accounts →</span>
            </Link>
            <Link className="sw-admin-hub-card" href="/admin/settings/users/new">
              <strong>Add Administrator</strong>
              <span>Create Auth user + assign companies →</span>
            </Link>
          </div>

          <div className="sw-admin-section-head" style={{ marginTop: "1.5rem" }}>
            <div>
              <h2>Company &amp; System</h2>
              <p>Workspace access and shared admin modules.</p>
            </div>
          </div>
          <div className="sw-admin-hub-grid">
            <Link className="sw-admin-hub-card" href="/admin/companies">
              <strong>Company Management</strong>
              <span>Open any of the six company workspaces →</span>
            </Link>
            <Link className="sw-admin-hub-card" href="/admin/website-content">
              <strong>Website Content</strong>
              <span>Edit CMS fields per company →</span>
            </Link>
            <Link className="sw-admin-hub-card" href="/admin/media">
              <strong>Media</strong>
              <span>Cloudinary media library hubs →</span>
            </Link>
            <Link className="sw-admin-hub-card" href="/admin/whatsapp">
              <strong>WhatsApp</strong>
              <span>Company WhatsApp configuration →</span>
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="sw-admin-section-head" style={{ marginTop: "1.5rem" }}>
            <div>
              <h2>Company Access</h2>
              <p>Companies assigned to your account.</p>
            </div>
          </div>
          <div className="sw-admin-hub-grid">
            {admin.companies.map((c) => (
              <Link
                key={c.id}
                className="sw-admin-hub-card"
                href={`/admin/companies/${c.slug}`}
              >
                <strong>{c.name}</strong>
                <span>Open workspace →</span>
              </Link>
            ))}
            <Link className="sw-admin-hub-card" href="/admin/companies">
              <strong>All assigned companies</strong>
              <span>Company list →</span>
            </Link>
          </div>
        </>
      )}
    </>
  );
}
