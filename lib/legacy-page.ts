import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import manifest from "@/content/manifest.json";

export type LegacyPageMeta = (typeof manifest)[number];

export function getLegacyPage(slug: string): LegacyPageMeta {
  const page = manifest.find((entry) => entry.slug === slug);
  if (!page) throw new Error(`Unknown legacy page: ${slug}`);
  return page;
}

export function readLegacyHtml(slug: string): string {
  const filePath = path.join(process.cwd(), "content", `${slug}.html`);
  return fs.readFileSync(filePath, "utf8");
}

export function legacyMetadata(slug: string): Metadata {
  const page = getLegacyPage(slug);
  return {
    title: page.title,
    description: page.description ?? undefined,
    robots: page.robots ? { index: false, follow: false } : undefined,
    icons: {
      icon: "/assets/images/logo.png",
    },
  };
}
