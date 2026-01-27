import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { type, content, level, userAnswers, correctAnswers } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    // CONFIGURACIÓN POR TIPO DE MÓDULO
    switch (type) {
      case "writing":
        systemPrompt = `Eres un examinador de inglés.Califica el ensayo para un nivel ${level}. 
        Evalúa: Gramática, Vocabulario, Coherencia y Tarea.`;
        userPrompt = `Ensayo: ${content}`;
        break;

      case "reading":
      case "listening":
        systemPrompt = `Eres un asistente de calificación. Compara las respuestas del usuario con las respuestas correctas. 
        Calcula el porcentaje de aciertos del 0 al 100.`;
        userPrompt = `Nivel: ${level}. 
        Respuestas del usuario: ${JSON.stringify(userAnswers)}. 
        Respuestas correctas: ${JSON.stringify(correctAnswers)}.`;
        break;

      case "speaking":
        systemPrompt = `Eres un experto en fluidez oral. Califica la transcripción de un audio para nivel ${level}. 
        Busca fluidez y uso de conectores.`;
        userPrompt = `Transcripción: ${content}`;
        break;

      default:
        return NextResponse.json({ error: "Tipo de módulo no válido" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${systemPrompt} Responde ÚNICAMENTE en formato JSON: 
          { "score": número_0_100, "feedback": "comentario breve y motivador" }`
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);

  } catch (error) {
    console.error("Master API Error:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}