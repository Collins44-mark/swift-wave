import Link from "next/link";

export default function CompanyNotFound() {
  return (
    <section className="sw-admin-panel">
      <h1 style={{ marginTop: 0, color: "#081F4D" }}>Company unavailable</h1>
      <p style={{ color: "#64748B" }}>
        This company could not be found, is inactive for your view, or you do not
        have permission to access it.
      </p>
      <Link className="sw-admin-btn sw-admin-btn-gold" href="/admin/companies">
        Back to Companies
      </Link>
    </section>
  );
}
