import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";
import { legacyMetadata } from "@/lib/legacy-page";

export const metadata: Metadata = legacyMetadata("companies");

export default function CompaniesPage() {
  return <LegacyPage slug="companies" />;
}
