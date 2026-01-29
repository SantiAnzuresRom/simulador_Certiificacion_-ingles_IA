import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { type, level } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an English exam generator. Return ONLY a JSON object. 
          Structure: { 
            "title": "string", 
            "passage": "string", 
            "questions": [
              { "question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": "string" }
            ] 
          }
          IMPORTANT: You MUST generate EXACTLY 10 questions.`
        },
        { role: "user", content: `Generate a professional ${type} exam for level ${level}` }
      ],
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(completion.choices[0].message.content || "{}");
    
    if (!data.questions || data.questions.length === 0) {
       return NextResponse.json({ error: "GPT failed" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "API Connection Failed" }, { status: 500 });
  }
}