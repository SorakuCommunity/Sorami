"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/genre", label: "Genre" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3 md:py-4 transition-all duration-500",
        scrolled
          ? "bg-soraku-dark/95 backdrop-blur"
          : "bg-transparent"
      )}
    >
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button className="lg:hidden text-soraku-light hover:text-soraku-primary transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/">
            <span className="text-xl font-black tracking-tighter">
              SOR<span className="text-soraku-primary">AMI</span>
            </span>
          </Link>
        </div>

        {/* Center: Search bar */}
        <div className="hidden md:block relative flex-1 max-w-md mx-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soraku-secondary" />
          <input
            type="text"
            placeholder="Search anime..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-soraku-surface border border-soraku-surface-light text-soraku-light text-sm placeholder:text-soraku-secondary focus:outline-none focus:border-soraku-primary transition-colors"
          />
        </div>

        {/* Right: Nav links (desktop) */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-medium text-sm transition-colors",
                pathname === link.href
                  ? "text-soraku-primary"
                  : "text-soraku-secondary hover:text-soraku-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
