import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, textQuery } = await req.json();

    if (!imageBase64 && !textQuery) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    // Force Gemini to act strictly as a JSON logic engine
    const systemInstruction = `You are an elite mathematical solver. You must analyze the provided math problem (either via text or image). Solve it step-by-step. 
    You MUST return your response as a raw JSON object with NO markdown formatting, NO backticks, and NO conversational text.
    Use this exact JSON schema:
    {
      "problem": "The original problem restated cleanly",
      "steps": ["Step 1 explanation and math", "Step 2 explanation and math"],
      "finalAnswer": "The final reduced answer"
    }`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction,
      // We can force the model to output JSON using generationConfig
      generationConfig: { responseMimeType: "application/json" } 
    });

    const promptParts: any[] = [];
    
    if (imageBase64 && mimeType) {
      promptParts.push({
        inlineData: { data: imageBase64.split(",")[1], mimeType: mimeType },
      });
    }
    
    if (textQuery) {
      promptParts.push(textQuery);
    } else {
      promptParts.push("Solve the math problem in this image.");
    }

    const result = await model.generateContent(promptParts);
    const responseText = result.response.text();
    
    // Parse the strict JSON string Gemini returns into an actual object
    const solution = JSON.parse(responseText);

    return NextResponse.json(solution, { status: 200 });

  } catch (error) {
    console.error("Homework Engine Error:", error);
    return NextResponse.json({ error: "Failed to process the equation." }, { status: 500 });
  }
}