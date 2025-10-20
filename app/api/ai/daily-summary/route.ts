// File: E:/projects/sorties/task-management/task-manager-app/app/api/ai/daily-summary/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { format, startOfToday, endOfToday } from "date-fns";

// REMOVED: export const runtime = 'edge';
// This allows the function to run in the default Node.js runtime, which has database access.

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function formatTasksForAI(tasks: any[]): string {
  if (tasks.length === 0) {
    return "No tasks scheduled for today.";
  }
  return tasks
    .map((t) => `- "${t.title}" (Priority: ${t.priority}, Status: ${t.status})`)
    .join("\n");
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "Server configuration error: The OpenAI API key is missing.",
      }),
      { status: 500 }
    );
  }

  try {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const todaysTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: {
        priority: "desc",
      },
    });

    const tasksContext = formatTasksForAI(todaysTasks);

    const systemPrompt = `You are a friendly and efficient productivity assistant for the TaskFlow app. Your goal is to provide a concise, motivational, and helpful summary of the user's tasks for today.

        Guidelines:
        - Start with a friendly greeting (e.g., "Here's your plan for today!").
        - If there are high-priority tasks, highlight them first. Mention the most important one by name.
        - Give a brief overview of the total number of tasks.
        - If there are no tasks, provide a positive and encouraging message.
        - Keep the entire summary to 2-3 short paragraphs.
        - Respond ONLY with the summary text. Do not include any extra formatting, titles, or JSON.`;

    const userPrompt = `Here are my tasks for today, ${format(
      todayStart,
      "MMMM d, yyyy"
    )}:\n\n${tasksContext}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const summary = response.choices[0]?.message?.content;

    if (!summary) {
      throw new Error("Failed to generate summary from AI.");
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("[API SUMMARY ERROR]", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate summary.",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
