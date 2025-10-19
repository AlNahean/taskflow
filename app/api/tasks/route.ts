import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateTaskSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // The form sends a date object which gets stringified, zod coerces it back
    const validatedData = CreateTaskSchema.parse(body);

    const task = await prisma.task.create({
      data: validatedData,
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create task", details: error },
      { status: 400 }
    );
  }
}
