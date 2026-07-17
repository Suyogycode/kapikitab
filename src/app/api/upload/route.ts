import { NextResponse } from "next/server";
import { r2 } from "@/lib/r2-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // <-- Add this import

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'image' or 'video'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ROUTE 1: VIDEOS GO TO BUNNY STREAM
    if (type === 'video') {
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          AccessKey: process.env.BUNNY_API_KEY as string
        },
        body: JSON.stringify({ title: file.name })
      };
      
      const bunnyRes = await fetch(`https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`, options);
      const videoData = await bunnyRes.json();
      
      return NextResponse.json({ videoId: videoData.guid, message: "Upload slot created" });
    }

    // ROUTE 2: IMAGES & PDFS GO TO CLOUDFLARE R2 (Secure, Scalable Pre-signed Approach)
    if (type === 'image') {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        ContentType: file.type,
      });

      // 1. Generate a secure token valid for 60 seconds to let the frontend upload directly
      const signedUrl = await getSignedUrl(r2, command, { expiresIn: 60 });

        const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;      
        
        
        return NextResponse.json({ 
          isPresigned: true, 
        uploadUrl: signedUrl, 
        url: publicUrl 
      });
    }

    return NextResponse.json({ error: "Unknown file type" }, { status: 400 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process media" }, { status: 500 });
  }
}