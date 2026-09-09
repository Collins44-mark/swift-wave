import type { Metadata } from "next";
import Link from "next/link";
import { requireCompanyAccess } from "@/lib/admin/require-company-access";
import { getCompanyCapabilities } from "@/lib/admin/capabilities";
import { countProducts } from "@/lib/admin/data/products";
import { countCategories } from "@/lib/admin/data/categories";
import { countOrders } from "@/lib/admin/data/orders";
import {
  countInquiries,
  countInquiriesByStatus,
} from "@/lib/admin/data/inquiries";
import { DashboardStatCard } from "@/components/admin/DashboardStatCard";

export const metadata: Metadata = {
  title: "Company Overview — Swift Wave Admin",
  robots: { index: false, follow: false },
};

export default async function CompanyOverviewPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const { company } = await requireCompanyAccess(companySlug);
  const caps = getCompanyCapabilities(companySlug);

  if (caps.model === "ecommerce") {
    const [products, categories, orders, newOrders] = await Promise.all([
      countProducts(company.id),
      countCategories(company.id),
      countOrders(company.id),
      countOrders(company.id, { status: "new" }),
    ]);

    return (
      <section className="sw-admin-panel">
        <h2 style={{ marginTop: 0 }}>Overview</h2>
        <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
          Live catalog and order counts for {company.name}.
        </p>
        <div className="sw-admin-stats" style={{ marginBottom: 0 }}>
          <DashboardStatCard label="Products" value={String(products)} />
          <DashboardStatCard label="Categories" value={String(categories)} />
          <DashboardStatCard label="Orders" value={String(orders)} />
          <DashboardStatCard label="New orders" value={String(newOrders)} />
        </div>
        <div className="sw-admin-toolbar" style={{ marginTop: "1.25rem" }}>
          <Link
            className="sw-admin-btn"
            href={`/admin/companies/${companySlug}/products`}
          >
            Manage products
          </Link>
          <Link
            className="sw-admin-btn sw-admin-btn-ghost"
            href={`/admin/companies/${companySlug}/orders`}
          >
            View orders
          </Link>
        </div>
      </section>
    );
  }

  if (caps.model === "lead_form" || caps.model === "booking_form") {
    const [total, byStatus] = await Promise.all([
      countInquiries(company.id),
      countInquiriesByStatus(company.id),
    ]);

    return (
      <section className="sw-admin-panel">
        <h2 style={{ marginTop: 0 }}>Overview</h2>
        <p style={{ color: "var(--admin-muted)", marginTop: 0 }}>
          {caps.model === "lead_form"
            ? "Scholarship application counts from the website inbox."
            : "Freight booking inquiry counts from the website inbox."}
        </p>
        <div className="sw-admin-stats" style={{ marginBottom: 0 }}>
          <DashboardStatCard label="Total inquiries" value={String(total)} />
          <DashboardStatCard label="New" value={String(byStatus.new ?? 0)} />
          <DashboardStatCard
            label="In progress"
            value={String(byStatus.in_progress ?? 0)}
          />
          <DashboardStatCard
            label="Completed"
            value={String(byStatus.completed ?? 0)}
          />
        </div>
        <div className="sw-admin-toolbar" style={{ marginTop: "1.25rem" }}>
          <Link
            className="sw-admin-btn"
            href={`/admin/companies/${companySlug}/inquiries`}
          >
            Open inbox
          </Link>
        </div>
      </section>
    );
  }

  // coming_soon
  return (
    <section className="sw-admin-panel">
      <h2 style={{ marginTop: 0 }}>Overview</h2>
      <div className="sw-admin-alert" role="status" style={{ marginBottom: "1rem" }}>
        The public site for this company is marked coming soon. Configure
        website content, WhatsApp, and settings ahead of launch.
      </div>
      <div className="sw-admin-info-grid">
        <div className="sw-admin-info-item">
          <span>Status</span>
          <strong>{company.is_active ? "Active (admin)" : "Inactive"}</strong>
        </div>
        <div className="sw-admin-info-item">
          <span>Public</span>
          <strong>Coming soon</strong>
        </div>
        <div className="sw-admin-info-item">
          <span>Website</span>
          {company.website_url ? (
            <p>
              <a href={company.website_url} target="_blank" rel="noreferrer">
                {company.website_url}
              </a>
            </p>
          ) : (
            <strong>Not set</strong>
          )}
        </div>
        <div className="sw-admin-info-item">
          <span>WhatsApp</span>
          <strong>{company.whatsapp_number || "Not set"}</strong>
        </div>
      </div>
    </section>
  );
}
