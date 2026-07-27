import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { GUIDES } from "@/lib/guides";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Guías de misiones Dofus",
    template: "%s | Guías de misiones Dofus",
  },
  description:
    "Guías de misiones por Dofus y guía completa optimizada del 1 al 200, con zona, coordenadas y enlace de ayuda para cada misión.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const completo = GUIDES.find((g) => g.categoria === "completo")!;

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider>
          <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
              <Link
                href="/"
                className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 shrink-0"
              >
                Dofus<span className="text-amber-500">Guías</span>
              </Link>

              <nav className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 overflow-x-auto">
                <Link
                  href="/"
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap"
                >
                  Todas las guías
                </Link>
                <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700 whitespace-nowrap">
                  {GUIDES.length} guías
                </span>
                <LanguageToggle />
                <Link
                  href={`/guias/${completo.slug}`}
                  className="shrink-0 rounded-md bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-amber-400 transition-colors whitespace-nowrap"
                >
                  Guía completa
                </Link>
              </nav>
            </div>
          </header>

          {children}

          <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-8 text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-2">
              <span>Datos de misiones de duffus.fr</span>
              <span>
                Enlaces de ayuda vía{" "}
                <a
                  href="https://www.dofuspourlesnoobs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  Dofus pour les noobs
                </a>
              </span>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
