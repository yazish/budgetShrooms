import { redirect } from "next/navigation";

import { Prisma } from "@prisma/client";

import { createExpense, deleteExpense, signOut, updateBudget } from "@/app/actions";
import { MonthDrawer } from "@/components/month-drawer";
import { MonthSidebar } from "@/components/month-sidebar";
import { SignOutButton } from "@/components/sign-out-button";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  formatCurrency,
  formatExpenseTimestamp,
  formatMonthIdentifier,
  formatMonthTitle,
  getMonthRange,
  parseMonth,
} from "@/lib/dates";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const rawMonth = resolvedSearchParams?.month;
  const monthParam = Array.isArray(rawMonth) ? rawMonth[0] : rawMonth;
  const validSearchMonth = monthParam && parseMonth(monthParam) ? monthParam : null;

  const monthAnchors = await prisma.expense.findMany({
    where: { userId: session.userId },
    orderBy: { occurredAt: "desc" },
    select: { occurredAt: true },
  });

  const monthIdsSorted = Array.from(
    new Set(monthAnchors.map((expense) => formatMonthIdentifier(expense.occurredAt))),
  ).sort((a, b) => b.localeCompare(a));

  const currentMonthId = formatMonthIdentifier(new Date());
  const monthIdsSet = new Set<string>(monthIdsSorted);
  monthIdsSet.add(currentMonthId);
  if (validSearchMonth) {
    monthIdsSet.add(validSearchMonth);
  }

  const monthIds = Array.from(monthIdsSet).sort((a, b) => b.localeCompare(a));
  const activeMonth = validSearchMonth ?? monthIds[0] ?? currentMonthId;

  const monthLinks = monthIds.map((id) => ({
    id,
    label: formatMonthTitle(id),
  }));

  const { start, end } = getMonthRange(activeMonth);
  const expensesRaw = await prisma.expense.findMany({
    where: {
      userId: session.userId,
      occurredAt: {
        gte: start,
        lt: end,
      },
    },
    orderBy: { occurredAt: "desc" },
  });

  const expenses = expensesRaw as unknown as Array<{
    id: string;
    amount: Prisma.Decimal;
    note: string | null;
    occurredAt: Date;
  }>;

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  const currentBudgetSource = (session.user as Record<string, unknown>)
    .currentBudget;
  const currentBudget = Number(currentBudgetSource ?? 0);
  const remainingBudget = currentBudget - totalAmount;
  const formattedBudget = formatCurrency(currentBudget);
  const formattedRemaining = formatCurrency(remainingBudget);
  const remainingIsPositive = remainingBudget >= 0;
  const budgetInputDefault = Number.isFinite(currentBudget)
    ? currentBudget.toFixed(2)
    : "0.00";

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 pb-16 pt-6 sm:px-6 lg:px-8 md:flex-row md:items-start md:gap-12">
        <MonthSidebar months={monthLinks} activeMonth={activeMonth} />
        <div className="flex-1">
          <header className="mb-8 mt-0 rounded-3xl border border-slate-200 bg-white/80 px-6 py-6 shadow-sm backdrop-blur md:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <MonthDrawer months={monthLinks} activeMonth={activeMonth} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    BudgetShrooms
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                    Fast, focused budgeting
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Secure sync is on. Add expenses in seconds and keep months organised.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Signed in
                  </p>
                  <p className="text-sm font-medium text-slate-600">{session.user.email}</p>
                </div>
                <form action={signOut}>
                  <SignOutButton />
                </form>
              </div>
            </div>
          </header>

          <main className="space-y-10 pb-8">
            <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Monthly budget</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Track your monthly limit and adjust it whenever your plan changes.
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-6 text-left">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Budget</dt>
                    <dd className="text-lg font-semibold text-slate-900">{formattedBudget}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Remaining</dt>
                    <dd
                      className={`text-lg font-semibold ${
                        remainingIsPositive ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {formattedRemaining}
                    </dd>
                  </div>
                </dl>
              </div>
              <form
                action={updateBudget}
                className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <label htmlFor="budget" className="text-sm font-medium text-slate-700">
                    Set monthly budget
                  </label>
                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={budgetInputDefault}
                    className="mt-1 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 shadow-sm transition focus:border-slate-400"
                    aria-describedby="budget-helper"
                  />
                  <p id="budget-helper" className="mt-1 text-xs text-slate-500">
                    Enter the amount you plan to spend this month.
                  </p>
                </div>
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:scale-95 active:bg-slate-900/90 active:shadow-inner"
                >
                  Save budget
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">Add expense</h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the amount (cents supported) and add an optional note for quick context.
              </p>
              <form action={createExpense} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label htmlFor="amount" className="text-sm font-medium text-slate-700">
                    Amount (CAD)
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    required
                    placeholder="42"
                    className="mt-1 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-900 shadow-sm transition focus:border-slate-400"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="note" className="text-sm font-medium text-slate-700">
                    Note
                  </label>
                  <input
                    id="note"
                    name="note"
                    maxLength={160}
                    placeholder="Groceries, subway, coffee…"
                    className="mt-1 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 shadow-sm transition focus:border-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:scale-95 active:bg-slate-900/90 active:shadow-inner"
                >
                  Add
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur">
              <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur-sm sm:px-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                      {formatMonthTitle(activeMonth)}
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {formatCurrency(totalAmount)}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500">
                    {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}
                  </p>
                </div>
              </header>
              <ul className="divide-y divide-slate-200">
                {expenses.length === 0 && (
                  <li className="px-6 py-12 text-center text-sm text-slate-500 sm:px-8">
                    Nothing logged this month yet. Add your first expense above.
                  </li>
                )}
                {expenses.map((expense) => (
                  <li key={expense.id} className="px-6 py-4 sm:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {expense.note?.length ? expense.note : "No note provided"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatExpenseTimestamp(expense.occurredAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-base font-semibold text-slate-900">
                          {formatCurrency(Number(expense.amount))}
                        </span>
                        <form action={deleteExpense}>
                          <input type="hidden" name="expenseId" value={expense.id} />
                          <button
                            type="submit"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition hover:border-red-300 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200 active:scale-95"
                            aria-label="Delete expense"
                          >
                            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.6"
                                d="M6 7h12m-9-3h6m-7 3v11a1 1 0 001 1h4a1 1 0 001-1V7"
                              />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
