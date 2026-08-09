import { NextResponse } from "next/server";
import { r2 } from "@/lib/r2-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'video', 'image', or 'pdf'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timeStamp = Date.now();

    // ==========================================
    // ROUTE 1: RAW MP4 VIDEOS GO TO R2 STAGING
    // ==========================================
    if (type === 'video') {
      const stagingKey = `raw-staging/${timeStamp}-${sanitizedName}`;

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: stagingKey,
        ContentType: file.type || 'video/mp4',
      });

      // 5-minute expiry for raw video upload
      const signedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
      const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${stagingKey}`;

      return NextResponse.json({
        isPresigned: true,
        uploadUrl: signedUrl,
        stagingKey: stagingKey,
        url: publicUrl,
        message: "Presigned upload URL generated for raw video staging."
      });
    }

    // ==========================================
    // ROUTE 2: IMAGES & PDFS GO TO R2 PUBLIC FOLDER
    // ==========================================
    if (type === 'image' || type === 'pdf') {
      const folder = type === 'image' ? 'images' : 'pdfs';
      const fileKey = `${folder}/${timeStamp}-${sanitizedName}`;

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileKey,
        ContentType: file.type,
      });

      const signedUrl = await getSignedUrl(r2, command, { expiresIn: 120 });
      const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${fileKey}`;

      return NextResponse.json({
        isPresigned: true,
        uploadUrl: signedUrl,
        url: publicUrl,
        key: fileKey
      });
    }

    return NextResponse.json({ error: "Unknown file type request" }, { status: 400 });

  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: "Failed to generate presigned upload URL" }, { status: 500 });
  }
}