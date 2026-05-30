"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ORDER_KEY, useStoredOrder } from "./preferences";

export type NavItem = {
  href: string;
  label: string;
};

type Props = {
  items: NavItem[];
};

export function HeaderNav({ items }: Props) {
  const pathname = usePathname();
  const defaults = items.map((item) => item.href);
  const { order, move, reset } = useStoredOrder(NAV_ORDER_KEY, defaults);
  const sortedItems = order.map((href) => items.find((item) => item.href === href)).filter((item): item is NavItem => Boolean(item));

  return (
    <div className="space-y-2">
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {sortedItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <div key={item.href} className="flex shrink-0 overflow-hidden rounded-md border border-line bg-slate-950/70">
              <Link
                href={item.href}
                className={`focus-ring whitespace-nowrap px-3 py-2 text-sm transition ${
                  isActive ? "bg-amber-400 text-slate-950" : "text-slate-200 hover:bg-amber-400/10"
                }`}
              >
                {item.label}
              </Link>
              <button
                type="button"
                className="focus-ring border-l border-line px-2 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                disabled={order.indexOf(item.href) === 0}
                onClick={() => move(item.href, -1)}
                title="往左移動導覽項目"
              >
                ←
              </button>
              <button
                type="button"
                className="focus-ring border-l border-line px-2 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                disabled={order.indexOf(item.href) === order.length - 1}
                onClick={() => move(item.href, 1)}
                title="往右移動導覽項目"
              >
                →
              </button>
            </div>
          );
        })}
      </nav>
      <button type="button" className="focus-ring text-xs text-slate-500 hover:text-slate-300" onClick={reset}>
        重設導覽順序
      </button>
    </div>
  );
}
