import Link from "next/link";
import { redirect } from "next/navigation";

import { signUp } from "@/app/actions";
import { getSession } from "@/lib/session";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignupPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  const params = await searchParams;
  const rawError = params?.error;
  const errorValue = Array.isArray(rawError) ? rawError[0] : rawError;

  let errorMessage: string | null = null;
  if (errorValue === "invalid") {
    errorMessage = "Please check the details and try again.";
  } else if (errorValue === "exists") {
    errorMessage = "An account already exists for that email.";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">BudgetShrooms</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500">Start tracking expenses and budgeting smarter.</p>
        {errorMessage && (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        <form action={signUp} className="mt-6 space-y-4 text-left">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="mt-1 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 shadow-sm transition focus:border-slate-400"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 shadow-sm transition focus:border-slate-400"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 shadow-sm transition focus:border-slate-400"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Create account
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-slate-900 hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-6 text-xs text-slate-400">Takes less than a minute to get started.</p>
      </div>
    </div>
  );
}
