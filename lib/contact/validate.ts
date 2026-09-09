export function validateContactField(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 3 || trimmed.length > 120) {
    return false;
  }

  const emailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  const digitCount = trimmed.replace(/\D/g, "").length;
  const phoneLike = digitCount >= 9 && digitCount <= 15;

  return emailLike || phoneLike;
}

export function contactKind(value: string): "email" | "phone" {
  const trimmed = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "email";
  }
  return "phone";
}

export const SUBJECT_LABELS: Record<string, string> = {
  general: "General Inquiry",
  partnership: "Partnership",
  careers: "Careers",
  freight: "Freight Services",
  scholarship: "Scholarship",
};

export function resolveContactCompanySlug(subject: string): string {
  switch (subject) {
    case "freight":
      return "freight";
    case "scholarship":
      return "scholarship";
    default:
      return "corporate";
  }
}
