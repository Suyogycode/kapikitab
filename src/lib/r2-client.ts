import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto", // Required by SDK, but Cloudflare routes automatically
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});