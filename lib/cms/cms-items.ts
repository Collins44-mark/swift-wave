export type CmsListItem = {
  id: string;
  sort_order: number;
  visible: boolean;
  [key: string]: unknown;
};

export type LeadershipItem = CmsListItem & {
  name: string;
  role: string;
  bio: string;
  image_url: string;
  image_public_id?: string;
};

export type StatItem = CmsListItem & {
  value: string;
  label: string;
};

export function newItemId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function parseItems(raw: unknown): CmsListItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is CmsListItem => item != null && typeof item === "object")
    .map((item, index) => ({
      ...item,
      id: String(item.id ?? newItemId("item")),
      sort_order: Number(item.sort_order ?? index + 1),
      visible: item.visible !== false,
    }))
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function moveItem<T extends CmsListItem>(
  items: T[],
  id: string,
  direction: -1 | 1
): T[] {
  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
  const index = sorted.findIndex((item) => item.id === id);
  if (index < 0) return items;
  const swapIndex = index + direction;
  if (swapIndex < 0 || swapIndex >= sorted.length) return items;
  const next = sorted.map((item, i) => {
    if (i === index) return { ...item, sort_order: swapIndex + 1 };
    if (i === swapIndex) return { ...item, sort_order: index + 1 };
    return { ...item, sort_order: i + 1 };
  });
  return next.sort((a, b) => a.sort_order - b.sort_order);
}
