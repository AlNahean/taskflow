import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    const total = await prisma.task.count();
    const completed = await prisma.task.count({
      where: { status: "completed" },
    });
    const in_progress = await prisma.task.count({
      where: { status: "in_progress" },
    });
    const overdue = await prisma.task.count({ where: { status: "overdue" } });

    const stats = {
      total,
      completed,
      in_progress,
      overdue,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch task stats" },
      { status: 500 }
    );
  }
}
