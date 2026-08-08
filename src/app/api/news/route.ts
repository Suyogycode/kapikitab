import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import NewsArticle from "@/lib/models/NewsArticle";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch the 20 most recent STEM articles from the AI-curated cache
    const articles = await NewsArticle.find({})
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean(); // .lean() converts Mongoose docs to plain JS objects for faster fetching
      
    return NextResponse.json(articles);
  } catch (error) {
    console.error("Failed to fetch curated news:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}