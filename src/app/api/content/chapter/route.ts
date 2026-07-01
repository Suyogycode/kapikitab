import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import Chapter from "@/lib/models/Chapter";

// SAVE OR UPDATE A CHAPTER
export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectToDatabase();
    
    // Find a chapter by ID, update it, or create it if it doesn't exist yet
    const chapter = await Chapter.findOneAndUpdate(
      { chapterId: data.chapterId },
      { $set: data },
      { returnDocument: 'after', upsert: true } 
    );
    
    return NextResponse.json(chapter, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// FETCH A CHAPTER FOR THE UI
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("id"); // e.g., ?id=coordinate-geometry
    
    await connectToDatabase();
    const chapter = await Chapter.findOne({ chapterId });
    
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    
    return NextResponse.json(chapter, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}