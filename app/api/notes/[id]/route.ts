// File: E:/projects/sorties/task-management/task-manager-app/app/api/notes/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z, ZodError } from "zod";
import { serverLogger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

const noteUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const context = {
    req: { method: request.method, url: request.url, params: { id } },
  };
  serverLogger.info(context, `[API /api/notes/[id]] GET request received`);
  try {
    const note = await prisma.note.findUnique({
      where: { id: id },
    });
    if (!note) {
      serverLogger.warn(context, `[API /api/notes/[id]] Note not found`);
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch (error) {
    serverLogger.error(
      { ...context, err: error },
      `[API /api/notes/[id]] Failed to fetch note`
    );
    return NextResponse.json(
      { error: "Failed to fetch note" },
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
  serverLogger.info(context, `[API /api/notes/[id]] PATCH request received`);
  try {
    const body = await request.json();
    serverLogger.info(
      { ...context, body },
      `[API /api/notes/[id]] Parsed request body`
    );
    const validatedData = noteUpdateSchema.parse(body);
    serverLogger.info(
      { ...context },
      `[API /api/notes/[id]] Validation successful`
    );

    const updatedNote = await prisma.note.update({
      where: { id: id },
      data: validatedData,
    });
    serverLogger.info(
      { ...context, noteId: updatedNote.id },
      `[API /api/notes/[id]] Note updated successfully`
    );

    return NextResponse.json(updatedNote);
  } catch (error) {
    if (error instanceof ZodError) {
      serverLogger.error(
        { ...context, err: error.issues },
        `[API /api/notes/[id]] Zod validation failed`
      );
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    serverLogger.error(
      { ...context, err: error },
      `[API /api/notes/[id]] Failed to update note`
    );
    return NextResponse.json(
      { error: "Failed to update note", details: error },
      { status: 500 }
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
  serverLogger.info(context, `[API /api/notes/[id]] DELETE request received`);
  try {
    await prisma.note.delete({
      where: { id: id },
    });
    serverLogger.info(
      context,
      `[API /api/notes/[id]] Note deleted successfully`
    );
    revalidatePath("/notes"); // Revalidate the notes list page
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    serverLogger.error(
      { ...context, err: error },
      `[API /api/notes/[id]] Failed to delete note`
    );
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
