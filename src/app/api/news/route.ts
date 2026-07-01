import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.NEWS_API_KEY;
  // Fetch science, tech, and education news, sorted by newest
  const url = `https://newsapi.org/v2/everything?q=(science OR technology OR education)&language=en&sortBy=publishedAt&pageSize=10&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    // Return only the data the UI needs to keep the payload tiny
    return NextResponse.json(data.articles || []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}