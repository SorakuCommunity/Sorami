"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Compass, Search, Grid3X3, User } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/discover", icon: Compass, label: "Discover" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/genre", icon: Grid3X3, label: "Genre" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] bg-soraku-dark border-r border-soraku-secondary/10 z-[150] hidden lg:flex flex-col items-center py-6">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <div className="w-10 h-10 rounded-lg bg-soraku-primary flex items-center justify-center">
          <span className="text-white font-bold text-lg">S</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col items-center gap-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200",
                isActive
                  ? "text-soraku-primary bg-soraku-primary/10"
                  : "text-soraku-secondary hover:bg-soraku-secondary/10 hover:text-soraku-light"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-soraku-primary rounded-r-full" />
              )}
              <Icon className="w-5 h-5" />
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-soraku-dark border border-soraku-secondary/20 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                <span className="text-sm text-soraku-light font-medium">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <Link
        href="/profile"
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200",
          pathname === "/profile"
            ? "text-soraku-primary bg-soraku-primary/10"
            : "text-soraku-secondary hover:bg-soraku-secondary/10 hover:text-soraku-light"
        )}
      >
        <User className="w-5 h-5" />
      </Link>
    </aside>
  );
}
