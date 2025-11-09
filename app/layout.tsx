import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
