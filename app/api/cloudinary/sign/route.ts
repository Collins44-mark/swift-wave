import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/get-current-admin";
import { getAccessibleCompanyBySlug } from "@/lib/admin/companies";
import {
  cloudinaryFolderForSlug,
  configureCloudinary,
  isAllowedSwiftWaveFolder,
} from "@/lib/cloudinary/server";

/**
 * Signed Cloudinary upload signature endpoint.
 *
 * Folder is NEVER taken from the browser as authority.
 * It is derived server-side from ?companySlug= after auth + access checks,
 * then forced into paramsToSign before signing.
 *
 * All uploads are constrained to swift-wave/{company}/.
 */
export async function POST(request: Request) {
  try {
    const access = await getCurrentAdmin();
    if (!access.ok) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    if (
      access.admin.profile.role !== "super_admin" &&
      access.admin.profile.role !== "company_admin"
    ) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const companySlug = (url.searchParams.get("companySlug") || "")
      .trim()
      .toLowerCase();

    if (!companySlug) {
      return NextResponse.json(
        { error: "company_slug_required" },
        { status: 400 }
      );
    }

    // Derive folder ONLY from authenticated company context — never trust body.folder
    let derivedFolder: string;
    try {
      derivedFolder = cloudinaryFolderForSlug(companySlug);
    } catch {
      return NextResponse.json({ error: "invalid_company" }, { status: 400 });
    }

    if (!isAllowedSwiftWaveFolder(derivedFolder)) {
      return NextResponse.json({ error: "invalid_folder" }, { status: 400 });
    }

    const { company, error } = await getAccessibleCompanyBySlug(
      access.admin,
      companySlug
    );
    if (error || !company) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // Defense in depth: folder segment must match the authorized company slug
    if (derivedFolder !== `swift-wave/${company.slug}`) {
      return NextResponse.json({ error: "folder_mismatch" }, { status: 403 });
    }

    const body = await request.json();
    const paramsToSign = {
      ...((body?.paramsToSign ?? {}) as Record<string, string>),
    };

    // Force Swift Wave isolation path — ignore any client-supplied folder
    paramsToSign.folder = derivedFolder;

    // Reject attempts to target paths outside our root via public_id prefix tricks
    if (
      typeof paramsToSign.public_id === "string" &&
      paramsToSign.public_id.includes("/") &&
      !paramsToSign.public_id.startsWith(`${derivedFolder}/`)
    ) {
      return NextResponse.json({ error: "invalid_public_id" }, { status: 400 });
    }

    const cloudinary = configureCloudinary();
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp: paramsToSign.timestamp,
      apiKey:
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
        process.env.CLOUDINARY_API_KEY,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "sign_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
