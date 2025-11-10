import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

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
  const expensesRaw = await prisma.expense.findMany({
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
      amount: true,
      note: true,
      occurredAt: true,
    },
  });

  const expenses = expensesRaw as unknown as Array<{
    id: string;
    amount: Prisma.Decimal;
    note: string | null;
    occurredAt: Date;
  }>;

  const total = expenses.reduce(
    (sum, expense) => sum.plus(expense.amount),
    new Prisma.Decimal(0),
  );
  const totalNumber = Number(total.toFixed(2));

  return NextResponse.json({
    month,
    total: totalNumber,
    items: expenses.map((expense) => ({
      id: expense.id,
      amount: Number(expense.amount.toFixed(2)),
      note: expense.note,
      occurredAt: expense.occurredAt.toISOString(),
    })),
  });
}
