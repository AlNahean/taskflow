// File: E:/projects/sorties/task-management/task-manager-app/app/api/chat/route.ts
import {
  OpenAIStream,
  StreamingTextResponse,
  AnthropicStream,
  experimental_StreamData,
  GoogleGenerativeAIStream,
} from "ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

export const runtime = "edge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

function serializeDataContext(data: { tasks: any[]; notes: any[] }): string {
  let context = "--- USER'S DATA CONTEXT ---\n\n";

  context += "## TASKS:\n";
  if (data.tasks.length > 0) {
    data.tasks.forEach((t) => {
      context += `- [${t.status === "completed" ? "x" : " "}] ${
        t.title
      } (Priority: ${t.priority}, Due: ${t.dueDate})\n`;
    });
  } else {
    context += "No tasks found.\n";
  }

  context += "\n## NOTES:\n";
  if (data.notes.length > 0) {
    data.notes.forEach((n) => {
      context += `### ${n.title}\n${n.content || "No content."}\n---\n`;
    });
  } else {
    context += "No notes found.\n";
  }

  context += "\n--- END OF CONTEXT ---";
  return context;
}

const buildGeminiMessages = (messages: { role: string; content: string }[]) => {
  const formattedMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  return formattedMessages;
};

export async function POST(req: Request) {
  try {
    const { messages, data, model } = await req.json();

    // --- THIS IS THE FIX ---
    // Inject the current date into the system prompt.
    const systemPrompt = `You are an intelligent assistant for a task management app called TaskFlow.
        IMPORTANT: The current date is ${new Date().toISOString()}.
        The user has provided you with their complete list of tasks and notes as context. Your role is to answer questions based *only* on this provided context. Be helpful, concise, and do not make up information. If the answer is not in the context, say that you cannot find the information in their tasks or notes.\n\n${serializeDataContext(
          data
        )}`;

    const dataStream = new experimental_StreamData();

    if (model.startsWith("gpt")) {
      if (!process.env.OPENAI_API_KEY)
        return new Response("OpenAI API key not configured", { status: 500 });

      const fullMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-5),
      ];
      const response = await openai.chat.completions.create({
        model,
        stream: true,
        messages: fullMessages,
      });
      const stream = OpenAIStream(response, {
        experimental_streamData: true,
        onFinal(completion, tokenUsage) {
          dataStream.append({ tokens: tokenUsage?.total_tokens });
          dataStream.close();
        },
      });
      return new StreamingTextResponse(stream, {}, dataStream);
    } else if (model.startsWith("claude")) {
      if (!process.env.ANTHROPIC_API_KEY)
        return new Response("Anthropic API key not configured", {
          status: 500,
        });

      const response = await anthropic.messages.create({
        model,
        stream: true,
        system: systemPrompt,
        messages: messages.slice(-5),
        max_tokens: 1024,
      });
      const stream = AnthropicStream(response, {
        onFinal() {
          dataStream.close();
        },
      });
      return new StreamingTextResponse(stream, {}, dataStream);
    } else if (model.startsWith("gemini")) {
      if (!process.env.GOOGLE_GEMINI_API_KEY)
        return new Response("Google Gemini API key not configured", {
          status: 500,
        });

      const geminiModel = genAI.getGenerativeModel({
        model: model,
        systemInstruction: systemPrompt,
      });

      const chatHistory = buildGeminiMessages(messages.slice(-5));
      const lastUserMessage = chatHistory.pop();

      const result = await geminiModel.generateContentStream({
        contents: [...chatHistory, lastUserMessage!],
        generationConfig: {
          maxOutputTokens: 1024,
        },
      });

      const stream = GoogleGenerativeAIStream(result, {
        onFinal() {
          dataStream.close();
        },
      });
      return new StreamingTextResponse(stream, {}, dataStream);
    } else {
      return new Response(`Model ${model} not supported.`, { status: 400 });
    }
  } catch (error: any) {
    console.error("[API CHAT ERROR]", error);
    return new Response(error.message || "An error occurred.", { status: 500 });
  }
}
