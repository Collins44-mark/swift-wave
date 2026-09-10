"use client";

import { useLinkStatus } from "next/link";

/** Hidden flag so parent Links can style a pending/active click via :has(). */
export function LinkPendingFlag() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <span className="sw-link-pending" aria-hidden="true" />;
}
