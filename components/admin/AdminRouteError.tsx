"use client";

export function AdminRouteError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <section className="sw-admin-panel sw-admin-route-error" role="alert">
      <h2 className="sw-admin-route-error-title">Something went wrong</h2>
      <p className="sw-admin-route-error-copy">
        We couldn&apos;t load this page right now. Please try again.
      </p>
      <button type="button" className="sw-admin-btn" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
