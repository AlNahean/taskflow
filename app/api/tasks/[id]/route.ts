// File: E:/projects/sorties/task-management/task-manager-app/app/api/tasks/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UpdateTaskSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { serverLogger } from "@/lib/logger";
import { ZodError } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const context = {
    req: { method: request.method, url: request.url, params: { id } },
  };
  serverLogger.info(context, `[API /api/tasks/[id]] GET request received`);
  try {
    const task = await prisma.task.findUnique({
      where: { id: id },
    });
    if (!task) {
      serverLogger.warn(context, `[API /api/tasks/[id]] Task not found`);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error) {
    serverLogger.error(
      { ...context, err: error },
      `[API /api/tasks/[id]] Failed to fetch task`
    );
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const context = {
    req: { method: request.method, url: request.url, params: { id } },
  };
  serverLogger.info(context, `[API /api/tasks/[id]] PATCH request received`);
  try {
    const body = await request.json();
    serverLogger.info(
      { ...context, body },
      `[API /api/tasks/[id]] Parsed request body`
    );
    const validatedData = UpdateTaskSchema.parse(body);
    serverLogger.info(
      { ...context },
      `[API /api/tasks/[id]] Validation successful`
    );

    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: validatedData,
    });
    serverLogger.info(
      { ...context, taskId: updatedTask.id },
      `[API /api/tasks/[id]] Task updated successfully in DB`
    );

    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${id}`);
    revalidatePath("/calendar");
    revalidatePath("/analytics");

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof ZodError) {
      serverLogger.error(
        { ...context, err: error.issues },
        `[API /api/tasks/[id]] Zod validation failed`
      );
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    serverLogger.error(
      { ...context, err: error },
      `[API /api/tasks/[id]] Failed to update task`
    );
    return NextResponse.json(
      { error: "Failed to update task", details: error },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const context = {
    req: { method: request.method, url: request.url, params: { id } },
  };
  serverLogger.info(context, `[API /api/tasks/[id]] DELETE request received`);
  try {
    const taskId = id;

    await prisma.$transaction(async (tx) => {
      const taskToDelete = await tx.task.findUnique({
        where: { id: taskId },
        select: { suggestedTaskId: true },
      });

      if (taskToDelete && taskToDelete.suggestedTaskId) {
        serverLogger.info(
          { ...context, suggestedTaskId: taskToDelete.suggestedTaskId },
          `[API /api/tasks/[id]] Unlinking suggested task`
        );
        await tx.suggestedTask.update({
          where: { id: taskToDelete.suggestedTaskId },
          data: { isAdded: false },
        });
      }

      serverLogger.info(
        { ...context },
        `[API /api/tasks/[id]] Deleting task from DB`
      );
      await tx.task.delete({
        where: { id: taskId },
      });
    });

    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath("/calendar");
    revalidatePath("/analytics");
    revalidatePath("/notes");

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    serverLogger.error(
      { ...context, err: error },
      `[API /api/tasks/[id]] Failed to delete task`
    );
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
