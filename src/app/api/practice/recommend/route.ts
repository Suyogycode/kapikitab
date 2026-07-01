import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import Chapter from "@/lib/models/Chapter";

// Forces Next.js not to cache this route so the user gets fresh questions every time
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // The Aggregation Pipeline
    const recommendedQuestions = await Chapter.aggregate([
      // 1. Deconstruct the chapters so every single question becomes its own document
      { $unwind: "$zones.practice.questions" },
      // 2. Randomly sample exactly 10 questions from the massive global pool
      { $sample: { size: 10 } },
      // 3. Reshape the output to be clean and easy for our frontend to map
      { 
        $project: {
          _id: 0,
          subject: 1,
          chapterTitle: "$title",
          questionText: "$zones.practice.questions.questionText",
          options: "$zones.practice.questions.options",
          correctAnswer: "$zones.practice.questions.correctAnswer"
        }
      }
    ]);

    return NextResponse.json(recommendedQuestions, { status: 200 });
  } catch (error) {
    console.error("Aggregation Error:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}