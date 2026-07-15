// app/api/ai/parse-questions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // 1. Extract the form data sent from the QuestionManager component
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const chapterId = formData.get('chapterId');
    const unitId = formData.get('unitId');

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'No file assets provided.' }, { status: 400 });
    }

    // For this pipeline, we process the first file in the batch. 
    // (You can easily map over the 'files' array for multi-page batching later)
    const file = files[0];
    
    // 2. Convert the file into a Base64 string for the Vision Model
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type; 

    // 3. The Strict Extraction Prompt
    const systemPrompt = `
      You are an expert STEM data ingestion engine for an Indian educational platform.
      Your task is to extract every single question from the provided document image.

      CRITICAL RULES:
      1. Translate all mathematical symbols, expressions, and equations into standard LaTeX syntax. Enclose inline math in single '$' and block math in double '$$'.
      2. You MUST return the response as a strict JSON object containing a single array called "extractedQuestions".
      3. Do not include markdown code blocks (like \`\`\`json) in your response, just the raw JSON object.
      
      SCHEMA TEMPLATE FOR EACH QUESTION IN THE ARRAY:
      {
        "type": "mcq_single", // use "mcq_multiple" if multiple options are correct, or "numeric" if it's a fill-in-the-blank math answer
        "text": "The question text, e.g., Find the derivative of $x^2$",
        "correctAnswers": ["A"], // or ["A", "C"] for multiple, or ["9.81"] for numeric
        "options": [
          { "id": "A", "text": "Option A text" },
          { "id": "B", "text": "Option B text" },
          { "id": "C", "text": "Option C text" },
          { "id": "D", "text": "Option D text" }
        ] // Leave options array empty if the type is "numeric"
      }
    `;

    // 4. Hit the Groq API (Using Llama 3 Vision Preview)
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // Swap to Qwen if/when Groq adds Qwen-VL support
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      // Enforce JSON mode output
      response_format: { type: "json_object" }, 
      temperature: 0.1, // Keep it low to prevent hallucinations and enforce strict parsing
    });

    // 5. Parse the LLM response back into native JSON
    const responseText = completion.choices[0]?.message?.content || "{}";
    const parsedData = JSON.parse(responseText);

    return NextResponse.json({
      message: "Extraction successful",
      extractedQuestions: parsedData.extractedQuestions || []
    });

  } catch (error: any) {
    console.error("AI Pipeline Error:", error);
    return NextResponse.json({ 
      message: error.message || "Failed to process the document through the AI Pipeline." 
    }, { status: 500 });
  }
}