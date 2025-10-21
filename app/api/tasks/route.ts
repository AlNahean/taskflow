// File: E:/projects/sorties/task-manager-app/app/api/tasks/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { CreateTaskSchema } from "../../../lib/schemas";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { serverLogger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const context = { req: { method: request.method, url: request.url } };
  serverLogger.info(context, `[API /api/tasks] GET request received`);
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    serverLogger.error(
      { ...context, err: error },
      `[API /api/tasks] Failed to fetch tasks`
    );
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const context = { req: { method: request.method, url: request.url } };
  serverLogger.info(context, `[API /api/tasks] POST request received`);
  try {
    const body = await request.json();
    serverLogger.info(
      { ...context, body },
      `[API /api/tasks] Parsed request body`
    );

    // The suggestionId is destructured here and the rest of the properties
    const { suggestedTaskId, ...taskData } = CreateTaskSchema.parse(body);
    serverLogger.info({ ...context }, `[API /api/tasks] Validation successful`);

    const newTask = await prisma.task.create({
      data: { ...taskData, suggestedTaskId },
    });
    serverLogger.info(
      { ...context, taskId: newTask.id },
      `[API /api/tasks] Task created successfully in DB`
    );

    // Invalidate the cache for pages that display tasks
    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath("/calendar");
    revalidatePath("/analytics");

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      serverLogger.error(
        { ...context, err: error.issues },
        `[API /api/tasks] Zod validation failed`
      );
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    serverLogger.error(
      { ...context, err: error },
      `[API /api/tasks] Failed to create task`
    );
    return NextResponse.json(
      { error: "Failed to create task", details: error },
      { status: 500 } // Changed to 500 for server-side errors
    );
  }
}
