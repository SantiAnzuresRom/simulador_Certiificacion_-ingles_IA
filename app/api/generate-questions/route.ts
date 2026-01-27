import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { type, level } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // El que usas según tu imagen
      messages: [
        {
          role: "system",
          content: "You are an English exam generator. Return ONLY a JSON object. " +
                   "Structure: { 'title': 'string', 'passage': 'string', 'questions': [{ 'question': 'string', 'options': ['string'], 'correctAnswer': 'string' }] }"
        },
        { role: "user", content: `Generate a ${type} exam for level ${level}` }
      ],
      response_format: { type: "json_object" }, // ESTO ES CLAVE
    });

    const data = JSON.parse(completion.choices[0].message.content || "{}");
    
    // Si GPT falla y no manda preguntas, mandamos un error claro
    if (!data.questions) {
       return NextResponse.json({ error: "GPT did not generate questions" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Master API Connection Failed" }, { status: 500 });
  }
}