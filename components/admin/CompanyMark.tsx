/** Monochrome line icons for company cards — shared system, natural proportions. */
export function CompanyMark({ slug }: { slug: string }) {
  const s = slug.toLowerCase();
  const common = {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  if (s === "scholarship") {
    return (
      <svg {...common} className="sw-dash-company-mark-svg sw-dash-company-mark-svg--scholarship">
        <path
          d="M4 10.5 12 6l8 4.5-8 4.5-8-4.5Zm2.5 3.2v3.3c0 .7 2.4 2.5 5.5 2.5s5.5-1.8 5.5-2.5v-3.3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (s === "freight") {
    return (
      <svg {...common} className="sw-dash-company-mark-svg sw-dash-company-mark-svg--freight">
        <path
          d="M3 16.5V8.2h11.5v8.3M14.5 11h3.2L20 13.4v3.1h-1.2M6.2 18.2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10.8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (s === "outfit") {
    return (
      <svg {...common} className="sw-dash-company-mark-svg sw-dash-company-mark-svg--outfit">
        <path
          d="M9 4.5h6l2.2 3.2L15.5 9.5v10h-7V9.5L6.8 7.7 9 4.5Zm0 0L12 7l3-2.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (s === "medical") {
    return (
      <svg {...common} className="sw-dash-company-mark-svg sw-dash-company-mark-svg--medical">
        <path
          d="M12 20.5s-6.5-4.2-6.5-9.5a4.5 4.5 0 0 1 8.2-2.6A4.5 4.5 0 0 1 18.5 11c0 5.3-6.5 9.5-6.5 9.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (s === "travels") {
    return (
      <svg {...common} className="sw-dash-company-mark-svg sw-dash-company-mark-svg--travels">
        <path
          d="M3.5 12.5 20 5.5l-3.2 13.2-4.1-4.4-3.3 3.1.7-5.2L3.5 12.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (s === "catering") {
    return (
      <svg {...common} className="sw-dash-company-mark-svg sw-dash-company-mark-svg--catering">
        <path
          d="M6 4.5v5.8c0 1.2.8 2.2 2 2.5V19.5M10 12.8c1.2-.3 2-1.3 2-2.5V4.5M14 4.5v15M17.5 4.5V9c0 1.4 1.1 2.5 2.5 2.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg {...common} className="sw-dash-company-mark-svg">
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
