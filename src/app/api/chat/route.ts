import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    // Notice we now expect `clientHistory` to be passed from your frontend UI
    const { text, imageBase64, mimeType, threadId, chapterContext, clientHistory = [] } = await req.json();

    if (!text && !imageBase64) {
      return NextResponse.json({ error: "Message is empty" }, { status: 400 });
    }

    // 1. Assemble the Dynamic "Mask" (System Prompt)
    let systemInstruction = "You are Kapi, a brilliant, friendly, and earthy AI tutor for KapiKitab. Keep answers concise, format math beautifully, and be encouraging.\n";
    
    if (threadId?.startsWith('chapter_') && chapterContext) {
      systemInstruction += `\nROLE: Deep-Dive Tutor. The user is currently reading this specific chapter text:\n"${chapterContext}"\nAnswer strictly based on this context and help them master it.`;
    } else {
      systemInstruction += `\nROLE: Global Platform Guide. Help the student navigate the platform, suggest study strategies, and answer general STEM questions.`;
    }

    // 2. Format the history array provided by the frontend for Gemini
    const formattedHistory = clientHistory.map((msg: any) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // 3. Initialize the AI Model without any MongoDB connections
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction });
    const chatSession = model.startChat({ history: formattedHistory });

    // 4. Send the new message (handling optional images)
    const promptParts: any[] = [];
    if (imageBase64 && mimeType) {
      promptParts.push({
        inlineData: { data: imageBase64.split(",")[1], mimeType: mimeType },
      });
    }
    promptParts.push(text);

    const result = await chatSession.sendMessage(promptParts);
    const aiResponseText = result.response.text();

    return NextResponse.json({ text: aiResponseText }, { status: 200 });

  } catch (error) {
    console.error("Kapi Brain Error:", error);
    return NextResponse.json({ error: "Neural net disconnected." }, { status: 500 });
  }
}