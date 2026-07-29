// src/app/api/admin/r2-presigned/route.ts
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize the S3 Client pointed at Cloudflare's edge
const S3 = new S3Client({
  region: 'auto',
  // FIXED: Now matches your .env file exactly (R2_ACCOUNT_ID)
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, 
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

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `${folder}/${Date.now()}-${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 300 });
    
    // FIXED: Now matches your .env file exactly (R2_PUBLIC_DOMAIN)
    const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${fileKey}`;

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