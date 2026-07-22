import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export async function generateAzureAudioSegment(text: string, speaker: 'A' | 'B'): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  
  await tts.setMetadata(
    speaker === 'A' ? 'hi-IN-KavyaNeural' : 'hi-IN-AaravNeural',
    OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
  );

  // FIX: Destructure the audioStream from the returned object
  const { audioStream } = tts.toStream(text);
  const chunks: Uint8Array[] = [];

  return new Promise((resolve, reject) => {
    audioStream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    
    // Some Node streams emit 'end', others emit 'close'. 
    // Listening to both ensures the Promise resolves safely.
    audioStream.on('end', () => resolve(Buffer.concat(chunks)));
    audioStream.on('close', () => resolve(Buffer.concat(chunks)));
    
    audioStream.on('error', (err: Error) => reject(err));
  });
}