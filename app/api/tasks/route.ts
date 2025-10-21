// File: E:/projects/sorties/task-manager-app/app/api/tasks/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { CreateTaskSchema } from "../../../lib/schemas";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  // ... (GET function is unchanged)
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // The suggestionId is destructured here and the rest of the properties
    // are collected into 'taskData'.
    const { suggestionId, ...taskData } = CreateTaskSchema.parse(body);

    const newTask = await prisma.task.create({
      data: taskData, // Only taskData is passed to Prisma
    });

    // Invalidate the cache for pages that display tasks
    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath("/calendar");
    revalidatePath("/analytics");

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    // This will now catch the Prisma error and other unexpected errors
    console.error("--- [API /tasks POST Error] ---", error);
    return NextResponse.json(
      { error: "Failed to create task", details: error },
      { status: 500 } // Changed to 500 for server-side errors
    );
  }
}
