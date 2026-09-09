/** Client-safe Cloudinary configuration checks (no secrets). */

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY?.trim()
  );
}
