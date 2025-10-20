// File: E:/projects/sorties/task-manager-app/app/api/tasks/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { CreateTaskSchema } from "../../../lib/schemas";
import { revalidatePath } from "next/cache";

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
    const validatedData = CreateTaskSchema.parse(body);

    const newTask = await prisma.task.create({
      data: validatedData,
    });

    // --- THIS IS THE FIX ---
    // Invalidate the cache for pages that display tasks
    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath("/calendar");
    revalidatePath("/analytics");

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task", details: error },
      { status: 400 }
    );
  }
}
