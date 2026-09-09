import type { ReactNode } from "react";

export function DashboardSummaryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: "gold";
}) {
  return (
    <article
      className={`sw-dash-stat${accent === "gold" ? " is-gold-accent" : ""}`}
    >
      <span className="sw-dash-stat-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="sw-dash-stat-copy">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  );
}
