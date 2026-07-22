export async function generateSarvamAudioSegment(text: string, speaker: 'A' | 'B'): Promise<Buffer> {
  // Upgraded to valid bulbul:v3 voices (Priya for Female, Shubh for Male)
  const speakerVoice = speaker === 'A' ? 'suhani' : 'aditya';

  const response = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': process.env.SARVAM_API_KEY || ''
    },
    body: JSON.stringify({
      text: text, // V3 requires a direct string, not an array
      target_language_code: 'hi-IN',
      speaker: speakerVoice,
      model: 'bulbul:v3' // Upgraded to the latest engine
    })
  });

  if (!response.ok) {
    // Adding await response.text() helps log exactly what the API rejected if it fails again
    const errorBody = await response.text();
    throw new Error(`Sarvam TTS error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  
  // Sarvam returns a base64 string inside the 'audios' array
  const base64Audio = data.audios[0];
  return Buffer.from(base64Audio, 'base64');
}