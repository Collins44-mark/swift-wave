"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { LinkPendingFlag } from "@/components/navigation/LinkPendingFlag";

type AdminHubLinkProps = Omit<ComponentProps<typeof Link>, "prefetch"> & {
  prefetch?: boolean;
};

export function AdminHubLink({
  children,
  className = "sw-admin-hub-card",
  prefetch = true,
  ...props
}: AdminHubLinkProps) {
  return (
    <Link className={className} prefetch={prefetch} {...props}>
      <LinkPendingFlag />
      {children}
    </Link>
  );
}
