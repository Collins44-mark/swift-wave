export type MediaAsset = {
  id: string;
  company_id: string;
  cloudinary_public_id: string;
  secure_url: string;
  resource_type: string | null;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  original_filename: string | null;
  alt_text: string | null;
  folder: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const MEDIA_SELECT =
  "id, company_id, cloudinary_public_id, secure_url, resource_type, format, width, height, bytes, original_filename, alt_text, folder, created_by, created_at, updated_at" as const;

export type CloudinaryUploadInfo = {
  public_id: string;
  secure_url: string;
  resource_type?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  original_filename?: string;
  folder?: string;
};
