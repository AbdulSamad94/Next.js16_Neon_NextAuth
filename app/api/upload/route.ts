import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed" },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File size too large. Maximum size is 5MB" },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64File, {
            folder: "bloghub/covers",
            resource_type: "image",
            transformation: [
                { width: 1200, height: 630, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" },
            ],
        });

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
        );
    }
}