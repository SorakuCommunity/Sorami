import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { TRPCProvider } from "@/lib/trpc";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sorami - Stream Anime Online",
  description:
    "Sorami is a clean, calm platform for streaming your favorite anime series and movies anytime, anywhere.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.className}`}>
      <body className="bg-soraku-dark text-soraku-light antialiased min-h-screen">
        <TRPCProvider>
          <Navbar />
          {children}
          <MobileNav />
        </TRPCProvider>
      </body>
    </html>
  );
}
