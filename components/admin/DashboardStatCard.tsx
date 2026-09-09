export function DashboardStatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="sw-admin-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
