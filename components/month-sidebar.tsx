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
  <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white/90 px-6 py-6 shadow-sm backdrop-blur">
        <div className="mb-5 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-700">
            Mo
          </span>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Months</p>
        </div>

        <ul className="space-y-1.5">
          {months.length === 0 && (
            <li className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm font-medium text-slate-400">
              No expenses yet
            </li>
          )}
          {months.map((month) => {
            const isActive = month.id === activeMonth;
            return (
              <li key={month.id}>
                <Link
                  href={`/?month=${month.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-slate-100 text-slate-900 shadow border border-slate-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span
                    className={`inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full transition ${
                      isActive ? "bg-slate-700" : "bg-slate-300 group-hover:bg-slate-500"
                    }`}
                    aria-hidden
                  />
                  <span>{month.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
