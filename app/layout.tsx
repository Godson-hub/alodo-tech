import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alodo Tech - Gestion scolaire",
  description: "Plateforme de gestion scolaire",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900">
        <nav className="bg-blue-900 text-white shadow-md">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
            <span className="font-bold text-lg mr-4">🎓 Alodo Tech</span>
            <Link href="/professeurs" className="hover:text-blue-200 transition">
              Professeurs
            </Link>
            <Link href="/classes" className="hover:text-blue-200 transition">
              Classes
            </Link>
            <Link href="/eleves" className="hover:text-blue-200 transition">
              Élèves
            </Link>
            <Link href="/assignations" className="hover:text-blue-200 transition">
              Assignations
            </Link>
            <Link href="/mes-classes" className="hover:text-blue-200 transition">
              Mes classes
            </Link>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
