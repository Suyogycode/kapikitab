import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import Chapter from "@/lib/models/Chapter";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");

    // Build a dynamic query object
    const query: any = {};
    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;

    await connectToDatabase();
    
    // Fetch chapters based on the dynamic query
    const chapters = await Chapter.find(query).lean();
    
    return NextResponse.json(chapters, { status: 200 });

  } catch (error) {
    console.error("Database routing error:", error);
    return NextResponse.json(
      { error: "Failed to fetch curriculum chapters from the database." }, 
      { status: 500 }
    );
  }
}