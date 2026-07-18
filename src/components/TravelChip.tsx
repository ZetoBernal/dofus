"use client";

import { useState } from "react";

/** A partir de "[-3,-3]" arma el comando real de Dofus: "/travel -3,-3" */
export function travelCommand(coordenadas: string): string {
  return `/travel ${coordenadas.replace(/[[\]]/g, "")}`;
}

export function TravelChip({ coordenadas }: { coordenadas: string }) {
  const [copiado, setCopiado] = useState(false);
  const comando = travelCommand(coordenadas);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(comando);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // clipboard no disponible: no rompemos la UI
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      title="Copiar comando"
      aria-label={`Copiar ${comando}`}
      className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-xs text-zinc-600 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-amber-800 dark:hover:bg-amber-950 dark:hover:text-amber-400 cursor-pointer"
    >
      {copiado ? (
        <span className="text-emerald-600 dark:text-emerald-400">
          Copiado ✓
        </span>
      ) : (
        comando
      )}
    </button>
  );
}
