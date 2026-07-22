import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import connectToDatabase from '@/lib/database';
import Chapter from '@/lib/models/Chapter';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    // 1. Extract 'engine' to determine the language
    const { chapterId, engine } = await req.json();

    if (!chapterId) {
      return NextResponse.json({ error: 'chapterId is required' }, { status: 400 });
    }

    await connectToDatabase();
    const chapter = await Chapter.findOne({ chapterId }).lean();

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const contextText = chapter.summary && chapter.summary.trim().length > 0 
      ? chapter.summary 
      : `Chapter Title: ${chapter.title}`;

    // 2. Dynamically adjust the language based on the selected TTS engine
    const languageInstruction = engine === 'kokoro' 
      ? "pure English (suitable for standard American/British text-to-speech without accents)" 
      : "Hinglish (a natural mix of Hindi and English)";

    const systemPrompt = `You are an expert educational podcast scriptwriter for middle school students in India.
Your task is to create a dynamic, engaging 2-person educational conversation in ${languageInstruction} between Host A (female, encouraging) and Host B (male, curious).

STRICT CONSTRAINTS:
1. Ground ALL concepts strictly on the provided Canonical Context below. DO NOT introduce concepts beyond this context or beyond Class 8th/9th/10th level.
2. Output strictly valid JSON. Do not include markdown code blocks, explanation text, or extra characters.
3. Keep the dialogue back-and-forth natural, witty, and easy to understand.

OUTPUT FORMAT (JSON ARRAY ONLY):
[
  { "speaker": "A", "text": "Welcome! Today we are going to explore the fascinating world of numbers." },
  { "speaker": "B", "text": "I can't wait! Let's get started right away." }
]

CANONICAL CONTEXT:
${contextText}`;

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b', // Swapped to your custom Groq model
      messages: [
        { role: 'system', content: 'You output strictly raw JSON arrays of objects containing speaker and text fields.' },
        { role: 'user', content: systemPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices[0]?.message?.content || '[]';
    
    // 3. Fallback parsing in case the OSS model wraps the JSON in markdown blocks
    let parsedScript;
    try {
      parsedScript = JSON.parse(responseContent);
    } catch (e) {
      const cleaned = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedScript = JSON.parse(cleaned);
    }

    const scriptArray = Array.isArray(parsedScript) ? parsedScript : parsedScript.dialogue || parsedScript.script || [];

    return NextResponse.json({ script: scriptArray }, { status: 200 });

  } catch (error) {
    console.error('Groq Script Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
  }
}