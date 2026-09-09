import type { Metadata } from "next";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { getCompanySettings } from "@/lib/admin/data/company-settings";
import { updateFreightRouteHubs } from "@/lib/admin/actions/company-settings";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Route Hubs — Swift Wave Admin",
  robots: { index: false, follow: false },
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function hubsToText(hubs: unknown): string {
  if (!hubs || typeof hubs !== "object") return "";
  return Object.entries(hubs as Record<string, unknown>)
    .map(([name, days]) => {
      const nums = Array.isArray(days) ? days.map(Number) : [];
      const labels = nums
        .map((d) => DAY_LABELS[d] ?? String(d))
        .join(",");
      return `${name}: ${labels}`;
    })
    .join("\n");
}

function destToText(dest: unknown): string {
  if (!Array.isArray(dest)) return "";
  return dest.map(String).join("\n");
}

export default async function RouteHubsPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const { company } = await requireCompanyAccess(companySlug, "route_hubs");
  const settings = await getCompanySettings(company.id);
  const hubs = settings?.settings?.freight_hubs;
  const destinations = settings?.settings?.freight_destinations;

  async function action(formData: FormData) {
    "use server";
    const result = await updateFreightRouteHubs(companySlug, formData);
    if (!result.ok) throw new Error(result.error);
    redirect(`/admin/companies/${companySlug}/route-hubs`);
  }

  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>Route hubs</h2>
      <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
        One hub per line as{" "}
        <code>Hub name: Mon,Thu</code> or{" "}
        <code>Hub name: 1,4</code> (0=Sun … 6=Sat). Destinations: one per line.
      </p>
      <form action={action} className="sw-admin-form-grid">
        <div className="sw-admin-field sw-admin-field-span">
          <label htmlFor="freight_hubs">Freight hubs</label>
          <textarea
            id="freight_hubs"
            name="freight_hubs"
            rows={8}
            defaultValue={hubsToText(hubs)}
          />
        </div>
        <div className="sw-admin-field sw-admin-field-span">
          <label htmlFor="freight_destinations">Destinations</label>
          <textarea
            id="freight_destinations"
            name="freight_destinations"
            rows={6}
            defaultValue={destToText(destinations)}
          />
        </div>
        <div className="sw-admin-toolbar sw-admin-field-span">
          <SubmitButton>Save hubs</SubmitButton>
        </div>
      </form>
    </section>
  );
}
