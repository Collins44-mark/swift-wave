"use client";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      style={{
        minHeight: "40vh",
        display: "grid",
        placeItems: "center",
        padding: "3rem 1.25rem",
        fontFamily: "DM Sans, system-ui, sans-serif",
      }}
    >
      <div role="alert" style={{ maxWidth: "28rem", textAlign: "center" }}>
        <h1 style={{ margin: "0 0 0.6rem", fontSize: "1.35rem" }}>
          Something went wrong
        </h1>
        <p style={{ margin: "0 0 1.25rem", color: "#64748b" }}>
          This page could not be loaded. You can try again without leaving the
          site.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            border: 0,
            borderRadius: 999,
            padding: "0.7rem 1.2rem",
            background: "#0b2e6d",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
