import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import Chapter from "@/lib/models/Chapter";

// SAVE OR UPDATE A SINGLE CHAPTER & ITS UNITS
export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectToDatabase();
    
    // Upsert: Find by chapterId. If it exists, update it. If not, create it.
    const chapter = await Chapter.findOneAndUpdate(
      { chapterId: data.chapterId },
      { $set: data },
      { new: true, upsert: true } 
    );
    
    return NextResponse.json(chapter, { status: 200 });
  } catch (error: any) {
    console.error("Chapter POST error:", error);
    return NextResponse.json({ error: "Failed to save chapter schema." }, { status: 500 });
  }
}

// FETCH A SINGLE CHAPTER FOR THE LEVEL 3 WORKSPACE
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("id"); // e.g., ?id=ch-c11-phy-03
    
    if (!chapterId) {
      return NextResponse.json({ error: "Missing chapterId parameter." }, { status: 400 });
    }

    await connectToDatabase();
    const chapter = await Chapter.findOne({ chapterId }).lean();
    
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found." }, { status: 404 });
    }
    
    return NextResponse.json(chapter, { status: 200 });
  } catch (error: any) {
    console.error("Chapter GET error:", error);
    return NextResponse.json({ error: "Database routing error." }, { status: 500 });
  }
}