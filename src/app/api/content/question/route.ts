import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import Question from "@/lib/models/Question";

// ==========================================
// CREATE OR UPDATE A QUESTION (POST)
// ==========================================
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

// ==========================================
// FETCH QUESTIONS FOR A SPECIFIC CHAPTER (GET)
// ==========================================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");
    
    await connectToDatabase();

    // If chapterId is provided, filter by it. Otherwise, return all questions.
    const filter = chapterId ? { chapterId } : {};
    const questions = await Question.find(filter).lean();
    
    return NextResponse.json(questions, { status: 200 });
  } catch (error: any) {
    console.error("Question GET error:", error);
    return NextResponse.json({ error: "Database routing error." }, { status: 500 });
  }
}

// ==========================================
// UPDATE AN EXISTING QUESTION (PUT)
// ==========================================
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { questionId, _id, text, options, correctAnswers, explanation, type } = body;

    const filter = questionId ? { questionId } : (_id ? { _id } : null);

    if (!filter) {
      return NextResponse.json({ message: "Question identifier missing" }, { status: 400 });
    }

    const updated = await Question.findOneAndUpdate(
      filter,
      {
        $set: {
          text,
          options,
          correctAnswers,
          explanation,
          ...(type && { type }),
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Failed to update question:", error);
    return NextResponse.json({ message: error.message || "Error updating question" }, { status: 500 });
  }
}

// ==========================================
// DELETE A QUESTION (DELETE)
// ==========================================
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: "Question ID is required" }, { status: 400 });
    }

    // Supports deleting by either custom questionId or MongoDB _id
    const deleted = await Question.findOneAndDelete({
      $or: [
        { questionId: id }, 
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
      ]
    });

    if (!deleted) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Question deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to delete question:", error);
    return NextResponse.json({ message: error.message || "Error deleting question" }, { status: 500 });
  }
}