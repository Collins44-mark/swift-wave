import { v2 as cloudinary } from "cloudinary";

export {
  SWIFT_WAVE_CLOUDINARY_ROOT,
  SWIFT_WAVE_FOLDER_SEGMENTS,
  cloudinaryFolderForSlug,
  isAllowedSwiftWaveFolder,
  slugFromCloudinaryFolder,
  publicIdBelongsToFolder,
} from "@/lib/cloudinary/folders";

export function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey =
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  return { cloudName, apiKey, apiSecret };
}

export function configureCloudinary() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return cloudinary;
}
