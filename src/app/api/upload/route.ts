import { NextResponse } from "next/server";
import { r2 } from "@/lib/r2-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'video' or 'image'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ==========================================
    // ROUTE 1: VIDEOS GO TO BUNNY STREAM
    // ==========================================
    if (type === 'video') {
      const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
      const apiKey = process.env.BUNNY_STREAM_API_KEY;
      const cdnHostname = process.env.BUNNY_CDN_HOSTNAME || 'iframe.mediadelivery.net';

      if (!libraryId || !apiKey) {
        return NextResponse.json({ error: "Bunny Stream credentials not configured in environment" }, { status: 500 });
      }

      // 1. Create a video object in Bunny Stream
      const createVideoRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
        method: 'POST',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({ title: file.name })
      });

      if (!createVideoRes.ok) {
        const errText = await createVideoRes.text();
        console.error("Bunny Create Video Error:", errText);
        return NextResponse.json({ error: "Failed to initialize video slot in Bunny Stream" }, { status: 500 });
      }

      const videoData = await createVideoRes.json();
      const videoId = videoData.guid;

      // 2. Stream raw binary file to Bunny Stream slot
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const uploadBinaryRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'application/octet-stream'
        },
        body: fileBuffer
      });

      if (!uploadBinaryRes.ok) {
        const errText = await uploadBinaryRes.text();
        console.error("Bunny Upload Binary Error:", errText);
        return NextResponse.json({ error: "Failed to stream video binary to Bunny" }, { status: 500 });
      }

      // FIX: Generate the correct URLs based on Bunny's architecture
      
      // 1. Direct Play URL (For standard iframe embeds)
      const playUrl = `https://player.mediadelivery.net/play/${libraryId}/${videoId}`;
      
      // 2. HLS Playlist URL (For custom players like Video.js or React Player)
      const hlsUrl = `https://${cdnHostname}/${videoId}/playlist.m3u8`;

      return NextResponse.json({ 
        url: playUrl,     // Defaulting to the iframe player URL
        hlsUrl: hlsUrl,   // Passing HLS back just in case your frontend needs it
        videoId: videoId,
        message: "Video successfully uploaded to Bunny Stream" 
      });
    }

    // ==========================================
    // ROUTE 2: IMAGES & PDFS GO TO CLOUDFLARE R2
    // ==========================================
    if (type === 'image' || type === 'pdf') {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        ContentType: file.type,
      });

      const signedUrl = await getSignedUrl(r2, command, { expiresIn: 60 });
      const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;

      return NextResponse.json({
        isPresigned: true,
        uploadUrl: signedUrl,
        url: publicUrl
      });
    }

    return NextResponse.json({ error: "Unknown file type request" }, { status: 400 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process media resource" }, { status: 500 });
  }
}