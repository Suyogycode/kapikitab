// src/app/api/admin/r2-presigned/route.ts
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize the S3 Client pointed at Cloudflare's edge
const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, contentType, folder = 'misc' } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'File name and content type are required.' }, 
        { status: 400 }
      );
    }

    // Sanitize the filename and append a timestamp to prevent overwrites
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `${folder}/${Date.now()}-${sanitizedName}`;

    // Define the upload parameters
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileKey,
      ContentType: contentType,
    });

    // Generate the secure presigned URL (The "Ticket")
    // Valid for exactly 5 minutes (300 seconds)
    const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 300 });

    // Construct the final public URL where the asset will be accessible
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_DEV_URL}/${fileKey}`;

    return NextResponse.json({ 
      uploadUrl, 
      publicUrl, 
      key: fileKey 
    }, { status: 200 });

  } catch (error) {
    console.error('R2 Presigner Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate secure upload URL.' }, 
      { status: 500 }
    );
  }
}