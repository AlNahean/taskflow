// File: E:/projects/sorties/task-management/task-manager-app/app/api/tasks/all/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE() {
  try {
    // Using a transaction to delete from both tables
    await prisma.$transaction([
      prisma.task.deleteMany({}),
      prisma.note.deleteMany({}),
    ]);

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error("Failed to delete all data:", error);
    return NextResponse.json(
      { error: "Failed to delete all data" },
      { status: 500 }
    );
  }
}
