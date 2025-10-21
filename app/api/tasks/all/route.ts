// File: E:/projects/sorties/task-management/task-manager-app/app/api/tasks/all/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serverLogger } from "@/lib/logger";

export async function DELETE(request: Request) {
  const context = { req: { method: request.method, url: request.url } };
  serverLogger.info(context, `[API /api/tasks/all] DELETE request received`);
  try {
    await prisma.$transaction([
      prisma.task.deleteMany({}),
      prisma.note.deleteMany({}),
    ]);
    serverLogger.info(
      context,
      `[API /api/tasks/all] All tasks and notes deleted successfully`
    );

    revalidatePath("/");
    revalidatePath("/tasks");
    revalidatePath("/calendar");
    revalidatePath("/analytics");
    revalidatePath("/notes");

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    serverLogger.error(
      { ...context, err: error },
      `[API /api/tasks/all] Failed to delete all data`
    );
    return NextResponse.json(
      { error: "Failed to delete all data" },
      { status: 500 }
    );
  }
}
