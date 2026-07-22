import { NextRequest, NextResponse } from 'next/server';
import { generateSarvamAudioSegment } from '@/lib/tts/sarvam';
import { generateAzureAudioSegment } from '@/lib/tts/azure';
import { generateKokoroAudioSegment } from '@/lib/tts/kokoro';

export async function POST(req: NextRequest) {
  try {
    const { script, engine } = await req.json();

    if (!Array.isArray(script) || script.length === 0) {
      return NextResponse.json({ error: 'Valid script array is required' }, { status: 400 });
    }

    const audioBuffers: Buffer[] = [];

    // Process each line of the dialogue
    for (const item of script) {
      let segmentBuffer: Buffer;

      if (engine === 'sarvam') {
        segmentBuffer = await generateSarvamAudioSegment(item.text, item.speaker);
      } else if (engine === 'kokoro') {
        segmentBuffer = await generateKokoroAudioSegment(item.text, item.speaker);
      } else {
        segmentBuffer = await generateAzureAudioSegment(item.text, item.speaker);
      }

      audioBuffers.push(segmentBuffer);
    }

    // FIX: Instead of corrupting MP3 headers with Buffer.concat, 
    // we send an array of clean Base64 strings to the frontend playlist.
    const base64Array = audioBuffers.map(buf => buf.toString('base64'));

    return NextResponse.json({ audio: base64Array }, { status: 200 });

  } catch (error) {
    console.error('TTS Synthesis Pipeline Error:', error);
    return NextResponse.json({ error: 'Failed to synthesize audio dialogue' }, { status: 500 });
  }
}