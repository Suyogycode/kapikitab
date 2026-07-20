import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import Question from '@/lib/models/Question';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get('chapterId');

    if (!chapterId) {
      return NextResponse.json({ error: 'chapterId is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Fetch all questions linked to this specific chapter
    // .lean() converts the MongoDB documents into plain JavaScript objects
    const questions = await Question.find({ chapterId }).lean();

    // The frontend PracticeEngine expects a direct array of questions
    return NextResponse.json(questions || [], { status: 200 }); 
    
  } catch (error) {
    console.error('Question Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}