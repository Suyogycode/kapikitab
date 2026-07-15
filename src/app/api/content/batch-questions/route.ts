import { NextRequest, NextResponse } from 'next/server';
import Question from '@/lib/models/Question'; // Adjust path if needed
import connectToDatabase from '@/lib/database'; // Ensure you have your DB connection utility

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { chapterId, unitId, questions } = body;

    if (!chapterId || !unitId || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ message: 'Missing required routing parameters' }, { status: 400 });
    }

    // Map the raw AI JSON into strict Mongoose Schema documents
    const mappedQuestions = questions.map((q: any, index: number) => ({
      questionId: `q-${Date.now()}-${index}`, // Satisfies the unique questionId requirement
      chapterId: chapterId,                   // Satisfies chapterId
      unitId: unitId,                         // Satisfies unitId
      type: q.type || 'mcq_single',           // Matches the updated enum
      text: q.text,
      correctAnswers: q.correctAnswers || [], 
      options: q.options || [],
      // Optional fields from your schema
      explanation: q.explanation || "",
      tolerance: q.tolerance || 0
    }));

    // Perform a high-throughput bulk insert
    await Question.insertMany(mappedQuestions);

    return NextResponse.json({ success: true, insertedCount: mappedQuestions.length });
  } catch (error: any) {
    console.error("Batch Insert Error:", error);
    // Returning the specific Mongoose error message helps debug future schema mismatches
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}