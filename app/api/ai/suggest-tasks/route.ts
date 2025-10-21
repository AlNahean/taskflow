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

// Zod schema for validating the AI's output, now including subtasks
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
  subtasks: z.array(z.object({ text: z.string() })).optional(),
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
    const { prompt, noteId, model } = await req.json();
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
      1.  Your entire response MUST be a single, valid JSON object: { "tasks": [...] }.
      2.  Each task object must contain "title", "description", "status", "priority", "category", "startDate", "dueDate", and an optional "subtasks" array.
      3.  If a task can be broken down into smaller, concrete steps, add them to the "subtasks" array. Each subtask should be an object like {"text": "Step description"}.
      4.  'status' must always be "todo".
      5.  CRITICAL: A list of existing suggestions is provided. Identify ONLY NEW tasks from the user's note that are NOT in this list. If no new tasks are found, return an empty "tasks" array.

      ${existingTasksContext}
      `;

    // Provide the current date to the AI for accurate relative date calculation
    const userPromptWithDateContext = `Based on the current date of ${new Date().toISOString()}, analyze the following note:\n\n---\n\n${prompt}`;

    const response = await openai.chat.completions.create({
      model: model || "gpt-4-turbo",
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
          subtasks: task.subtasks ? { subtasks: task.subtasks } : undefined, // Store subtasks in the JSON field
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
