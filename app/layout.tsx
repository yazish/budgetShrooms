import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BudgetShrooms",
  description: "Minimalist personal budgeting app for quick expense tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-stone-100 text-slate-900">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-stone-100 text-slate-900 font-sans antialiased`}
      >
        <div className="relative min-h-screen">
          <main className="pt-4 md:pt-8">
            <div className="mx-auto flex w-full max-w-6xl justify-end px-4 md:px-6 lg:px-8">
              <Link
                href="/about"
                className="mb-6 inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors duration-200 hover:border-slate-300 hover:text-slate-900 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 active:scale-95"
              >
                About
              </Link>
            </div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
