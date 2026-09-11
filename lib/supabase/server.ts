import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseServerConfig } from "@/lib/supabase/env";

export { isSupabaseConfigured } from "@/lib/supabase/env";

/** One Supabase client per request so mutations do not repeat auth cookie/JWT setup. */
export const createClient = cache(async () => {
  const { url, key } = getSupabaseServerConfig();

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or server-side SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY)."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore when
          // middleware is refreshing sessions.
        }
      },
    },
  });
});
