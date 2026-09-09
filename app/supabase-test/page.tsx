import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Supabase Test — Swift Wave",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SupabaseTestPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return (
      <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <h1>Supabase connection not configured.</h1>
        <p>Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.</p>
      </main>
    );
  }

  // Initialize the server client (Auth-ready, cookie-based). No DB queries.
  const supabase = await createClient();
  const { error } = await supabase.auth.getUser();

  if (error && error.name !== "AuthSessionMissingError") {
    // Missing session is expected with no logged-in user.
    // Only fail on unexpected client/auth configuration errors.
    const message = error.message || "";
    const isMissingSession =
      message.toLowerCase().includes("session") ||
      message.toLowerCase().includes("auth session missing");

    if (!isMissingSession) {
      return (
        <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
          <h1>Supabase client could not complete auth check.</h1>
          <p>The environment is present, but the auth client returned an unexpected error.</p>
        </main>
      );
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Supabase connection configured.</h1>
      <p>Server client initialized successfully. Auth foundation is ready.</p>
    </main>
  );
}
