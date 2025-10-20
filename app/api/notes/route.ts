import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = noteSchema.parse(body);

    const newNote = await prisma.note.create({
      data: validatedData,
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create note", details: error },
      { status: 400 }
    );
  }
}
