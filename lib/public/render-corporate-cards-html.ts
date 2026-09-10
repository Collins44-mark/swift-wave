import type { CorporateCompanyCard } from "@/lib/public/corporate-companies";
import { companySiteHref } from "@/lib/public/company-site-href";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function defaultIcon(slug: string): string {
  const icons: Record<string, string> = {
    scholarship: "graduation-cap",
    freight: "truck",
    outfit: "shirt",
    medical: "heart-pulse",
    travels: "plane",
    catering: "utensils",
  };
  return icons[slug] ?? "building-2";
}

function shortTitle(company: CorporateCompanyCard): string {
  if (company.card_title_short?.trim()) return company.card_title_short.trim();
  return company.name.replace(/^Swift Wave\s+/i, "").trim() || company.name;
}

function renderCard(company: CorporateCompanyCard): string {
  const icon = escapeHtml(company.card_icon?.trim() || defaultIcon(company.slug));
  const fullTitle = escapeHtml(company.name);
  const short = escapeHtml(shortTitle(company));
  const desc = escapeHtml(company.description?.trim() || "");
  const href = escapeHtml(companySiteHref(company));
  const comingSoon = company.card_coming_soon ? " data-coming-soon" : "";
  const imageUrl = escapeHtml(
    company.card_image_url?.trim() ||
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
  );
  const label = escapeHtml(`Explore ${company.name} website`);

  return `<a href="${href}" class="company-card company-card--cover glass-card fade-up"${comingSoon} aria-label="${label}">
          <div class="company-card-media">
            <img src="${imageUrl}" alt="" loading="lazy">
          </div>
          <div class="company-card-body">
            <div class="icon-box company-card-icon"><i data-lucide="${icon}" class="w-4 h-4"></i></div>
            <h3 class="company-card-title"><span class="company-card-title-full">${fullTitle}</span><span class="company-card-title-short">${short}</span></h3>
            <p class="company-card-desc">${desc}</p>
            <span class="company-card-link link-accent">
              Explore <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
            </span>
          </div>
        </a>`;
}

export function renderCorporateCompanyCardsHtml(
  companies: CorporateCompanyCard[]
): string {
  return companies.map(renderCard).join("\n\n        ");
}

export function injectCorporateCompanyCards(
  html: string,
  companies: CorporateCompanyCard[]
): string {
  const cardsHtml = renderCorporateCompanyCardsHtml(companies);
  const replaced = html.replace(
    /<div class="companies-grid"[^>]*>[\s\S]*?<\/div>/,
    `<div class="companies-grid">\n        ${cardsHtml}\n      </div>`
  );
  return replaced === html
    ? html.replace(
        "<!--CORPORATE_COMPANIES_GRID-->",
        `<div class="companies-grid">\n        ${cardsHtml}\n      </div>`
      )
    : replaced;
}
