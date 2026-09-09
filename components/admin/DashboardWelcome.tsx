type DashboardWelcomeProps = {
  displayName: string;
  subtitle: string;
};

export function DashboardWelcome({
  displayName,
  subtitle,
}: DashboardWelcomeProps) {
  return (
    <header className="sw-dash-welcome">
      <p className="sw-dash-eyebrow">Swift Wave Group</p>
      <h1 className="sw-dash-title">Welcome back, {displayName}</h1>
      <p className="sw-dash-subtitle">{subtitle}</p>
    </header>
  );
}
