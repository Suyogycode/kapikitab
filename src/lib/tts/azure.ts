import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export async function generateAzureAudioSegment(
  text: string, 
  speaker: 'A' | 'B',
  language: 'hinglish' | 'english' = 'hinglish'
): Promise<Buffer> {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    throw new Error("Azure Speech credentials are missing.");
  }

  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3;
  
  // Dynamically assign premium neural voices based on the selected language
  if (language === 'english') {
    speechConfig.speechSynthesisVoiceName = speaker === 'A' ? 'en-IN-AartiNeural' : 'en-IN-AaravNeural';
  } else {
    speechConfig.speechSynthesisVoiceName = speaker === 'A' ? 'hi-IN-AartiNeural' : 'hi-IN-ArjunNeural';
  }

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          const buffer = Buffer.from(result.audioData);
          synthesizer.close();
          resolve(buffer);
        } else {
          synthesizer.close();
          reject(new Error("Azure TTS Synthesis failed"));
        }
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
}