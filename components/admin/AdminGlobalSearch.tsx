"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function AdminGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    router.push(`/admin/companies?q=${encodeURIComponent(q)}`);
  }, [query, router]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("sw-admin-global-search")?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <form
      className="sw-dash-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <svg
        className="sw-dash-search-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M16 16l4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <input
        id="sw-admin-global-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search companies, orders, content..."
        aria-label="Search companies, orders, content"
      />
    </form>
  );
}
