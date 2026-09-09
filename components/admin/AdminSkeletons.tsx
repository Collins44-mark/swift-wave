/** Polished loading placeholders — no technical implementation details. */

export function DashboardPageSkeleton() {
  return (
    <div className="sw-dash-page" aria-busy="true" aria-live="polite">
      <div
        className="sw-admin-skeleton-card"
        style={{ height: "4.5rem", marginBottom: "1.25rem" }}
      />
      <div className="sw-dash-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="sw-admin-skeleton-card"
            style={{ height: "6.875rem" }}
          />
        ))}
      </div>
      <div
        className="sw-admin-skeleton-card"
        style={{
          height: "1.25rem",
          width: "9rem",
          margin: "1.5rem 0 1rem",
        }}
      />
      <div className="sw-dash-company-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="sw-admin-skeleton-card"
            style={{ height: "12.5rem" }}
          />
        ))}
      </div>
      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}

export function CompanyGridPageSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div
        className="sw-admin-skeleton-card"
        style={{ height: "3.5rem", marginBottom: "1rem" }}
      />
      <div className="sw-admin-skeleton-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sw-admin-skeleton-card" />
        ))}
      </div>
      <span className="sr-only">Loading companies…</span>
    </div>
  );
}

export function CompanyWorkspaceSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div
        className="sw-admin-skeleton-card"
        style={{ height: "10rem", marginBottom: "1rem" }}
      />
      <div
        className="sw-admin-skeleton-card"
        style={{ height: "2.5rem", marginBottom: "1rem" }}
      />
      <div className="sw-admin-skeleton-card" style={{ height: "14rem" }} />
      <span className="sr-only">Loading company workspace…</span>
    </div>
  );
}

export function TablePageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="sw-admin-panel" aria-busy="true" aria-live="polite">
      <div
        className="sw-admin-skeleton-card"
        style={{ height: "3rem", marginBottom: "1rem" }}
      />
      <div className="sw-admin-skeleton-card" style={{ height: `${rows * 2.75 + 2}rem` }} />
      <span className="sr-only">Loading table…</span>
    </div>
  );
}

export function MediaGridSkeleton() {
  return (
    <div className="sw-admin-panel" aria-busy="true" aria-live="polite">
      <div
        className="sw-admin-skeleton-card"
        style={{ height: "3rem", marginBottom: "1rem" }}
      />
      <div className="sw-admin-media-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="sw-admin-skeleton-card"
            style={{ height: "14rem" }}
          />
        ))}
      </div>
      <span className="sr-only">Loading media library…</span>
    </div>
  );
}
