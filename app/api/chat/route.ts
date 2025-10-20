import {
  OpenAIStream,
  StreamingTextResponse,
  AnthropicStream,
  experimental_StreamData,
} from "ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Helper to serialize all tasks and notes into a single string for context
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

export async function POST(req: Request) {
  try {
    const { messages, data, model } = await req.json();

    const systemPrompt = `You are an intelligent assistant for a task management app called TaskFlow. The user has provided you with their complete list of tasks and notes as context. Your role is to answer questions based *only* on this provided context. Be helpful, concise, and do not make up information. If the answer is not in the context, say that you cannot find the information in their tasks or notes.\n\n${serializeDataContext(
      data
    )}`;

    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-5),
    ];

    // Create a StreamData instance to send structured data
    const dataStream = new experimental_StreamData();

    if (model.startsWith("gpt")) {
      if (!process.env.OPENAI_API_KEY) {
        return new Response("OpenAI API key not configured", { status: 500 });
      }
      const response = await openai.chat.completions.create({
        model: model,
        stream: true,
        messages: fullMessages,
      });

      // Pipe the stream and append token usage data when the stream is finalized
      const stream = OpenAIStream(response, {
        experimental_streamData: true,
        onFinal(completion, tokenUsage) {
          dataStream.append({
            tokens: tokenUsage?.total_tokens,
          });
          dataStream.close();
        },
      });

      return new StreamingTextResponse(stream, {}, dataStream);
    } else if (model.startsWith("claude")) {
      // NOTE: Anthropic's SDK via Vercel AI SDK does not yet expose token usage as cleanly on streaming.
      // This implementation will show tokens for OpenAI but not for Anthropic for now.
      if (!process.env.ANTHROPIC_API_KEY) {
        return new Response("Anthropic API key not configured", {
          status: 500,
        });
      }
      const response = await anthropic.messages.create({
        model: model,
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
    } else {
      return new Response(`Model ${model} not supported.`, { status: 400 });
    }
  } catch (error: any) {
    console.error("[API CHAT ERROR]", error);
    return new Response(error.message || "An error occurred.", { status: 500 });
  }
}
