import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";
import { legacyMetadata } from "@/lib/legacy-page";

export const metadata: Metadata = legacyMetadata("freight");

export default function FreightPage() {
  return <LegacyPage slug="freight" />;
}
