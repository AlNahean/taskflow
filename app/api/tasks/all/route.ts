// File: E:/projects/sorties/task-management/task-manager-app/app/api/tasks/all/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function DELETE() {
  try {
    await prisma.$transaction([
      prisma.task.deleteMany({}),
      prisma.note.deleteMany({}),
    ]);

    // --- THIS IS THE FIX ---
    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath("/calendar");
    revalidatePath("/analytics");
    revalidatePath("/notes");

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete all data:", error);
    return NextResponse.json(
      { error: "Failed to delete all data" },
      { status: 500 }
    );
  }
}
