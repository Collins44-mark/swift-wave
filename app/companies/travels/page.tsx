import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";
import { legacyMetadata } from "@/lib/legacy-page";

export const metadata: Metadata = legacyMetadata("travels");

export default function TravelsPage() {
  return <LegacyPage slug="travels" />;
}
