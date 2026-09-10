"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getCompanyCapabilities,
  companyModuleHref,
} from "@/lib/admin/capabilities";
import { LinkPendingFlag } from "@/components/navigation/LinkPendingFlag";

export function CompanySubnav({ companySlug }: { companySlug: string }) {
  const pathname = usePathname();
  const profile = getCompanyCapabilities(companySlug);
  const base = `/admin/companies/${companySlug}`;

  return (
    <nav className="sw-admin-company-subnav" aria-label="Company modules">
      {profile.modules.map((item) => {
        if (!item.ready) {
          return (
            <span key={item.key} className="is-disabled" aria-disabled="true">
              {item.label}
              <span className="sw-admin-pill">Coming Soon</span>
            </span>
          );
        }

        const href = companyModuleHref(companySlug, item.path);
        const active =
          item.path === ""
            ? pathname === base || pathname === `${base}/`
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={item.key}
            href={href}
            prefetch
            className={active ? "is-active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            <LinkPendingFlag />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
