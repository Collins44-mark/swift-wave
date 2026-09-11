import { after } from "next/server";
import { revalidatePath } from "next/cache";

/** Invalidate public routes after the mutation response is sent. */
export function revalidatePublicLater(paths: string[]) {
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return;
  after(() => {
    for (const path of unique) {
      revalidatePath(path);
    }
  });
}
