// /app/api/content/chapter/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  Asset  from '@/lib/models/Asset'; 
import  Question  from '@/lib/models/Question';

// Define strict typing interfaces for aggregate outputs
interface AggregateAssetResult {
  _id: {
    unitId: string;
    type: 'video_lecture' | 'pdf_document' | 'diagram' | 'react_simulation';
  };
  count: number;
}

interface AggregateQuestionResult {
  _id: string; // holds the unitId string directly
  count: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get('chapterId');

  if (!chapterId) {
    return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
  }

  try {
    // 1. Count asset sub-types grouped by unitId
    const assets: AggregateAssetResult[] = await Asset.aggregate([
      { $match: { chapterId } },
      { $group: {
          _id: { unitId: "$unitId", type: "$type" },
          count: { $sum: 1 }
      }}
    ]);

    // 2. Count questions grouped by unitId 
    const questions: AggregateQuestionResult[] = await Question.aggregate([
      { $match: { chapterId } },
      { $group: {
          _id: "$unitId",
          count: { $sum: 1 }
      }}
    ]);

    // 3. Structural mapping formatting
    const unitInventory: Record<string, any> = {};

    assets.forEach((item: AggregateAssetResult) => {
      const { unitId, type } = item._id;
      if (!unitInventory[unitId]) {
        unitInventory[unitId] = { video_lecture: 0, pdf_document: 0, diagram: 0, react_simulation: 0, questionsCount: 0 };
      }
      unitInventory[unitId][type] = item.count;
    });

    questions.forEach((item: AggregateQuestionResult) => {
      const unitId = item._id;
      if (!unitInventory[unitId]) {
        unitInventory[unitId] = { video_lecture: 0, pdf_document: 0, diagram: 0, react_simulation: 0, questionsCount: 0 };
      }
      unitInventory[unitId].questionsCount = item.count;
    });

    return NextResponse.json({ unitInventory });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}