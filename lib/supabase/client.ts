import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

export function createClient() {
  const { url, key } = getSupabaseBrowserConfig();

  if (!url || !key) {
    throw new Error(
      "Supabase browser client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY before building."
    );
  }

  return createBrowserClient(url, key);
}
