// File: E:/projects/sorties/task-management/task-manager-app/app/api/suggested-tasks/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z, ZodError } from "zod";
import { serverLogger } from "@/lib/logger";

const updateSchema = z.object({
  isAdded: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const context = {
    req: { method: request.method, url: request.url, params: { id } },
  };
  serverLogger.info(
    context,
    `[API /api/suggested-tasks/[id]] PATCH request received`
  );
  try {
    const body = await request.json();
    serverLogger.info(
      { ...context, body },
      `[API /api/suggested-tasks/[id]] Parsed request body`
    );
    const validatedData = updateSchema.parse(body);
    serverLogger.info(
      { ...context },
      `[API /api/suggested-tasks/[id]] Validation successful`
    );

    const updatedSuggestion = await prisma.suggestedTask.update({
      where: { id: id },
      data: {
        isAdded: validatedData.isAdded,
      },
    });
    serverLogger.info(
      { ...context, suggestionId: updatedSuggestion.id },
      `[API /api/suggested-tasks/[id]] Suggestion updated successfully`
    );

    return NextResponse.json(updatedSuggestion);
  } catch (error) {
    if (error instanceof ZodError) {
      serverLogger.error(
        { ...context, err: error.issues },
        `[API /api/suggested-tasks/[id]] Zod validation failed`
      );
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    serverLogger.error(
      { ...context, err: error },
      `[API /api/suggested-tasks/[id]] Failed to update suggestion`
    );
    return NextResponse.json(
      { error: "Failed to update suggestion", details: error },
      { status: 500 }
    );
  }
}
