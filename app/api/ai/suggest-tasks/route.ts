// File: app/api/ai/suggest-tasks/route.ts
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import prisma from "@/lib/prisma";
import { z } from "zod";

// This route can't be edge-compatible because it needs to access the database.
// export const runtime = "edge";

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
  if (!process.env.OPENAI_API_KEY) {
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

    if (!noteId) {
      return new Response(JSON.stringify({ error: "noteId is required." }), {
        status: 400,
      });
    }

    if (!prompt || prompt.length < 10) {
      return new Response(
        JSON.stringify({ error: "Note must be at least 10 characters long." }),
        { status: 400 }
      );
    }

    const systemPrompt = `You are a world-class task management assistant. Your purpose is to analyze a user's note and extract a list of actionable tasks.

      You MUST adhere to the following rules:
      1.  Your entire response MUST be a single, valid JSON object: { "tasks": [...] }. Do NOT include any markdown, explanations, or other text.
      2.  The "tasks" array must contain objects with these exact keys: "title", "description", "status", "priority", "category", "startDate", "dueDate".
      3.  'status' must always be "todo".
      4.  Your response should be a JSON object.
      4.  Analyze the text for keywords to determine 'priority':
          - 'urgent', 'asap', 'critical' -> "high"
          - 'important', 'soon' -> "medium"
          - Otherwise, default to "low".
      5.  Analyze the text for keywords to determine 'category':
          - 'buy', 'order', 'purchase' -> "shopping"
          - 'doctor', 'gym', 'workout', 'appointment' -> "health"
          - 'project', 'meeting', 'report', 'client' -> "work"
          - Otherwise, default to "personal".
      6.  MOST IMPORTANTLY: Analyze the text for dates. You will be given the current date for context.
          - Convert all relative dates (e.g., 'today', 'tomorrow', 'next Friday', 'in 2 weeks', 'end of the month') into an absolute ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ).
          - If a task has only one date, use it for both 'startDate' and 'dueDate'.
          - If a date range is implied (e.g., "work on the report this week"), set 'startDate' to the beginning of the range and 'dueDate' to the end.
      7.  If a field cannot be inferred, provide a sensible default. 'description' can be null.

      Example:
      User Note: "urgent meeting with the client tomorrow to review the project. also need to buy a new keyboard."
      Your JSON Response:
      {
        "tasks": [
          {
            "title": "Meeting with client to review project",
            "description": null,
            "status": "todo",
            "priority": "high",
            "category": "work",
            "startDate": "YYYY-MM-DDTHH:mm:ss.sssZ", // Tomorrow's date
            "dueDate": "YYYY-MM-DDTHH:mm:ss.sssZ"   // Tomorrow's date
          },
          {
            "title": "Buy a new keyboard",
            "description": null,
            "status": "todo",
            "priority": "low",
            "category": "shopping",
            "startDate": "YYYY-MM-DDTHH:mm:ss.sssZ", // Today's date
            "dueDate": "YYYY-MM-DDTHH:mm:ss.sssZ"   // Today's date
          }
        ]
      }`;

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

    const completion = response.choices[0]?.message?.content;
    if (!completion) {
      throw new Error("AI failed to return a valid response.");
    }

    const parsedJson = JSON.parse(completion);
    const validationSchema = z.object({
      tasks: z.array(AISuggestedTaskSchema),
    });
    const validatedPayload = validationSchema.parse(parsedJson);
    const validatedTasks = validatedPayload.tasks;

    // Transaction: Delete old (un-added) suggestions and create new ones.
    await prisma.$transaction(async (tx) => {
      await tx.suggestedTask.deleteMany({
        where: {
          noteId: noteId,
          isAdded: false,
        },
      });

      if (validatedTasks.length > 0) {
        await tx.suggestedTask.createMany({
          data: validatedTasks.map((task) => ({
            ...task,
            description: task.description ?? null,
            noteId: noteId,
          })),
        });
      }
    });

    // Return all suggestions for the note, including previously added ones.
    const allSuggestionsForNote = await prisma.suggestedTask.findMany({
      where: { noteId: noteId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(allSuggestionsForNote);
  } catch (error: any) {
    console.error("--- [API] An error occurred in AI suggestion route:", error);
    return new Response(
      JSON.stringify({
        error: "An internal error occurred.",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
