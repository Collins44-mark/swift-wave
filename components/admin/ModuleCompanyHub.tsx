import { getCompanyCapabilities } from "@/lib/admin/capabilities";
import type { CompanyModuleKey } from "@/lib/admin/capabilities";
import type { CurrentAdmin } from "@/lib/auth/types";
import { AdminHubLink } from "@/components/navigation/AdminHubLink";

const MODULE_META: Record<
  string,
  { title: string; description: string; module: CompanyModuleKey; path: string }
> = {
  products: {
    title: "Products",
    description: "Manage catalogs for ecommerce companies.",
    module: "products",
    path: "products",
  },
  categories: {
    title: "Categories",
    description: "Organize product categories for ecommerce companies.",
    module: "categories",
    path: "categories",
  },
  orders: {
    title: "Orders",
    description: "WhatsApp checkout orders for ecommerce companies.",
    module: "orders",
    path: "orders",
  },
  "website-content": {
    title: "Website Content",
    description: "Edit hero and page content for each company site.",
    module: "website_content",
    path: "website-content",
  },
  media: {
    title: "Media",
    description: "Upload and manage company images.",
    module: "media",
    path: "media",
  },
  whatsapp: {
    title: "WhatsApp",
    description: "Configure company WhatsApp numbers and messaging.",
    module: "whatsapp",
    path: "whatsapp",
  },
};

export function ModuleCompanyHub({
  admin,
  hubKey,
}: {
  admin: CurrentAdmin;
  hubKey: keyof typeof MODULE_META;
}) {
  const meta = MODULE_META[hubKey];
  const eligible = admin.companies.filter((c) => {
    const caps = getCompanyCapabilities(c.slug);
    return caps.modules.some((m) => m.key === meta.module && m.ready);
  });

  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>{meta.title}</h2>
      <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
        {meta.description} Select a company workspace to continue.
      </p>

      {!eligible.length ? (
        <div className="sw-admin-empty" role="status">
          No companies with this module are available for your account.
        </div>
      ) : (
        <div className="sw-admin-hub-grid">
          {eligible.map((c) => (
            <AdminHubLink
              key={c.id}
              href={`/admin/companies/${c.slug}/${meta.path}`}
            >
              <strong>{c.name}</strong>
              <span>Open {meta.title} →</span>
            </AdminHubLink>
          ))}
        </div>
      )}
    </section>
  );
}
