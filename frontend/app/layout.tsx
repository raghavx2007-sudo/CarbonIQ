import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CarbonIQ - AI Carbon Footprint Optimization",
  description: "Track, understand, and reduce your carbon footprint with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        {/* WCAG Compliance: Skip to content link */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Skip to main content
        </a>

        <header className="bg-white shadow-sm sticky top-0 z-40">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" aria-label="Main Navigation">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">🌍</span>
              <span className="font-bold text-xl tracking-tight text-emerald-700">CarbonIQ</span>
            </div>
            <div className="flex gap-4">
              <a href="/dashboard" className="text-slate-600 hover:text-emerald-700 font-medium transition-colors">Dashboard</a>
              <a href="/carbon" className="text-slate-600 hover:text-emerald-700 font-medium transition-colors">Log Footprint</a>
              <a href="/ai-coach" className="text-slate-600 hover:text-emerald-700 font-medium transition-colors">AI Coach</a>
            </div>
          </nav>
        </header>

        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
