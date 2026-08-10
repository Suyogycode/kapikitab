import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import Asset from "@/lib/models/Asset";
import { r2 } from "@/lib/r2-client";
import { DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

// CREATE OR UPDATE AN ASSET
export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectToDatabase();
    
    // Upsert: Find by assetId. Update if it exists, create if it doesn't.
    const asset = await Asset.findOneAndUpdate(
      { assetId: data.assetId },
      { $set: data },
      { new: true, upsert: true } 
    );
    
    return NextResponse.json(asset, { status: 200 });
  } catch (error: any) {
    console.error("Asset POST error:", error);
    return NextResponse.json(
      { error: "Failed to save the asset to the database." }, 
      { status: 500 }
    );
  }
}

// FETCH ASSETS FOR A SPECIFIC CHAPTER
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");
    
    if (!chapterId) {
      return NextResponse.json({ error: "Missing chapterId parameter." }, { status: 400 });
    }

    await connectToDatabase();
    
    // Fetch all assets mapped to this chapter, sorted by their order
    const assets = await Asset.find({ chapterId }).sort({ order: 1 }).lean();
    
    return NextResponse.json(assets, { status: 200 });
  } catch (error: any) {
    console.error("Asset GET error:", error);
    return NextResponse.json({ error: "Database routing error." }, { status: 500 });
  }
}

// SECURELY DELETE AN ASSET (FROM MONGODB & CLOUDFLARE R2)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get("id");
    
    if (!assetId) {
      return NextResponse.json({ error: "Missing assetId parameter." }, { status: 400 });
    }

    await connectToDatabase();
    
    // 1. Find the asset first so we know what needs to be deleted from R2
    const asset = await Asset.findOne({ assetId });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found in database." }, { status: 404 });
    }

    // 2. Cloudflare R2 Cleanup Logic
    if (asset.type === 'video_lecture') {
      // Videos are stored in HLS directories containing multiple chunks.
      // We must list all objects in that specific directory and batch delete them.
      const prefix = `videos/hls/${assetId}/`;
      
      const listedObjects = await r2.send(new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        Prefix: prefix
      }));

      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        const deleteParams = {
          Bucket: process.env.R2_BUCKET_NAME,
          Delete: {
            Objects: listedObjects.Contents.map((obj) => ({ Key: obj.Key }))
          }
        };
        await r2.send(new DeleteObjectsCommand(deleteParams));
      }

      // Also clean up the raw staging video if it got stuck during processing
      if (asset.content?.stagingKey) {
        await r2.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: asset.content.stagingKey
        })).catch(() => console.log("No staging file to clean up."));
      }

    } else if (asset.type === 'pdf_document' || asset.type === 'diagram') {
      // PDFs and Diagrams are single files. We extract the file key from the URL.
      const urlString = typeof asset.content === 'string' ? asset.content : asset.content?.url;
      if (urlString && !urlString.includes('youtube.com')) {
        try {
          const urlObj = new URL(urlString);
          // Remove the leading slash from the pathname to get the exact R2 key
          const r2Key = urlObj.pathname.substring(1); 
          
          await r2.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: r2Key
          }));
        } catch (err) {
          console.error("Failed to parse or delete single file from R2:", err);
        }
      }
    }

    // 3. Wipe the record from MongoDB
    await Asset.findOneAndDelete({ assetId });

    return NextResponse.json({ success: true, message: "Asset and associated files annihilated." }, { status: 200 });

  } catch (error: any) {
    console.error("Asset DELETE error:", error);
    return NextResponse.json({ error: "Failed to process deletion." }, { status: 500 });
  }
}