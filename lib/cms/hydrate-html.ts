import type { CmsPageContent } from "@/lib/cms/types";
import { optimizeHeroImageUrl } from "@/lib/cms/hero-image-url";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function flattenPageContent(page: CmsPageContent): Record<string, unknown> {
  const flat: Record<string, unknown> = {};
  for (const [sectionKey, section] of Object.entries(page)) {
    const content = section.content ?? {};
    for (const [field, value] of Object.entries(content)) {
      flat[`${sectionKey}.${field}`] = value;
    }
  }
  return flat;
}

function replaceCmsText(
  html: string,
  cmsKey: string,
  value: string,
  mode: "text" | "html"
): string {
  const key = cmsKey.replace(/\./g, "\\.");
  const re = new RegExp(
    `(<[^>]*\\bdata-cms="${key}"[^>]*>)([\\s\\S]*?)(<\\/[^>]+>)`,
    "g"
  );
  const replacement = mode === "html" ? value : escapeHtml(value);
  return html.replace(re, `$1${replacement}$3`);
}

function replaceCmsAttr(
  html: string,
  cmsKey: string,
  attr: string,
  value: string
): string {
  const key = cmsKey.replace(/\./g, "\\.");
  const re = new RegExp(
    `(<[^>]*\\bdata-cms-attr="${attr.replace(/:/g, "\\:")}"[^>]*\\bdata-cms="${key}"[^>]*)(>)`,
    "g"
  );
  return html.replace(re, (_, open, close) => {
    let tag = open as string;
    if (attr === "style:background-image") {
      const styleVal = `background-image:url('${value.replace(/'/g, "%27")}')`;
      if (/\bstyle="/.test(tag)) {
        tag = tag.replace(/\bstyle="[^"]*"/, `style="${styleVal}"`);
      } else {
        tag += ` style="${styleVal}"`;
      }
    } else if (attr === "href") {
      if (/\bhref="/.test(tag)) {
        tag = tag.replace(/\bhref="[^"]*"/, `href="${escapeHtml(value)}"`);
      } else {
        tag += ` href="${escapeHtml(value)}"`;
      }
    }
    return tag + close;
  });
}

function replaceCmsBg(html: string, cmsKey: string, url: string): string {
  const key = cmsKey.replace(/\./g, "\\.");
  const re = new RegExp(
    `(<[^>]*\\bdata-cms-bg="${key}"[^>]*)(>)`,
    "g"
  );
  const styleVal = `background-image:url('${url.replace(/'/g, "%27")}')`;
  return html.replace(re, (_, open, close) => {
    let tag = open as string;
    if (/\bstyle="/.test(tag)) {
      tag = tag.replace(/\bstyle="[^"]*"/, `style="${styleVal}"`);
    } else {
      tag += ` style="${styleVal}"`;
    }
    return tag + close;
  });
}

function resolveHeroBackgroundUrl(flat: Record<string, unknown>): string | null {
  const imageUrl = flat["hero.image_url"];
  if (typeof imageUrl === "string" && imageUrl) {
    return optimizeHeroImageUrl(imageUrl);
  }

  const slides = flat["hero.slides"];
  if (Array.isArray(slides) && slides.length) {
    const first = slides[0];
    if (typeof first === "string" && first) {
      return optimizeHeroImageUrl(first);
    }
  }

  return null;
}

function statTarget(value: unknown): string {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits || "0";
}

function hydrateStatsGrid(
  html: string,
  items: Array<Record<string, unknown>>
): string {
  const visible = items
    .filter((i) => i.visible !== false)
    .sort(
      (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
    );

  const cards = visible
    .map((item) => {
      const value = statTarget(item.value);
      return `<div class="glass-white p-4 sm:p-5 text-center" data-cms-generated="true">
              <div class="stat-counter text-2xl sm:text-3xl font-bold" data-target="${value}">0</div>
              <p class="text-xs sm:text-sm text-muted mt-1">${escapeHtml(String(item.label ?? ""))}</p>
            </div>`;
    })
    .join("");

  return html.replace(
    /(<div id="stats-section"[^>]*data-cms-list="stats\.items"[^>]*>)([\s\S]*?)(<\/div>)/,
    `$1${cards}$3`
  );
}

function hydrateLeadershipGrid(
  html: string,
  items: Array<Record<string, unknown>>
): string {
  const visible = items
    .filter((i) => i.visible !== false)
    .sort(
      (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
    );

  const cards = visible
    .map((item) => {
      const name = escapeHtml(String(item.name ?? ""));
      const role = escapeHtml(String(item.role ?? ""));
      const bio = escapeHtml(String(item.bio ?? ""));
      const imageUrl = String(item.image_url ?? "");
      const alt = role || name;
      return `<div class="glass-white p-6 text-center" data-cms-generated="true">
            <img src="${imageUrl.replace(/"/g, "%22")}" alt="${alt.replace(/"/g, "&quot;")}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-[rgba(11,46,109,0.12)]" loading="lazy">
            <h3 class="font-bold">${name}</h3>
            <p class="text-sm mt-1" style="color:var(--royal)">${role}</p>
            <p class="text-xs text-muted mt-3 leading-relaxed">${bio}</p>
          </div>`;
    })
    .join("");

  return html.replace(
    /(<div class="grid grid-cols-1 sm:grid-cols-3[^"]*"[^>]*data-cms-list="leadership\.items"[^>]*>)([\s\S]*?)(<\/div>)/,
    `$1${cards}$3`
  );
}

function hydrateValuesGrid(
  html: string,
  items: Array<Record<string, unknown>>
): string {
  const visible = items
    .filter((i) => i.visible !== false)
    .sort(
      (a, b) =>
        Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
    );

  const cards = visible
    .map((item) => {
      const icon = String(item.icon ?? "circle");
      return `<article class="values-card" data-cms-generated="true">
          <span class="values-icon" aria-hidden="true"><i data-lucide="${icon}" class="w-5 h-5"></i></span>
          <h4>${escapeHtml(String(item.title ?? ""))}</h4>
          <p>${escapeHtml(String(item.description ?? ""))}</p>
        </article>`;
    })
    .join("");

  return html.replace(
    /(<div class="values-grid[^"]*"[^>]*data-cms-list="values\.items"[^>]*>)([\s\S]*?)(<\/div>)/,
    `$1${cards}$3`
  );
}

/**
 * Apply published CMS content to legacy HTML via data-cms markers.
 */
export function hydrateLegacyHtml(
  html: string,
  pageContent: CmsPageContent
): string {
  const flat = flattenPageContent(pageContent);
  let out = html;

  // Text / HTML fields
  for (const [key, value] of Object.entries(flat)) {
    if (value == null || typeof value === "object") continue;
    const str = String(value);
    out = replaceCmsText(out, key, str, key.endsWith(".title") && key.startsWith("hero.") ? "html" : "text");
    if (key.startsWith("hero.") && key.endsWith(".title") && key.includes("corporate")) {
      out = replaceCmsText(out, key, str, "html");
    }
  }

  // Hero title on home uses html
  const heroTitle = flat["hero.title"];
  if (typeof heroTitle === "string") {
    out = replaceCmsText(out, "hero.title", heroTitle, "html");
  }

  // Hero background (static single image on homepage + company shop heroes)
  const heroBackground = resolveHeroBackgroundUrl(flat);
  if (heroBackground) {
    out = replaceCmsBg(out, "hero.image_url", heroBackground);
  }

  // Corporate page hero text (about, companies, global, contact)
  for (const field of ["badge", "subtitle"] as const) {
    const v = flat[`hero.${field}`];
    if (typeof v === "string") {
      out = replaceCmsText(out, `hero.${field}`, v, "text");
    }
  }
  const heroSlideTitle = flat["hero.title"];
  if (typeof heroSlideTitle === "string") {
    out = replaceCmsText(out, "hero.title", heroSlideTitle, "text");
  }

  // CTA / link hrefs via data-cms-href="section.field"
  out = out.replace(
    /(<a[^>]*\bdata-cms-href="([^"]+)"[^>]*)(>)/g,
    (_, open, hrefKey, close) => {
      const url = flat[hrefKey as string];
      if (typeof url !== "string") return open + close;
      let tag = open as string;
      if (/\bhref="/.test(tag)) {
        tag = tag.replace(/\bhref="[^"]*"/, `href="${escapeHtml(url)}"`);
      } else {
        tag += ` href="${escapeHtml(url)}"`;
      }
      return tag + close;
    }
  );

  // Values grid
  const valueItems = flat["values.items"];
  if (Array.isArray(valueItems)) {
    out = hydrateValuesGrid(out, valueItems as Array<Record<string, unknown>>);
  }

  // Footer
  const footerDesc = flat["footer.description"];
  if (typeof footerDesc === "string") {
    out = replaceCmsText(out, "footer.description", footerDesc, "text");
  }
  const footerCopy = flat["footer.copyright"];
  if (typeof footerCopy === "string") {
    out = replaceCmsText(out, "footer.copyright", footerCopy, "text");
  }

  // Contact info
  for (const field of ["email", "phone", "address", "hours"] as const) {
    const v = flat[`contact_info.${field}`];
    if (typeof v === "string") {
      out = replaceCmsText(out, `contact_info.${field}`, v, "text");
    }
  }

  // Company hero hint/title/badge/cta
  for (const field of ["badge", "title", "hint", "cta_label"] as const) {
    const v = flat[`hero.${field}`];
    if (typeof v === "string") {
      out = replaceCmsText(out, `hero.${field}`, v, "text");
    }
  }

  // Form intro
  for (const field of ["heading", "description"] as const) {
    const v = flat[`form_intro.${field}`];
    if (typeof v === "string") {
      out = replaceCmsText(out, `form_intro.${field}`, v, "text");
    }
  }

  // Coming soon
  for (const field of ["eyebrow", "title", "body", "cta_label"] as const) {
    const v = flat[`coming_soon.${field}`];
    if (typeof v === "string") {
      out = replaceCmsText(out, `coming_soon.${field}`, v, "text");
    }
  }
  const csUrl = flat["coming_soon.cta_url"];
  if (typeof csUrl === "string") {
    out = replaceCmsAttr(out, "coming_soon.cta_label", "href", csUrl);
  }

  // Global teaser
  for (const field of ["eyebrow", "heading", "legend_hq", "legend_hub", "link_label"] as const) {
    const v = flat[`global_teaser.${field}`];
    if (typeof v === "string") {
      out = replaceCmsText(out, `global_teaser.${field}`, v, "text");
    }
  }

  // About story
  for (const field of ["heading", "paragraph_1", "paragraph_2"] as const) {
    const v = flat[`story.${field}`];
    if (typeof v === "string") {
      out = replaceCmsText(out, `story.${field}`, v, "text");
    }
  }

  // About stats
  const statItems = flat["stats.items"];
  if (Array.isArray(statItems)) {
    out = hydrateStatsGrid(out, statItems as Array<Record<string, unknown>>);
  }

  // About leadership header + principles
  for (const field of [
    "eyebrow",
    "heading",
    "intro",
    "closing_heading",
    "closing_body",
  ] as const) {
    const v = flat[`leadership.${field}`];
    if (typeof v === "string") {
      out = replaceCmsText(out, `leadership.${field}`, v, "text");
    }
  }

  const leaderItems = flat["leadership.items"];
  if (Array.isArray(leaderItems)) {
    out = hydrateLeadershipGrid(
      out,
      leaderItems as Array<Record<string, unknown>>
    );
  }

  return out;
}

export function getContentValue(
  pageContent: CmsPageContent,
  sectionKey: string,
  fieldKey: string
): unknown {
  return pageContent[sectionKey]?.content?.[fieldKey];
}
