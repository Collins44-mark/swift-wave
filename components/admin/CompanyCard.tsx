import Link from "next/link";
import type { CompanyRecord } from "@/lib/admin/company-types";
import { companyCategoryLabel } from "@/lib/admin/labels";

function CompanyMark({ slug }: { slug: string }) {
  const s = slug.toLowerCase();
  const common = {
    className: "sw-admin-company-mark-svg",
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };

  if (s === "scholarship") {
    return (
      <svg {...common}>
        <path
          d="M4 10.5 12 6l8 4.5-8 4.5-8-4.5Zm2.5 3.2v3.3c0 .7 2.4 2.5 5.5 2.5s5.5-1.8 5.5-2.5v-3.3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (s === "freight") {
    return (
      <svg {...common}>
        <path
          d="M3 16.5V8.2h11.5v8.3M14.5 11h3.2L20 13.4v3.1h-1.2M6.2 18.2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10.8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (s === "outfit") {
    return (
      <svg {...common}>
        <path
          d="M9 4.5h6l2.2 3.2L15.5 9.5v10h-7V9.5L6.8 7.7 9 4.5Zm0 0L12 7l3-2.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (s === "medical") {
    return (
      <svg {...common}>
        <path
          d="M12 4.5v15M4.5 12h15"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <rect
          x="7.5"
          y="7.5"
          width="9"
          height="9"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  if (s === "travels") {
    return (
      <svg {...common}>
        <path
          d="M3.5 12.5 20 5.5l-3.2 13.2-4.1-4.4-3.3 3.1.7-5.2L3.5 12.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (s === "catering") {
    return (
      <svg {...common}>
        <path
          d="M7 4.5v6.2a2.5 2.5 0 0 0 5 0V4.5M9.5 4.5v6.2M12 4.5v6.2M16 4.8v14.7M7 19.5h12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

export function CompanyCard({ company }: { company: CompanyRecord }) {
  const category = companyCategoryLabel(company.slug, company.name);

  return (
    <article className="sw-admin-company-card">
      <div className="sw-admin-company-card-top">
        <span className="sw-admin-company-mark" aria-hidden="true">
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo_url} alt="" />
          ) : (
            <CompanyMark slug={company.slug} />
          )}
        </span>
        <span className="sw-admin-company-eyebrow">{category}</span>
      </div>

      <h3 className="sw-admin-company-name">{company.name}</h3>

      <Link
        className="sw-admin-company-action"
        href={`/admin/companies/${company.slug}`}
      >
        Manage Company
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
