"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { GuideMeta } from "@/lib/guides";
import { normalize } from "@/lib/normalize";
import { progressCount } from "@/lib/progress";

type GuideWithTotal = GuideMeta & { total: number; icono: string | null };

function GuideCard({ guide }: { guide: GuideWithTotal }) {
  const [done, setDone] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync deliberado desde localStorage, no hay forma de leerlo en el render de servidor
    setDone(progressCount(guide.slug));
  }, [guide.slug]);

  const pct = done && guide.total > 0 ? Math.round((done / guide.total) * 100) : 0;

  return (
    <Link
      href={`/guias/${guide.slug}`}
      className="group flex gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-amber-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-amber-800"
    >
      {guide.icono ? (
        // eslint-disable-next-line @next/next/no-img-element -- ícono chico y local
        <img
          src={guide.icono}
          alt=""
          className="size-10 shrink-0 rounded-lg border border-zinc-100 bg-zinc-50 object-contain p-1 dark:border-zinc-800 dark:bg-zinc-900"
        />
      ) : (
        <div className="size-10 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-900" />
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-amber-700 dark:group-hover:text-amber-400">
          {guide.nombre}
        </h3>
        <p className="text-xs text-zinc-400 mt-1">Niv. {guide.niveles}</p>
        {done ? (
          <div className="mt-3">
            <div className="h-1 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              {done}/{guide.total}
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-zinc-300 dark:text-zinc-700 mt-3">
            {guide.total} misiones
          </p>
        )}
      </div>
    </Link>
  );
}

export function GuideExplorer({
  dofusGuides,
  otras,
}: {
  dofusGuides: GuideWithTotal[];
  otras: GuideWithTotal[];
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = normalize(query);
    return [...dofusGuides, ...otras].filter((g) => normalize(g.nombre).includes(q));
  }, [query, dofusGuides, otras]);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar una guía... (ej. Ivoire, Bonta)"
        aria-label="Buscar guía"
        className="mb-10 w-full max-w-sm rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-600"
      />

      {results ? (
        results.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Ninguna guía coincide con &quot;{query}&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {results.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        )
      ) : (
        <>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-4">
            Guía por Dofus
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
            {dofusGuides.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>

          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-4">
            Otras guías
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {otras.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
