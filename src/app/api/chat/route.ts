import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectToDatabase from "@/lib/database";
import ChatHistory from "@/lib/models/ChatHistory";
// import { getServerSession } from "next-auth"; // Uncomment when NextAuth is fully wired

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const MEMORY_LIMIT = 6; // How many messages to keep before summarizing

export async function POST(req: Request) {
  try {
    const { text, imageBase64, mimeType, threadId, chapterContext } = await req.json();

    if (!text && !imageBase64) {
      return NextResponse.json({ error: "Message is empty" }, { status: 400 });
    }

    // 1. Authenticate User
    // const session = await getServerSession();
    // const userEmail = session?.user?.email;
    // if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // TEMPORARY BYPASS FOR TESTING: Use a dummy email until NextAuth is locked in
    const userEmail = "test@student.com"; 

    // 2. Connect to MongoDB and fetch the specific Room's Memory
    await connectToDatabase();
    let history = await ChatHistory.findOne({ userEmail, threadId });
    
    if (!history) {
      history = new ChatHistory({ userEmail, threadId, summary: "New conversation.", messages: [] });
    }

    // 3. Assemble the Dynamic "Mask" (System Prompt)
    let systemInstruction = "You are Kapi, a brilliant, friendly, and earthy AI tutor for KapiKitab. Keep answers concise, format math beautifully, and be encouraging.\n";
    
    if (threadId.startsWith('chapter_') && chapterContext) {
      systemInstruction += `\nROLE: Deep-Dive Tutor. The user is currently reading this specific chapter text:\n"${chapterContext}"\nAnswer strictly based on this context and help them master it.`;
    } else {
      systemInstruction += `\nROLE: Global Platform Guide. Help the student navigate the platform, suggest study strategies, and answer general STEM questions.`;
    }

    // Add the rolling memory summary
    systemInstruction += `\n\nSTUDENT MEMORY SUMMARY:\n${history.summary}`;

    // 4. Format previous messages for Gemini's history array
    const formattedHistory = history.messages.map((msg: any) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // 5. Initialize the AI Model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction });
    const chatSession = model.startChat({ history: formattedHistory });

    // 6. Send the new message (handling optional images)
    const promptParts: any[] = [];
    if (imageBase64 && mimeType) {
      promptParts.push({
        inlineData: { data: imageBase64.split(",")[1], mimeType: mimeType },
      });
    }
    promptParts.push(text);

    const result = await chatSession.sendMessage(promptParts);
    const aiResponseText = result.response.text();

    // 7. Save the new exchange to MongoDB
    history.messages.push({ role: 'user', content: text });
    history.messages.push({ role: 'ai', content: aiResponseText });

    // 8. The "Rolling Summarization" Engine
    if (history.messages.length > MEMORY_LIMIT) {
      const summaryModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const summaryPrompt = `You are a memory manager. Read this current summary: "${history.summary}". Now read these recent messages: ${JSON.stringify(history.messages)}. Write a single, concise paragraph updating the summary with any new struggles, concepts mastered, or context provided. Do not use conversational filler.`;
      
      const summaryResult = await summaryModel.generateContent(summaryPrompt);
      history.summary = summaryResult.response.text();
      
      // Prune the history to only keep the absolute latest exchange, relying on the new summary for context
      history.messages = history.messages.slice(-2); 
    }

    await history.save();

    return NextResponse.json({ text: aiResponseText }, { status: 200 });

  } catch (error) {
    console.error("Kapi Brain Error:", error);
    return NextResponse.json({ error: "Neural net disconnected." }, { status: 500 });
  }
}