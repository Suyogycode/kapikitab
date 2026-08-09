import { NextResponse } from "next/server";
import database from "@/lib/database";
import Asset from "@/lib/models/Asset";

// Endpoint for the Mac Mini daemon to poll for unprocessed videos
export async function GET() {
  try {
    await database();
    const pendingAssets = await Asset.find({
      type: "video_lecture",
      "content.status": "processing"
    });

    return NextResponse.json(pendingAssets);
  } catch (error) {
    console.error("Failed to fetch pending videos:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}