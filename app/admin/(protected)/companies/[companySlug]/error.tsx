"use client";

import { AdminRouteError } from "@/components/admin/AdminRouteError";

export default function CompanyWorkspaceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AdminRouteError reset={reset} />;
}
