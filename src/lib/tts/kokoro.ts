export async function generateKokoroAudioSegment(text: string, speaker: 'A' | 'B'): Promise<Buffer> {
  const voice = speaker === 'A' ? 'af_bella' : 'am_puck';

  // Use the environment variable, or fallback to localhost for local dev
  const kokoroBaseUrl = process.env.KOKORO_API_URL || 'http://localhost:8880';

  const response = await fetch('http://localhost:8880/v1/audio/speech', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true' // <-- ADD THIS LINE
    },
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