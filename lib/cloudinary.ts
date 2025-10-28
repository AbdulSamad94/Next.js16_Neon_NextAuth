import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload base64 image to Cloudinary
 * @param base64Image - Base64 encoded image string (with data URI prefix)
 * @param mimeType - Image MIME type (e.g., 'image/jpeg')
 * @returns Secure URL of uploaded image
 */
export async function uploadImageToCloudinary(
    base64Image: string,
    mimeType: string
): Promise<string> {
    try {
        // Validate base64 format
        if (!base64Image.startsWith("data:")) {
            throw new Error("Invalid base64 image format");
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(mimeType)) {
            throw new Error("Invalid image type. Only JPEG, PNG, WebP, and GIF are allowed");
        }

        // Upload to Cloudinary with optimizations
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: "bloghub/covers",
            resource_type: "image",
            transformation: [
                { width: 1200, height: 630, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" },
            ],
        });

        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error(
            error instanceof Error ? error.message : "Failed to upload image to Cloudinary"
        );
    }
}

export default cloudinary;