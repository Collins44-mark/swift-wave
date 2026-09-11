"use client";

import {
  CldUploadWidget,
  type CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { useMemo, useState } from "react";
import { saveUploadedMedia } from "@/lib/admin/client-actions";
import type { CloudinaryUploadInfo } from "@/lib/admin/types-media";
import { cloudinaryFolderForSlug } from "@/lib/cloudinary/folders";
import { isCloudinaryConfigured } from "@/lib/cloudinary/client-config";

type Props = {
  companySlug: string;
  label?: string;
  onSaved?: (asset: {
    id?: string;
    secure_url: string;
    public_id: string;
  }) => void;
  onBusyChange?: (busy: boolean) => void;
  className?: string;
};

function extractInfo(
  results: CloudinaryUploadWidgetResults
): CloudinaryUploadInfo | null {
  const info = results.info;
  if (!info || typeof info === "string") return null;
  if (!("secure_url" in info) || !("public_id" in info)) return null;
  return {
    public_id: String(info.public_id),
    secure_url: String(info.secure_url),
    resource_type: info.resource_type ? String(info.resource_type) : "image",
    format: info.format ? String(info.format) : undefined,
    width: typeof info.width === "number" ? info.width : undefined,
    height: typeof info.height === "number" ? info.height : undefined,
    bytes: typeof info.bytes === "number" ? info.bytes : undefined,
    original_filename: info.original_filename
      ? String(info.original_filename)
      : undefined,
    folder: info.folder ? String(info.folder) : undefined,
  };
}

/**
 * Admin upload control. Folder is not user-configurable —
 * it is fixed to swift-wave/{companySlug} and re-enforced by the sign API.
 */
export function MediaUploadButton({
  companySlug,
  label = "Upload Image",
  onSaved,
  onBusyChange,
  className,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const folder = useMemo(
    () => cloudinaryFolderForSlug(companySlug),
    [companySlug]
  );

  const signatureEndpoint = useMemo(
    () =>
      `/api/cloudinary/sign?companySlug=${encodeURIComponent(companySlug)}`,
    [companySlug]
  );

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!isCloudinaryConfigured()) {
    return (
      <div className="sw-admin-upload-wrap">
        <button type="button" className={className || "sw-admin-btn"} disabled>
          + {label}
        </button>
        <p className="sw-admin-upload-error" role="status">
          Image uploads are not available in this environment yet.
        </p>
      </div>
    );
  }

  return (
    <div className="sw-admin-upload-wrap">
      <CldUploadWidget
        signatureEndpoint={signatureEndpoint}
        {...(uploadPreset ? { uploadPreset } : {})}
        options={{
          sources: ["local"],
          multiple: false,
          maxFiles: 1,
          folder,
          resourceType: "image",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
          maxFileSize: 8_000_000,
          cropping: false,
          showAdvancedOptions: false,
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#E2E8F0",
              tabIcon: "#0B2E6D",
              menuIcons: "#0B2E6D",
              textDark: "#081F4D",
              textLight: "#FFFFFF",
              link: "#0B2E6D",
              action: "#0B2E6D",
              inactiveTabIcon: "#64748B",
              error: "#991B1B",
              inProgress: "#D4AF37",
              complete: "#166534",
              sourceBg: "#F8FAFC",
            },
          },
        }}
        onSuccess={(results) => {
          const info = extractInfo(results);
          if (!info) {
            setError("Image upload failed. Please try again.");
            return;
          }
          setError(null);
          setPending(true);
          onBusyChange?.(true);
          setMessage("Uploading…");
          onSaved?.({
            secure_url: info.secure_url,
            public_id: info.public_id,
          });
          void (async () => {
            try {
              const result = await saveUploadedMedia(companySlug, info);
              if (!result.ok) {
                setMessage(null);
                setError(result.error || "Couldn't save the image. Please try again.");
                return;
              }
              setMessage("Image selected. Save the product to persist it.");
              onSaved?.({
                id: result.id,
                secure_url: info.secure_url,
                public_id: info.public_id,
              });
            } catch {
              setMessage(null);
              setError("Couldn't save the image. Please try again.");
            } finally {
              setPending(false);
              onBusyChange?.(false);
            }
          })();
        }}
        onError={() => {
          setPending(false);
          onBusyChange?.(false);
          setMessage(null);
          setError("Image upload failed. Please try again.");
        }}
      >
        {({ open }) => (
          <button
            type="button"
            className={className || "sw-admin-btn"}
            disabled={pending}
            onClick={() => {
              setError(null);
              setMessage(null);
              open();
            }}
          >
            {pending ? "Uploading…" : `+ ${label}`}
          </button>
        )}
      </CldUploadWidget>
      {message ? (
        <p className="sw-admin-upload-status" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="sw-admin-upload-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
