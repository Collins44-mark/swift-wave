import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";
import { legacyMetadata } from "@/lib/legacy-page";

export const metadata: Metadata = legacyMetadata("outfit");

export default function OutfitPage() {
  return <LegacyPage slug="outfit" />;
}
