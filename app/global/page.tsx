import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";
import { legacyMetadata } from "@/lib/legacy-page";

export const metadata: Metadata = legacyMetadata("global");

export default function GlobalPage() {
  return <LegacyPage slug="global" />;
}
