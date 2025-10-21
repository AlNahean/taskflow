// File: E:/projects/sorties/task-management/task-manager-app/app/api/tasks/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UpdateTaskSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

// ... (GET function is unchanged)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = UpdateTaskSchema.parse(body);

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: validatedData,
    });

    // --- THIS IS THE FIX ---
    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${params.id}`);
    revalidatePath("/calendar");
    revalidatePath("/analytics");

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task", details: error },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    await prisma.$transaction(async (tx) => {
      // Step 1: Find the task to see if it's linked to a suggestion.
      const taskToDelete = await tx.task.findUnique({
        where: { id: taskId },
        select: { suggestedTaskId: true }, // We only need the ID of the linked suggestion.
      });

      // Step 2: If it's linked, update the original suggestion to be available again.
      if (taskToDelete && taskToDelete.suggestedTaskId) {
        await tx.suggestedTask.update({
          where: { id: taskToDelete.suggestedTaskId },
          data: { isAdded: false },
        });
      }

      // Step 3: Delete the task itself.
      await tx.task.delete({
        where: { id: taskId },
      });
    });

    // Step 4: Revalidate all relevant paths to update the UI.
    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath("/calendar");
    revalidatePath("/analytics");
    revalidatePath("/notes"); // Ensure note pages reflect the unlinked suggestion.

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error("--- [API DELETE /tasks/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
