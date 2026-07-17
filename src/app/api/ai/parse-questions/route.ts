// app/api/ai/parse-questions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const chapterId = formData.get('chapterId');
    const unitId = formData.get('unitId');

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'No file assets provided.' }, { status: 400 });
    }

    const file = files[0];
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type; 

    // ==========================================
    // STEP 1: VISION MODEL (Extraction Only)
    // ==========================================
    const visionPrompt = `
      Extract all the educational questions visible in this image. 
      Return ONLY a strict JSON object with a single array called "rawTextQuestions" containing the text of each question.
      Do NOT attempt to solve them or create options. Just transcribe the text accurately.
      
      EXPECTED OUTPUT:
      {
        "rawTextQuestions": [
          "Question 1 text...",
          "Question 2 text..."
        ]
      }
    `;

    const visionCompletion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct", 
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: visionPrompt },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
          ],
        },
      ],
      response_format: { type: "json_object" }, 
      temperature: 0.1, 
    });

    const visionResponseText = visionCompletion.choices[0]?.message?.content || "{}";
    const visionData = JSON.parse(visionResponseText);
    const extractedTexts = visionData.rawTextQuestions || [];

    if (extractedTexts.length === 0) {
      throw new Error("Vision model failed to detect any questions in the document.");
    }

    // ==========================================
    // STEP 2: TEXT MODEL (Reasoning & Generation)
    // ==========================================
    const textPrompt = `
      You are an expert STEM curriculum designer.
      
      For every raw question text provided below, perform these tasks:
      1. Generate 4 plausible multiple-choice options (A, B, C, D).
      2. Identify the correct answer.
      3. Write a brief, helpful explanation of why that answer is correct.
      
      CRITICAL JSON FORMATTING & LOGIC RULES:
      - Wrap all mathematical formulas, symbols, and equations in standard LaTeX syntax (inline '$' and block '$$').
      - You must DOUBLE-ESCAPE all backslashes in your LaTeX syntax for the JSON string. (e.g., write "\\\\frac" instead of "\\frac").
      - You MUST return a strict JSON object with a single array called "extractedQuestions".
      - LOGIC RULE: You MUST randomly distribute the correct answer across options A, B, C, and D for each question. Do NOT make 'A' the correct answer every time.
      
      RAW QUESTIONS TO PROCESS:
      ${JSON.stringify(extractedTexts)}
      
      EXPECTED OUTPUT SCHEMA:
      {
        "extractedQuestions": [
          {
            "type": "mcq_single",
            "text": "Question text...",
            "correctAnswers": ["C"], 
            "options": [
              { "id": "A", "text": "Distractor" },
              { "id": "B", "text": "Distractor" },
              { "id": "C", "text": "Correct Option" },
              { "id": "D", "text": "Distractor" }
            ],
            "explanation": "Explanation here..."
          }
        ]
      }
    `;

    const textCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { role: "user", content: textPrompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" } 
    });

    const textResponseText = textCompletion.choices[0]?.message?.content || "{}";
    const finalData = JSON.parse(textResponseText);

    // ==========================================
    // PROGRAMMATIC SHUFFLE: Smashes LLM Patterns
    // ==========================================
    if (finalData.extractedQuestions && Array.isArray(finalData.extractedQuestions)) {
      finalData.extractedQuestions = finalData.extractedQuestions.map((q: any) => {
        
        // Only shuffle multiple choice questions with valid options
        if (q.type === 'mcq_single' && Array.isArray(q.options) && q.options.length > 0) {
          
          // 1. Locate the text value of what the LLM designated as correct
          const correctId = q.correctAnswers?.[0];
          const correctOption = q.options.find((o: any) => o.id === correctId);
          const correctText = correctOption ? correctOption.text : q.options[0].text;

          // 2. Extract just the text array of the options
          const optionTexts = q.options.map((o: any) => o.text);

          // 3. Perform a chaotic Fisher-Yates shuffle on the option texts
          for (let i = optionTexts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionTexts[i], optionTexts[j]] = [optionTexts[j], optionTexts[i]];
          }

          // 4. Re-map the scrambled texts back to standard A, B, C, D identifiers
          const labelIdentifiers = ['A', 'B', 'C', 'D'];
          const scrambledOptions = labelIdentifiers.map((id, index) => ({
            id,
            text: optionTexts[index] || ""
          }));

          // 5. Track down where the original correct answer text landed in the new array
          const finalizedCorrectOption = scrambledOptions.find((o: any) => o.text === correctText);
          const finalizedCorrectId = finalizedCorrectOption ? finalizedCorrectOption.id : 'A';

          return {
            ...q,
            options: scrambledOptions,
            correctAnswers: [finalizedCorrectId]
          };
        }
        return q;
      });
    }

    return NextResponse.json({
      message: "Pipeline extraction & shuffle successful",
      extractedQuestions: finalData.extractedQuestions || []
    });

  } catch (error: any) {
    console.error("AI Pipeline Error:", error);
    return NextResponse.json({ 
      message: error.message || "Failed to process the document through the AI Pipeline." 
    }, { status: 500 });
  }
}