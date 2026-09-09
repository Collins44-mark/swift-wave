"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ComingSoonRedirectProps = {
  to: string;
  delayMs?: number;
};

export function ComingSoonRedirect({
  to,
  delayMs = 2000,
}: ComingSoonRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.push(to);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [router, to, delayMs]);

  return null;
}
