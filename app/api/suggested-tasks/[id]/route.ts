// File: app/api/suggested-tasks/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  isAdded: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateSchema.parse(body);

    const updatedSuggestion = await prisma.suggestedTask.update({
      where: { id: params.id },
      data: {
        isAdded: validatedData.isAdded,
      },
    });

    return NextResponse.json(updatedSuggestion);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update suggestion", details: error },
      { status: 400 }
    );
  }
}
