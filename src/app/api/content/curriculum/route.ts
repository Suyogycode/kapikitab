import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import Curriculum from '@/lib/models/Curriculum';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    // 1. Check the database for the user's specific class
    const curriculum = await Curriculum.findOne({ classId }).lean();

    // 2. THE FIX: Dynamic fallback template based on Class Level
    if (!curriculum) {
      console.log(`No curriculum found in DB for ${classId}. Serving fallback data.`);
      
      let fallbackSubjects = [];
      
      // Secondary block (Classes 8, 9, 10) gets Math and Science
      if (['c8', 'c9', 'c10'].includes(classId)) {
        fallbackSubjects = [
          { subjectId: 'math', title: 'Mathematics', isGroup: false, subSubjects: [] },
          { subjectId: 'sci', title: 'Science', isGroup: false, subSubjects: [] }
        ];
      } 
      // Senior block (Classes 11, 12) gets Math, Physics, Chemistry, Biology
      else {
        fallbackSubjects = [
          { subjectId: 'math', title: 'Mathematics', isGroup: false, subSubjects: [] },
          { subjectId: 'phy', title: 'Physics', isGroup: false, subSubjects: [] },
          { subjectId: 'chem', title: 'Chemistry', isGroup: false, subSubjects: [] },
          { subjectId: 'bio', title: 'Biology', isGroup: false, subSubjects: [] }
        ];
      }

      const fallbackCurriculum = {
        classId: classId,
        className: `Class ${classId.replace('c', '')}`,
        subjects: fallbackSubjects
      };
      
      return NextResponse.json(fallbackCurriculum, { status: 200 });
    }

    // 3. Return actual database data if it exists
    return NextResponse.json(curriculum, { status: 200 }); 
    
  } catch (error) {
    console.error('Curriculum Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}