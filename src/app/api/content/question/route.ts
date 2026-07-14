import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import Question from "@/lib/models/Question";

// CREATE OR UPDATE A QUESTION
export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectToDatabase();
    
    const question = await Question.findOneAndUpdate(
      { questionId: data.questionId },
      { $set: data },
      { new: true, upsert: true } 
    );
    
    return NextResponse.json(question, { status: 200 });
  } catch (error: any) {
    console.error("Question POST error:", error);
    return NextResponse.json(
      { error: "Failed to save the practice question." }, 
      { status: 500 }
    );
  }
}

// FETCH QUESTIONS FOR A SPECIFIC CHAPTER
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");
    
    if (!chapterId) {
      return NextResponse.json({ error: "Missing chapterId parameter." }, { status: 400 });
    }

    await connectToDatabase();
    
    const questions = await Question.find({ chapterId }).lean();
    
    return NextResponse.json(questions, { status: 200 });
  } catch (error: any) {
    console.error("Question GET error:", error);
    return NextResponse.json({ error: "Database routing error." }, { status: 500 });
  }
}