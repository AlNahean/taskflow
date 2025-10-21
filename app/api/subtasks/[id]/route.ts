import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { serverLogger } from "@/lib/logger";

const updateSubtaskSchema = z.object({
  completed: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const context = {
    req: { method: request.method, url: request.url, params: { id } },
  };
  serverLogger.info(context, `[API /api/subtasks/[id]] PATCH request received`);

  try {
    const body = await request.json();
    const { completed } = updateSubtaskSchema.parse(body);

    const updatedSubtask = await prisma.subTask.update({
      where: { id },
      data: { completed },
    });

    // Revalidate paths to update UI across the app
    revalidatePath("/tasks");
    revalidatePath("/");
    revalidatePath(`/tasks/${updatedSubtask.taskId}`);

    return NextResponse.json(updatedSubtask);
  } catch (error) {
    serverLogger.error(
      { ...context, err: error },
      `[API /api/subtasks/[id]] Failed to update subtask`
    );
    return NextResponse.json(
      { error: "Failed to update subtask" },
      { status: 500 }
    );
  }
}
