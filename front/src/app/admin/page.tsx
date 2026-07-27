import Link from "next/link";
import { GUIDES } from "@/lib/guides";

export default function AdminDashboard() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10 flex-1 w-full">
      <h1 className="text-xl font-bold mb-1">Guías</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Elegí una guía para traducir sus misiones al español.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/admin/${g.slug}`}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:border-amber-300 dark:hover:border-amber-800 transition-colors"
          >
            <p className="font-medium">{g.nombre}</p>
            <p className="text-xs text-zinc-400 mt-1">Niv. {g.niveles}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
