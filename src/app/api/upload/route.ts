import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_FOLDERS = ["checkin", "handover"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

// POST /api/upload — server-side signed Cloudinary upload (auth required)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { data, folder } = body as { data?: string; folder?: string };

  if (!data || typeof data !== "string" || !data.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
  }

  const uploadFolder: AllowedFolder = ALLOWED_FOLDERS.includes(folder as AllowedFolder)
    ? (folder as AllowedFolder)
    : "checkin";

  try {
    const result = await cloudinary.uploader.upload(data, {
      folder: `storekeeper/${uploadFolder}`,
      resource_type: "image",
      // Auto-compress and cap resolution for storage efficiency
      transformation: [{ quality: "auto", fetch_format: "auto", width: 1920, crop: "limit" }],
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
