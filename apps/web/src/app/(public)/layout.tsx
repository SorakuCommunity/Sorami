import { Footer } from "@/components/shared/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-soraku-dark">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}