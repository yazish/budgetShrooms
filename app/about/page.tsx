import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About | BudgetShrooms",
  description: "Learn about the designer of BudgetShrooms.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col items-center justify-center px-6 py-12">
      <div className="w-full rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <div className="flex flex-col items-center gap-12">
          <div className="relative h-72 w-72 overflow-hidden rounded-full shadow-md ring-2 ring-slate-200">
            <Image
              src="/yazish.jpg"
              alt="Portrait of Yazish Kavina"
              fill
              priority
              sizes="288px"
              className="object-cover"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">About the Designer</h1>
            <p className="text-base leading-relaxed text-slate-700">
              Hi, I am Yazish Kavina, a 3rd year undergrad student at University of Manitoba pursuing Computer
              Science.
            </p>
            <div className="space-y-2 text-left">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Motivation behind the website
              </h2>
              <p className="text-base leading-relaxed text-slate-700">
                I have always found it to be a bit challenging to get to know my expenses for the month.
                The banking apps make these things confusing so I found a need to develop the website.
                This website helps create a simple logging system with a clean UI for ease of use.
              </p>
            </div>
            <div className="space-y-3 text-left">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                White paper
              </h2>
              <p className="text-base leading-relaxed text-slate-700">
                You can also download the white paper that documents the design decisions and component system
                behind BudgetShrooms.
              </p>
              <div className="flex justify-center">
                <Link
                  href="/budgetshrooms_whitepaper.pdf"
                  download
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 20 20"
                    className="h-4 w-4 fill-none stroke-current"
                  >
                    <path
                      d="M10 3v8m0 0l-3-3m3 3l3-3M4 13.5v1A1.5 1.5 0 005.5 16h9a1.5 1.5 0 001.5-1.5v-1"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Download white paper
                </Link>
              </div>
            </div>
            <p className="text-base text-slate-700">
              You can find more about me on{" "}
              <Link
                href="https://linkedin.com/in/yazish-kavina-61630b204"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-900 underline-offset-4 hover:underline"
              >
                LinkedIn
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
