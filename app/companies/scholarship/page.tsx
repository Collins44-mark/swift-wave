import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";
import { legacyMetadata } from "@/lib/legacy-page";

export const metadata: Metadata = legacyMetadata("scholarship");

export default function ScholarshipPage() {
  return <LegacyPage slug="scholarship" />;
}
