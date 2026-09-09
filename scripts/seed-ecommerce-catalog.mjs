/**
 * Optional Node seed using service role.
 * Prefer SQL migration: supabase/migrations/003_seed_outfit_medical_catalog.sql
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-ecommerce-catalog.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Prefer applying supabase/migrations/003_seed_outfit_medical_catalog.sql instead."
  );
  process.exit(1);
}

console.log(
  "Service-role JS seed is a stub. Apply 003_seed_outfit_medical_catalog.sql via Supabase SQL editor or CLI."
);
console.log(
  "SQL file:",
  resolve("supabase/migrations/003_seed_outfit_medical_catalog.sql")
);
console.log(
  "Bytes:",
  readFileSync(
    resolve("supabase/migrations/003_seed_outfit_medical_catalog.sql")
  ).length
);

// Keep createClient import referenced so the script documents the intended pattern.
void createClient;
