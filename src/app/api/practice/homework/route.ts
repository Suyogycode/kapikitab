import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// CRITICAL: Prevents Next.js from timing out while the Pro model processes the image
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, textQuery } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server Error: GEMINI_API_KEY is missing." }, { status: 500 });
    }

    if (!imageBase64 && !textQuery) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Upgraded to the Pro model for complex mathematical reasoning
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" } 
    });

            const prompt = `You are an elite mathematical solver. Analyze the provided problem (text or image).
        Return your response STRICTLY as a raw JSON object with this exact schema:
        {
        "problem": "Clear, plain text representation of the expression (e.g. 'Integrate x^2 with respect to x')",
        "steps": ["Step 1: Breakdown using standard mathematical text notation.", "Step 2: Simplify explicitly using plain text paths."],
        "finalAnswer": "The clean, simplified final notation outcome."
        }
        Avoid wrapping math symbols in backslashes, escape sequences, or raw raw markdown code brackets. Use standard readable syntax instead.`;

    const promptParts: any[] = [prompt];
    
    // Safely strip the Base64 prefix (data:image/jpeg;base64,) if the frontend sent it
    if (imageBase64) {
      const base64Data = imageBase64.includes(",") 
        ? imageBase64.split(",")[1] 
        : imageBase64;
        
      promptParts.push({
        inlineData: { 
          data: base64Data, 
          mimeType: mimeType || "image/jpeg" 
        },
      });
    }
    
    if (textQuery) {
      promptParts.push(`User Query: ${textQuery}`);
    } else {
      promptParts.push("Solve the math problem in this image.");
    }

    const result = await model.generateContent(promptParts);
    const responseText = result.response.text();
    const solution = JSON.parse(responseText);

    return NextResponse.json(solution, { status: 200 });

  } catch (error: any) {
    console.error("Homework Engine Error:", error);
    // Send the EXACT error message to the frontend so we aren't guessing
    return NextResponse.json({ 
      error: "Failed to process the equation.",
      details: error.message || String(error)
    }, { status: 500 });
  }
}