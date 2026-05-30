import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "POE Market Watch",
  description: "Path of Exile 1 Mirage market monitoring dashboard"
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/scarabs", label: "聖甲蟲" },
  { href: "/delirium-orbs", label: "譫妄玉" },
  { href: "/beasts", label: "野獸" },
  { href: "/divination-cards", label: "命運卡" },
  { href: "/fragments-currency", label: "碎片與通貨" }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-night text-slate-100 antialiased">
        <header className="sticky top-0 z-40 border-b border-line bg-night/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <Link href="/" className="focus-ring rounded-sm">
                <span className="block text-2xl font-semibold tracking-normal text-white">POE Market Watch</span>
                <span className="text-sm text-slate-400">POE1 3.28 Mirage / 遠古蜃景</span>
              </Link>
              <p className="max-w-xl text-sm text-slate-400">
                熱度為 poe.ninja 掛單與價格追蹤資料推估，不代表官方實際成交量。
              </p>
            </div>
            <nav className="flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="focus-ring whitespace-nowrap rounded-md border border-line px-3 py-2 text-sm text-slate-200 transition hover:border-amber-400/60 hover:bg-amber-400/10"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
