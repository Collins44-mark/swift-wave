import { redirect } from "next/navigation";

/** Media is managed contextually in product/content editors — no global library page. */
export default function MediaPage() {
  redirect("/admin/dashboard");
}
