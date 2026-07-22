export async function generateKokoroAudioSegment(text: string, speaker: 'A' | 'B'): Promise<Buffer> {
  const voice = speaker === 'A' ? 'af_bella' : 'am_puck';

  const response = await fetch('http://localhost:8880/v1/audio/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'kokoro',
      input: text,
      voice: voice,
      response_format: 'mp3'
    })
  });

  if (!response.ok) {
    throw new Error(`Kokoro Local Docker error: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}