import type { Metadata } from "next";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
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
      <body className="min-h-screen bg-night text-slate-100 antialiased" suppressHydrationWarning>
        <header className="sticky top-0 z-40 border-b border-line bg-night/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <Link href="/" className="focus-ring rounded-sm">
                <span className="block text-2xl font-semibold tracking-normal text-white">POE Market Watch</span>
                <span className="text-sm text-slate-400">POE1 3.28 Mirage / 遠古蜃景</span>
              </Link>
              <p className="max-w-xl text-sm text-slate-400">
                追蹤保險箱、譫妄玉、聖甲蟲與高價掉落。熱度是 poe.ninja 市場活動欄位的估算，不代表官方實際成交量。
              </p>
            </div>
            <HeaderNav items={navItems} />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
