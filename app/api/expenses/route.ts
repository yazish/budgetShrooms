import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  formatMonthIdentifier,
  getMonthRange,
  parseMonth,
} from "@/lib/dates";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month");
  const month = monthParam && parseMonth(monthParam) ? monthParam : formatMonthIdentifier(new Date());

  const { start, end } = getMonthRange(month);
  const expenses = await prisma.expense.findMany({
    where: {
      userId: session.userId,
      occurredAt: {
        gte: start,
        lt: end,
      },
    },
    orderBy: { occurredAt: "desc" },
    select: {
      id: true,
      amountCents: true,
      note: true,
      occurredAt: true,
    },
  });

  const totalCents = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);

  return NextResponse.json({
    month,
    totalCents,
    items: expenses.map((expense) => ({
      id: expense.id,
      amountCents: expense.amountCents,
      note: expense.note,
      occurredAt: expense.occurredAt.toISOString(),
    })),
  });
}
