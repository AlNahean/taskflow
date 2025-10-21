// File: app/api/ai/suggest-tasks/route.ts
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import prisma from "@/lib/prisma";
import { z, ZodError } from "zod";
import { serverLogger } from "@/lib/logger";

// This route can't be edge-compatible because it needs to access the database.
// export const runtime = "edge";

// Helper function to format existing tasks for the AI prompt
function formatExistingTasksForAI(tasks: { title: string }[]): string {
  if (tasks.length === 0) {
    return "No tasks have been suggested for this note yet.";
  }
  return (
    "--- EXISTING SUGGESTIONS (DO NOT REPEAT THESE) ---\n" +
    tasks.map((t) => `- ${t.title}`).join("\n")
  );
}

// Zod schema for validating the AI's output. It's more lenient with dates.
const AISuggestedTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().max(1000).nullable().optional(),
  status: z
    .enum(["todo", "in_progress", "completed", "overdue"])
    .default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z
    .enum(["work", "personal", "shopping", "health", "other"])
    .default("personal"),
  startDate: z
    .string()
    .transform((val, ctx) => new Date(val))
    .optional(),
  dueDate: z.string().transform((val, ctx) => new Date(val)),
});

export async function POST(req: Request) {
  const context = { req: { method: req.method, url: req.url } };
  serverLogger.info(
    context,
    `[API /api/ai/suggest-tasks] POST request received`
  );

  if (!process.env.OPENAI_API_KEY) {
    serverLogger.error(
      context,
      `[API /api/ai/suggest-tasks] OpenAI API key is missing`
    );
    return new Response(
      JSON.stringify({
        error: "Server configuration error: OpenAI API key is missing.",
      }),
      { status: 500 }
    );
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const { prompt, noteId } = await req.json();
    serverLogger.info(
      { ...context, noteId },
      `[API /api/ai/suggest-tasks] Parsed request body`
    );

    if (!noteId) {
      serverLogger.warn(
        { ...context },
        `[API /api/ai/suggest-tasks] noteId is missing`
      );
      return new Response(JSON.stringify({ error: "noteId is required." }), {
        status: 400,
      });
    }

    if (!prompt || prompt.length < 10) {
      serverLogger.warn(
        { ...context },
        `[API /api/ai/suggest-tasks] Prompt is too short`
      );
      return new Response(
        JSON.stringify({ error: "Note must be at least 10 characters long." }),
        { status: 400 }
      );
    }

    // --- ENHANCEMENT: Fetch existing suggestions to provide context to the AI ---
    const existingSuggestions = await prisma.suggestedTask.findMany({
      where: { noteId: noteId },
      select: { title: true },
    });
    const existingTasksContext = formatExistingTasksForAI(existingSuggestions);

    const systemPrompt = `You are a world-class task management assistant. Your purpose is to analyze a user's note and extract a list of actionable tasks.

      You MUST adhere to the following rules:
      1.  Your entire response MUST be a single, valid JSON object: { "tasks": [...] }. Do NOT include any markdown, explanations, or other text.
      2.  The "tasks" array must contain objects with these exact keys: "title", "description", "status", "priority", "category", "startDate", "dueDate".
      3.  'status' must always be "todo".
      4.  Your response should be a JSON object.
      5.  Analyze the text for keywords to determine 'priority'.
      6.  Analyze the text for keywords to determine 'category'.
      7.  MOST IMPORTANTLY: Analyze the text for dates and convert them to absolute ISO 8601 date strings.
      8.  CRITICAL: A list of existing suggestions is provided below. Identify ONLY NEW tasks from the user's note that are NOT in this list. Do not repeat or re-phrase existing suggestions. If no new tasks are found, return an empty "tasks" array.

      ${existingTasksContext}
      `;

    // Provide the current date to the AI for accurate relative date calculation
    const userPromptWithDateContext = `Based on the current date of ${new Date().toISOString()}, analyze the following note:\n\n---\n\n${prompt}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPromptWithDateContext },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: "json_object" }, // Enable JSON mode
    });
    serverLogger.info(
      { ...context },
      `[API /api/ai/suggest-tasks] Received response from OpenAI`
    );

    const completion = response.choices[0]?.message?.content;
    if (!completion) {
      serverLogger.error(
        { ...context },
        `[API /api/ai/suggest-tasks] AI failed to return a valid response`
      );
      throw new Error("AI failed to return a valid response.");
    }

    const parsedJson = JSON.parse(completion);
    const validationSchema = z.object({
      tasks: z.array(AISuggestedTaskSchema),
    });
    const validatedPayload = validationSchema.parse(parsedJson);
    const newValidatedTasks = validatedPayload.tasks;
    serverLogger.info(
      { ...context, newTasksCount: newValidatedTasks.length },
      `[API /api/ai/suggest-tasks] AI response validated`
    );

    // --- ENHANCEMENT: Only add the new tasks, don't delete old ones ---
    if (newValidatedTasks.length > 0) {
      serverLogger.info(
        { ...context, count: newValidatedTasks.length },
        `[API /api/ai/suggest-tasks] Creating new suggestions`
      );
      await prisma.suggestedTask.createMany({
        data: newValidatedTasks.map((task) => ({
          ...task,
          description: task.description ?? null,
          noteId: noteId,
        })),
      });
    }
    serverLogger.info(
      { ...context, noteId },
      `[API /api/ai/suggest-tasks] New suggestions processed in DB`
    );

    // Return all suggestions for the note, including previously added ones.
    const allSuggestionsForNote = await prisma.suggestedTask.findMany({
      where: { noteId: noteId },
      orderBy: { createdAt: "asc" },
    });
    serverLogger.info(
      { ...context, count: allSuggestionsForNote.length },
      `[API /api/ai/suggest-tasks] Returning all suggestions for note`
    );

    return NextResponse.json(allSuggestionsForNote);
  } catch (error: any) {
    if (error instanceof ZodError) {
      serverLogger.error(
        { ...context, err: error.issues },
        `[API /api/ai/suggest-tasks] Zod validation failed for AI response`
      );
      return new Response(
        JSON.stringify({
          error: "AI response validation failed",
          details: error.issues,
        }),
        { status: 400 }
      );
    }
    serverLogger.error(
      { ...context, err: error },
      `[API /api/ai/suggest-tasks] An internal error occurred`
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
