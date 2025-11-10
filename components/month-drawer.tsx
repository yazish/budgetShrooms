"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { MonthLink } from "@/components/month-sidebar";

type MonthDrawerProps = {
  months: MonthLink[];
  activeMonth: string;
};

export function MonthDrawer({ months, activeMonth }: MonthDrawerProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open month navigation"
        aria-expanded={open}
        aria-controls="month-drawer"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 active:scale-95 active:bg-slate-50 md:hidden"
      >
        <span className="sr-only">Open months</span>
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current">
          <path strokeLinecap="round" strokeWidth="1.5" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />

      <aside
        id="month-drawer"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col bg-gradient-to-b from-white via-slate-50 to-white px-6 py-8 transition-transform duration-200 md:hidden ${
          open ? "translate-x-0 shadow-xl" : "-translate-x-[115%] shadow-none"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-700">
              Mo
            </span>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Months
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 active:scale-95 active:bg-slate-100"
          >
            <span className="sr-only">Close months</span>
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current">
              <path strokeLinecap="round" strokeWidth="1.5" d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>
        <ul className="space-y-1.5 overflow-y-auto">
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
                  onClick={close}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all ${
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
      </aside>
    </>
  );
}
