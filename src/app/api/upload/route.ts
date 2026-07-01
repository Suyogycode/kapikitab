import { NextResponse } from "next/server";
import { r2 } from "@/lib/r2-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // Will be 'image' or 'video'

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
      
      // We ask Bunny to create an empty video slot first
      const bunnyRes = await fetch(`https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`, options);
      const videoData = await bunnyRes.json();
      
      // Return the ID so the frontend can stream the heavy file directly to Bunny!
      return NextResponse.json({ videoId: videoData.guid, message: "Upload slot created" });
    }

    // ROUTE 2: IMAGES & PDFS GO TO CLOUDFLARE R2
    if (type === 'image') {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      // Send the file to your bucket
      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      }));

      // Generate the public URL to save in MongoDB
      const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;
      return NextResponse.json({ url: publicUrl });
    }

    return NextResponse.json({ error: "Unknown file type" }, { status: 400 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process media" }, { status: 500 });
  }
}