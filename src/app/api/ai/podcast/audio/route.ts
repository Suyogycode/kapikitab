import { NextRequest, NextResponse } from 'next/server';
import { generateAzureAudioSegment } from '@/lib/tts/azure';

export async function POST(req: NextRequest) {
  try {
    const { script, language } = await req.json();

    if (!Array.isArray(script) || script.length === 0) {
      return NextResponse.json({ error: 'Valid script array is required' }, { status: 400 });
    }

    const audioBuffers: Buffer[] = [];

    // Process each line of the dialogue exclusively through Azure
    for (const item of script) {
      const segmentBuffer = await generateAzureAudioSegment(item.text, item.speaker, language);
      audioBuffers.push(segmentBuffer);
    }

    const base64Array = audioBuffers.map(buf => buf.toString('base64'));

    return NextResponse.json({ audio: base64Array }, { status: 200 });

  } catch (error) {
    console.error('TTS Synthesis Pipeline Error:', error);
    return NextResponse.json({ error: 'Failed to synthesize audio dialogue' }, { status: 500 });
  }
}