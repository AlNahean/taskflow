import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z, ZodError } from "zod";
import { serverLogger } from "@/lib/logger";

const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

export async function GET(request: Request) {
  const context = { req: { method: request.method, url: request.url } };
  serverLogger.info(context, `[API /api/notes] GET request received`);
  try {
    const notes = await prisma.note.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
    return NextResponse.json(notes);
  } catch (error) {
    serverLogger.error(
      { ...context, err: error },
      `[API /api/notes] Failed to fetch notes`
    );
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const context = { req: { method: request.method, url: request.url } };
  serverLogger.info(context, `[API /api/notes] POST request received`);
  try {
    const body = await request.json();
    serverLogger.info(
      { ...context, body },
      `[API /api/notes] Parsed request body`
    );
    const validatedData = noteSchema.parse(body);
    serverLogger.info({ ...context }, `[API /api/notes] Validation successful`);

    const newNote = await prisma.note.create({
      data: validatedData,
    });
    serverLogger.info(
      { ...context, noteId: newNote.id },
      `[API /api/notes] Note created successfully in DB`
    );

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      serverLogger.error(
        { ...context, err: error.issues },
        `[API /api/notes] Zod validation failed`
      );
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    serverLogger.error(
      { ...context, err: error },
      `[API /api/notes] Failed to create note`
    );
    return NextResponse.json(
      { error: "Failed to create note", details: error },
      { status: 500 }
    );
  }
}
