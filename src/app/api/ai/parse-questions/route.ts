// src/app/api/ai/parse-questions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { extractText } from 'unpdf';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Helper to split an array into smaller chunks
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Helper to pause execution
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// SMART GROQ WRAPPER: Handles 429 TPM Limits Automatically
// ==========================================
async function callGroqWithRetry(
  params: any,
  maxRetries = 5
): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await groq.chat.completions.create(params);
    } catch (error: any) {
      const errorMsg = error?.message || '';
      const isRateLimit = error?.status === 429 || errorMsg.includes('429') || errorMsg.includes('rate_limit_exceeded');

      if (isRateLimit && attempt < maxRetries) {
        // Parse exact wait time from Groq error: e.g. "Please try again in 9.2325s" or "1m12.5s"
        let waitMs = 12000; // Default 12s fallback
        const minSecMatch = errorMsg.match(/try again in (\d+)m([\d.]+)s/i);
        const secMatch = errorMsg.match(/try again in ([\d.]+)s/i);
        const msMatch = errorMsg.match(/try again in ([\d.]+)ms/i);

        if (minSecMatch) {
          waitMs = (parseInt(minSecMatch[1], 10) * 60 + parseFloat(minSecMatch[2])) * 1000 + 1500;
        } else if (secMatch) {
          waitMs = Math.ceil(parseFloat(secMatch[1]) * 1000) + 1500; // Add 1.5s safety buffer
        } else if (msMatch) {
          waitMs = Math.ceil(parseFloat(msMatch[1])) + 1000;
        } else {
          waitMs = attempt * 10000;
        }

        console.warn(
          `[AI Pipeline] 429 Rate Limit hit on ${params.model}. Waiting ${(waitMs / 1000).toFixed(1)}s before retry ${attempt}/${maxRetries - 1}...`
        );
        await sleep(waitMs);
        continue;
      }

      throw error;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const chapterId = formData.get('chapterId');
    const unitId = formData.get('unitId');

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'No file assets provided.' }, { status: 400 });
    }

    // ==========================================
    // STEP 1: EXTRACTION (Vision Model)
    // ==========================================
    const visionPrompt = `
      Extract EVERY SINGLE educational question visible in this document/image without skipping any.
      Return ONLY a strict JSON object with a single array called "rawTextQuestions" containing the text of each question.
      Do NOT attempt to solve them or create options. Just transcribe the text accurately.

      MATH TRANSCRIPTION RULES:
      - Transcribe all mathematical expressions, fractions, exponents, and symbols directly into valid LaTeX enclosed in single dollar signs ($...$).
      - NEVER use plain-text ASCII math like "/", "*", or unformatted "^". 
      - Use \\frac{a}{b} for fractions, \\times or \\cdot for multiplication, and \\sqrt{} for roots.
      
      EXPECTED OUTPUT:
      {
        "rawTextQuestions": [
          "What is the value of $\\frac{x^2 + 1}{2}$ when $x = 3$?",
          "Question 2 text..."
        ]
      }
    `;

    const allExtractedTexts: string[] = [];

    for (let fIdx = 0; fIdx < files.length; fIdx++) {
      const file = files[fIdx];
      const bytes = await file.arrayBuffer();
      const mimeType = file.type || '';
      const isPdf = mimeType === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        const { text } = await extractText(new Uint8Array(bytes), { mergePages: false });
        const pages = Array.isArray(text) ? text : [text];

        for (const pageText of pages) {
          if (!pageText || !pageText.trim()) continue;

          const pdfExtractionCompletion = await callGroqWithRetry({
            model: 'qwen/qwen3.8-27b',
            messages: [
              {
                role: 'user',
                content: `${visionPrompt}\n\nDOCUMENT PAGE TEXT TO EXTRACT FROM:\n${pageText}`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
            max_completion_tokens: 3000,
          });

          const pdfResponseText = pdfExtractionCompletion.choices[0]?.message?.content || '{}';
          const pdfData = JSON.parse(pdfResponseText);
          if (Array.isArray(pdfData.rawTextQuestions)) {
            allExtractedTexts.push(...pdfData.rawTextQuestions);
          }
        }
      } else if (mimeType.startsWith('image/')) {
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');

        console.log(`[AI Pipeline] Extracting page/image ${fIdx + 1}/${files.length}...`);

        const visionCompletion = await callGroqWithRetry({
          model: 'qwen/qwen3.8-27b',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: visionPrompt },
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimeType};base64,${base64Image}` },
                },
              ],
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_completion_tokens: 3000,
        });

        const visionResponseText = visionCompletion.choices[0]?.message?.content || '{}';
        const visionData = JSON.parse(visionResponseText);
        if (Array.isArray(visionData.rawTextQuestions)) {
          allExtractedTexts.push(...visionData.rawTextQuestions);
        }
      }
    }

    if (allExtractedTexts.length === 0) {
      throw new Error('Model failed to detect any questions in the uploaded document(s).');
    }

    console.log(`[AI Pipeline] Step 1 extracted ${allExtractedTexts.length} raw questions.`);

    // ==========================================
    // STEP 2: CHUNKED TEXT MODEL
    // Uses llama-3.3-70b-versatile (separate TPM pool from qwen!) with qwen fallback
    // ==========================================
    const systemPrompt = `
      You are an expert STEM curriculum designer that outputs strict JSON.

      STRICT MATH & LATEX FORMATTING RULES:
      1. Enclose ALL math variables, numbers with units, equations, and expressions in single dollar signs ($...$) for inline math or double dollar signs ($$...$$) for block equations.
      2. NEVER use ugly plain-text math symbols outside or inside LaTeX:
         - NO "/" for division -> ALWAYS use \\frac{a}{b} or \\div
         - NO "*" for multiplication -> ALWAYS use \\times or \\cdot
         - NO bare "^" or "_" outside of $...$ delimiters -> ALWAYS write $x^2$ or $a_1$
         - NO ">=" or "<=" -> ALWAYS use \\geq or \\leq
         - NO "sqrt()" -> ALWAYS use \\sqrt{}
      3. Since your output is a valid JSON object, escape every LaTeX backslash properly (e.g., "\\frac{1}{2}", "\\times", "\\sqrt{x}").
      4. You MUST return a strict JSON object with a single array called "extractedQuestions".
      5. CRITICAL: You MUST process EVERY SINGLE question in the input array. Do not skip or summarize.
    `;

    // Smaller batch size (6) keeps individual request token size well under the 8,000 TPM ceiling
    const BATCH_SIZE = 6;
    const questionBatches = chunkArray(allExtractedTexts, BATCH_SIZE);
    const allGeneratedQuestions: any[] = [];

    for (let i = 0; i < questionBatches.length; i++) {
      const batch = questionBatches[i];
      console.log(`[AI Pipeline] Processing batch ${i + 1}/${questionBatches.length} (${batch.length} questions)...`);

      const textPrompt = `
        Convert all ${batch.length} raw questions below into structured multiple-choice questions:
        1. Clean up the question text so all math strictly follows the LaTeX rules.
        2. Generate 4 plausible multiple-choice options (A, B, C, D) using proper LaTeX.
        3. Identify the correct answer.
        4. Write a brief, helpful explanation of why that answer is correct using proper LaTeX.
        
        RAW QUESTIONS TO PROCESS (${batch.length} items):
        ${JSON.stringify(batch)}
        
        EXPECTED OUTPUT SCHEMA:
        {
          "extractedQuestions": [
            {
              "type": "mcq_single",
              "text": "Question text with $LaTeX$...",
              "correctAnswers": ["C"], 
              "options": [
                { "id": "A", "text": "$\\frac{1}{2}$" },
                { "id": "B", "text": "$\\frac{3}{4}$" },
                { "id": "C", "text": "$2 \\times 10^3$" },
                { "id": "D", "text": "$\\sqrt{5}$" }
              ],
              "explanation": "Explanation with $LaTeX$ here..."
            }
          ]
        }
      `;

      // Using llama-3.3-70b-versatile for Step 2 gives you a separate 12,000 TPM bucket
      // so Step 1 (Qwen Vision) and Step 2 (Llama Text) don't eat into the same 8,000 TPM limit!
      const textCompletion = await callGroqWithRetry({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: textPrompt },
        ],
        temperature: 0.2,
        max_completion_tokens: 3000,
        response_format: { type: 'json_object' },
      });

      const textResponseText = textCompletion.choices[0]?.message?.content || '{}';
      const batchData = JSON.parse(textResponseText);

      if (Array.isArray(batchData.extractedQuestions)) {
        allGeneratedQuestions.push(...batchData.extractedQuestions);
      }
    }

    // ==========================================
    // STEP 3: PROGRAMMATIC SHUFFLE
    // ==========================================
    const shuffledQuestions = allGeneratedQuestions.map((q: any) => {
      if (q.type === 'mcq_single' && Array.isArray(q.options) && q.options.length > 0) {
        const correctId = q.correctAnswers?.[0];
        const correctOption = q.options.find((o: any) => o.id === correctId);
        const correctText = correctOption ? correctOption.text : q.options[0].text;

        const optionTexts = q.options.map((o: any) => o.text);

        for (let i = optionTexts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [optionTexts[i], optionTexts[j]] = [optionTexts[j], optionTexts[i]];
        }

        const labelIdentifiers = ['A', 'B', 'C', 'D'];
        const scrambledOptions = labelIdentifiers.map((id, index) => ({
          id,
          text: optionTexts[index] || '',
        }));

        const finalizedCorrectOption = scrambledOptions.find((o: any) => o.text === correctText);
        const finalizedCorrectId = finalizedCorrectOption ? finalizedCorrectOption.id : 'A';

        return {
          ...q,
          options: scrambledOptions,
          correctAnswers: [finalizedCorrectId],
        };
      }
      return q;
    });

    console.log(`[AI Pipeline] Completed! Returning ${shuffledQuestions.length} formatted questions.`);

    return NextResponse.json({
      message: 'Pipeline extraction & shuffle successful',
      extractedQuestions: shuffledQuestions,
    });
  } catch (error: any) {
    console.error('AI Pipeline Error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to process the document through the AI Pipeline.',
      },
      { status: 500 }
    );
  }
}