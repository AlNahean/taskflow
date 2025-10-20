import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const noteUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: params.id },
    });
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch note" },
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
    const validatedData = noteUpdateSchema.parse(body);

    const updatedNote = await prisma.note.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update note", details: error },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.note.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
