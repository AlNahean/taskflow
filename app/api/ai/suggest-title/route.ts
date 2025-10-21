import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z, ZodError } from "zod";
import { serverLogger } from "@/lib/logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const schema = z.object({
  content: z.string().min(20, "Content must be at least 20 characters long."),
});

export async function POST(req: Request) {
  const context = { req: { method: req.method, url: req.url } };
  serverLogger.info(
    context,
    `[API /api/ai/suggest-title] POST request received`
  );

  if (!process.env.OPENAI_API_KEY) {
    serverLogger.error(
      context,
      `[API /api/ai/suggest-title] OpenAI API key is missing`
    );
    return new Response(
      JSON.stringify({ error: "Server configuration error." }),
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { content } = schema.parse(body);
    serverLogger.info(
      context,
      `[API /api/ai/suggest-title] Parsed request body`
    );

    const systemPrompt = `You are an expert at summarizing text. Based on the following note content, generate a concise and descriptive title between 5 and 10 words. Your response MUST be a single, valid JSON object: { "title": "Your Suggested Title" }. Do NOT include any markdown or other text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content },
      ],
      temperature: 0.5,
      max_tokens: 50,
      response_format: { type: "json_object" },
    });
    serverLogger.info(
      context,
      `[API /api/ai/suggest-title] Received response from OpenAI`
    );

    const completion = response.choices[0]?.message?.content;
    if (!completion) {
      throw new Error("AI failed to return a valid response.");
    }

    const parsedJson = JSON.parse(completion);
    return NextResponse.json(parsedJson);
  } catch (error: any) {
    if (error instanceof ZodError) {
      serverLogger.error(
        { ...context, err: error.issues },
        `[API /api/ai/suggest-title] Zod validation failed`
      );
      return new Response(
        JSON.stringify({ error: "Invalid input", details: error.issues }),
        { status: 400 }
      );
    }
    serverLogger.error(
      { ...context, err: error },
      `[API /api/ai/suggest-title] An internal error occurred`
    );
    return new Response(
      JSON.stringify({
        error: "An internal error occurred.",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
