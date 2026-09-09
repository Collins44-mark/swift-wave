import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";
import { legacyMetadata } from "@/lib/legacy-page";

export const metadata: Metadata = legacyMetadata("medical");

export default function MedicalPage() {
  return <LegacyPage slug="medical" />;
}
