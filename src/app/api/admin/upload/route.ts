import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // 1. Authenticate Admin
    const session = await auth();
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Multipart Form
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 3. Validate File Type & Size (Max 2MB)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type must be JPG, PNG, or WEBP" }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 2 MB size limit" }, { status: 400 });
    }

    // 4. Generate unique filename and upload to Vercel Blob
    const ext = path.extname(file.name).toLowerCase() || ".png";
    const filename = `uploads/media-${crypto.randomUUID()}${ext}`;

    const blob = await put(filename, file, { access: "public" });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Admin upload API error:", err);
    return NextResponse.json({ error: "Internal server error during upload" }, { status: 500 });
  }
}
