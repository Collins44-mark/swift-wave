"use client";

import { Suspense } from "react";
import { AdminToastFromParams } from "@/components/admin/AdminToast";

export function InquiriesPageToasts() {
  return (
    <Suspense fallback={null}>
      <AdminToastFromParams />
    </Suspense>
  );
}
