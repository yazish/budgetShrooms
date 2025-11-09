import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expenses = await prisma.expense.findMany({
    where: { userId: session.userId },
    orderBy: { occurredAt: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amountCents, note, occurredAt } = await request.json();

  const expense = await prisma.expense.create({
    data: {
      amountCents,
      note,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      userId: session.userId,
    },
  });

  return NextResponse.json(expense, { status: 201 });
}