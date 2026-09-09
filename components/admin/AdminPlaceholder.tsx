type AdminPlaceholderProps = {
  title: string;
  description: string;
};

export function AdminPlaceholder({ title, description }: AdminPlaceholderProps) {
  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>{description}</p>
      <p className="sw-admin-placeholder">Coming soon</p>
    </section>
  );
}
