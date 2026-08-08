import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import crypto from 'crypto';
import connectToDatabase from '@/lib/database';
import NewsArticle from '@/lib/models/NewsArticle';

export const maxDuration = 60;

// 1. Tell the parser to look for hidden media tags
const parser = new Parser({
  customFields: {
    item: ['media:content', 'content:encoded'],
  }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const RSS_FEEDS = [
  { name: 'ScienceDaily', url: 'https://www.sciencedaily.com/rss/top/science.xml' },
  { name: 'NASA', url: 'https://www.nasa.gov/news-release/feed/' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' }
];

// 2. Add imageUrl to the schema so Gemini handles the mapping
const articleSchema: any = {
  type: "array",
  items: {
    type: "object",
    properties: {
      title: { type: "string" },
      tldr: { type: "string" },
      keyTakeaways: { type: "array", items: { type: "string" } },
      deepDive: { type: "string" },
      category: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      imageUrl: { type: "string" } // <-- Added this
    },
    required: ["title", "tldr", "keyTakeaways", "deepDive", "category", "tags", "imageUrl"]
  }
};

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const rawArticles: Array<{ sourceName: string; sourceUrl: string; title: string; contentSnippet: string; imageUrl: string }> = [];

    for (const feed of RSS_FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url);
        const recentItems = parsed.items.slice(0, 5);

        recentItems.forEach((item: any) => {
          // 3. More aggressive image extraction
          let extractedImage = '';
          if (item.enclosure?.url) {
            extractedImage = item.enclosure.url;
          } else if (item['media:content']?.$?.url) {
            extractedImage = item['media:content'].$.url;
          } else if (item['content:encoded']) {
            const imgMatch = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) extractedImage = imgMatch[1];
          } else if (item.content) {
            const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) extractedImage = imgMatch[1];
          }

          rawArticles.push({
            sourceName: feed.name,
            sourceUrl: item.link || '',
            title: item.title || '',
            contentSnippet: item.contentSnippet || item.content || '',
            imageUrl: extractedImage
          });
        });
      } catch (feedError) {
        console.error(`Failed to fetch RSS from ${feed.name}:`, feedError);
      }
    }

    if (rawArticles.length === 0) {
      return NextResponse.json({ message: 'No articles fetched' }, { status: 200 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: articleSchema,
      }
    });

    // 4. Update the prompt to instruct Gemini to pass the image through
    const prompt = `
      You are an expert STEM content curator. 
      Analyze these raw news items. Group any items covering the exact same event into a single report.
      IMPORTANT: If the raw data provides an 'imageUrl', you MUST include it in your output for that article. If there is no image, return an empty string "".
      Format the output into the required JSON array. Keep the tone educational.
      
      Raw Data: ${JSON.stringify(rawArticles)}
    `;

    const aiResult = await model.generateContent(prompt);
    const aiProcessedNews = JSON.parse(aiResult.response.text());

    let insertedCount = 0;

    for (const article of aiProcessedNews) {
      const contentHash = crypto.createHash('md5').update(article.title).digest('hex');
        // Replace the old slug line with these two lines:
        const baseSlug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const slug = `${baseSlug}-${crypto.randomBytes(2).toString('hex')}`;
      // We no longer need the brittle title matching here!
      const relevantSources = rawArticles
        .filter(raw => raw.title.toLowerCase().includes(article.title.substring(0, 15).toLowerCase()))
        .map(raw => ({ name: raw.sourceName, url: raw.sourceUrl }));

      const result = await NewsArticle.updateOne(
        { contentHash },
        {
          $setOnInsert: {
            title: article.title,
            slug,
            tldr: article.tldr,
            keyTakeaways: article.keyTakeaways,
            deepDive: article.deepDive,
            category: article.category,
            tags: article.tags,
            imageUrl: article.imageUrl || '', // 5. Directly save the image Gemini gives us
            sources: relevantSources.length > 0 ? relevantSources : [{ name: 'STEM Feed Aggregator', url: '#' }],
            contentHash,
            publishedAt: new Date()
          }
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        insertedCount++;
      }
    }

    return NextResponse.json({ success: true, processed: aiProcessedNews.length, newlyInserted: insertedCount });

  } catch (error: any) {
    console.error('Ingestion Pipeline Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}