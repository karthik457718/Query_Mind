"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import Magnetic from "@/components/Magnetic";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { href: "/home", label: "Databases" },
];

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <header className="animate-fade-in-up sticky top-0 z-40 border-b border-white/8 bg-graphite/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/home" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-violet font-display text-sm font-bold text-graphite">
            Q
          </span>
          <span className="font-display text-lg font-bold text-ink">QueryMind</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "text-graphite" : "text-mist hover:text-ink"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-gold to-violet" />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Magnetic strength={20}>
            <button
              onClick={handleLogout}
              className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-mist backdrop-blur-md transition hover:bg-white/10 hover:text-ink"
            >
              Log out
            </button>
          </Magnetic>
        </div>
      </div>
    </header>
  );
}
