// src/app/api/content/graphics/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Graphic from '@/lib/models/Graphic'; // The schema we created earlier

export async function GET() {
  try {
    await dbConnect();
    // Fetch all 3D graphics, newest first
    const graphics = await Graphic.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(graphics);
  } catch (error) {
    console.error("Failed to fetch graphics:", error);
    return NextResponse.json({ error: "Failed to fetch graphics" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Create the new graphic record in MongoDB
    const newGraphic = await Graphic.create(body);
    
    return NextResponse.json({ success: true, graphic: newGraphic }, { status: 201 });
  } catch (error) {
    console.error("Failed to save graphic metadata:", error);
    return NextResponse.json({ error: "Failed to save graphic metadata" }, { status: 500 });
  }
}