import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import Asset from "@/lib/models/Asset";

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