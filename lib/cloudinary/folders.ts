/**
 * Swift Wave Cloudinary isolation — client-safe helpers (no secrets).
 *
 * ALL application uploads MUST live under the swift-wave/ root.
 * Never upload into unrelated Cloudinary folders from other projects.
 */

export const SWIFT_WAVE_CLOUDINARY_ROOT = "swift-wave";

/** Allowed second-level segments under swift-wave/ */
export const SWIFT_WAVE_FOLDER_SEGMENTS = [
  "corporate",
  "scholarship",
  "freight",
  "outfit",
  "medical",
  "travels",
  "catering",
] as const;

export type SwiftWaveFolderSegment =
  (typeof SWIFT_WAVE_FOLDER_SEGMENTS)[number];

const SEGMENT_SET = new Set<string>(SWIFT_WAVE_FOLDER_SEGMENTS);

/**
 * Map authenticated company slug → isolated Cloudinary folder.
 * Throws if the slug is not a known Swift Wave segment.
 */
export function cloudinaryFolderForSlug(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  if (!SEGMENT_SET.has(normalized)) {
    throw new Error("Invalid Swift Wave media folder.");
  }
  return `${SWIFT_WAVE_CLOUDINARY_ROOT}/${normalized}`;
}

/** True only for exact swift-wave/{allowed-segment} paths. */
export function isAllowedSwiftWaveFolder(folder: string | undefined | null): boolean {
  if (!folder) return false;
  const normalized = folder.replace(/\/+$/, "").toLowerCase();
  const match = normalized.match(/^swift-wave\/([a-z0-9-]+)$/);
  if (!match) return false;
  return SEGMENT_SET.has(match[1]);
}

export function slugFromCloudinaryFolder(
  folder: string | undefined | null
): string | null {
  if (!folder) return null;
  const normalized = folder.replace(/\/+$/, "").toLowerCase();
  const match = normalized.match(/^swift-wave\/([a-z0-9-]+)$/);
  if (!match || !SEGMENT_SET.has(match[1])) return null;
  return match[1];
}

/** public_id must live under the company folder (Cloudinary creates folders on upload). */
export function publicIdBelongsToFolder(
  publicId: string,
  folder: string
): boolean {
  const prefix = folder.replace(/\/+$/, "");
  return publicId === prefix || publicId.startsWith(`${prefix}/`);
}
