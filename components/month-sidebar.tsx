import Link from "next/link";

export type MonthLink = {
  id: string;
  label: string;
};

type MonthSidebarProps = {
  months: MonthLink[];
  activeMonth: string;
};

export function MonthSidebar({ months, activeMonth }: MonthSidebarProps) {
  return (
    <aside className="hidden w-64 flex-shrink-0 md:block">
      <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white/80 px-6 py-6 shadow-sm">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Months
        </p>
        <ul className="space-y-1">
          {months.length === 0 && (
            <li className="rounded-xl px-3 py-2 text-sm font-medium text-slate-400">
              No expenses yet
            </li>
          )}
          {months.map((month) => {
            const isActive = month.id === activeMonth;
            return (
              <li key={month.id}>
                <Link
                  href={`/?month=${month.id}`}
                  className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {month.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
