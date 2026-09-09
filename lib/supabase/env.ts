/**
 * Supabase environment resolution for Swift Wave.
 *
 * Server code prefers non-NEXT_PUBLIC variables so Vercel can supply
 * credentials at runtime without requiring a rebuild. Client code still
 * relies on NEXT_PUBLIC_* values baked in at build time.
 */

function trim(value: string | undefined): string {
  return value?.trim() ?? "";
}

/** Server-side URL (runtime on Vercel when SUPABASE_URL is set). */
export function getSupabaseUrl(): string {
  return (
    trim(process.env.SUPABASE_URL) ||
    trim(process.env.NEXT_PUBLIC_SUPABASE_URL)
  );
}

/** Server-side publishable/anon key (runtime on Vercel when set). */
export function getSupabasePublishableKey(): string {
  return (
    trim(process.env.SUPABASE_PUBLISHABLE_KEY) ||
    trim(process.env.SUPABASE_ANON_KEY) ||
    trim(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    trim(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

/** Browser bundle — NEXT_PUBLIC_* only (inlined at build time). */
export function getSupabaseBrowserConfig(): { url: string; key: string } {
  return {
    url: trim(process.env.NEXT_PUBLIC_SUPABASE_URL),
    key:
      trim(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
      trim(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseBrowserConfig();
  if (url && key) return true;
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export function getSupabaseServerConfig(): { url: string; key: string } {
  return {
    url: getSupabaseUrl(),
    key: getSupabasePublishableKey(),
  };
}

export type SupabaseEnvStatus = {
  url: boolean;
  publishableKey: boolean;
  serviceRoleKey: boolean;
  cloudinaryCloudName: boolean;
  cloudinaryApiKey: boolean;
  cloudinaryApiSecret: boolean;
};

/** Presence-only audit for deployment checks (never returns secret values). */
export function getSupabaseEnvStatus(): SupabaseEnvStatus {
  return {
    url: Boolean(getSupabaseUrl()),
    publishableKey: Boolean(getSupabasePublishableKey()),
    serviceRoleKey: Boolean(trim(process.env.SUPABASE_SERVICE_ROLE_KEY)),
    cloudinaryCloudName: Boolean(
      trim(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
    ),
    cloudinaryApiKey: Boolean(trim(process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY)),
    cloudinaryApiSecret: Boolean(trim(process.env.CLOUDINARY_API_SECRET)),
  };
}
