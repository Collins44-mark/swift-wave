export default function CompanyLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div
        className="sw-admin-skeleton-card"
        style={{ height: 160, marginBottom: "1rem" }}
      />
      <div
        className="sw-admin-skeleton-card"
        style={{ height: 40, marginBottom: "1rem" }}
      />
      <div className="sw-admin-skeleton-card" style={{ height: 220 }} />
      <span className="sr-only">Loading company workspace…</span>
    </div>
  );
}
