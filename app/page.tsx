import { redirect } from "next/navigation";

import { createExpense, deleteExpense, signOut } from "@/app/actions";
import { MonthDrawer } from "@/components/month-drawer";
import { MonthSidebar } from "@/components/month-sidebar";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  formatCurrencyFromCents,
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
  const expenses = await prisma.expense.findMany({
    where: {
      userId: session.userId,
      occurredAt: {
        gte: start,
        lt: end,
      },
    },
    orderBy: { occurredAt: "desc" },
  });

  const totalCents = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 pb-16 pt-6 sm:px-6 lg:px-8 md:flex-row md:gap-12">
        <MonthSidebar months={monthLinks} activeMonth={activeMonth} />
        <div className="flex-1">
          <header className="mb-8 rounded-3xl border border-slate-200 bg-white/80 px-6 py-6 shadow-sm backdrop-blur md:px-10">
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
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </header>

          <main className="space-y-10 pb-8">
            <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">Add expense</h2>
              <p className="mt-1 text-sm text-slate-500">
                Amounts are stored as cents. Enter whole dollars and an optional note.
              </p>
              <form action={createExpense} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label htmlFor="amount" className="text-sm font-medium text-slate-700">
                    Amount (CAD)
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    required
                    inputMode="numeric"
                    pattern="\\d*"
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
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
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
                      {formatCurrencyFromCents(totalCents)}
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
                          {formatCurrencyFromCents(expense.amountCents)}
                        </span>
                        <form action={deleteExpense}>
                          <input type="hidden" name="expenseId" value={expense.id} />
                          <button
                            type="submit"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition hover:border-red-300 hover:text-red-600"
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
