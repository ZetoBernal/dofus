"use client";

import { useEffect, useMemo, useState } from "react";
import type { Quest } from "@/lib/guides";
import { loadProgress, saveProgress } from "@/lib/progress";
import { normalize } from "@/lib/normalize";
import { TravelChip } from "./TravelChip";
import { AdSlot } from "./AdSlot";
import { OverlayButton } from "./OverlayButton";

interface ZoneGroup {
  zona: string;
  quests: Quest[];
}

/** Agrupa por zona en tramos consecutivos (preserva el orden de progresión de la guía). */
function groupByZone(quests: Quest[]): ZoneGroup[] {
  const groups: ZoneGroup[] = [];
  for (const q of quests) {
    const zona = q.zona ?? "Sin zona";
    const last = groups[groups.length - 1];
    if (last && last.zona === zona) last.quests.push(q);
    else groups.push({ zona, quests: [q] });
  }
  return groups;
}

function QuestRow({
  quest,
  done,
  onToggle,
}: {
  quest: Quest;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="relative">
      <span
        className={`absolute -left-[25px] top-4 size-2.5 rounded-full border-2 border-white dark:border-zinc-950 ${
          done ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-700"
        }`}
        aria-hidden="true"
      />
      <div
        className={`flex items-start gap-3 rounded-lg border px-3.5 py-3 transition-colors ${
          done
            ? "border-zinc-100 bg-zinc-50/60 dark:border-zinc-900 dark:bg-zinc-900/40"
            : "border-zinc-200 dark:border-zinc-800"
        }`}
      >
        {quest.pnj ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar chico y local, next/image no aporta acá
          <img
            src={quest.pnj.img}
            alt={quest.pnj.nombre}
            title={quest.pnj.nombre}
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full object-cover bg-zinc-100 dark:bg-zinc-800"
          />
        ) : (
          <div className="size-10 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        )}

        <div className="flex-1 min-w-0">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={done}
              onChange={onToggle}
              className="size-4 shrink-0 rounded border-zinc-300 text-amber-500 focus:ring-amber-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <a
              href={quest.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`text-sm font-medium hover:underline ${
                done
                  ? "text-zinc-400 line-through dark:text-zinc-600"
                  : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {quest.mision}
            </a>
          </label>

          <div className="flex flex-wrap items-center gap-2 mt-2 pl-7">
            {quest.coordenadas && <TravelChip coordenadas={quest.coordenadas} />}

            {quest.donjon && (
              <a
                href={quest.donjon.link}
                target="_blank"
                rel="noopener noreferrer"
                title={`Mazmorra: ${quest.donjon.nombre}`}
                className="inline-flex items-center gap-1 rounded-full bg-violet-50 pl-1 pr-2 py-0.5 text-[11px] font-medium text-violet-700 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300 dark:hover:bg-violet-900"
              >
                {quest.donjon.img ? (
                  // eslint-disable-next-line @next/next/no-img-element -- ícono chico y local
                  <img src={quest.donjon.img} alt="" className="size-4 rounded-sm" />
                ) : (
                  <span aria-hidden="true">⚔</span>
                )}
                {quest.donjon.nombre}
              </a>
            )}

            {quest.recursos.map((r, i) => (
              <span
                key={`${r.nombre}-${i}`}
                title={`${r.nombre} ${r.cantidad}`}
                aria-label={`${r.nombre} ${r.cantidad}`}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 pl-1 pr-2 py-0.5 text-[11px] text-zinc-500 dark:text-zinc-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- ícono chico y local */}
                <img src={r.img} alt="" className="size-4 rounded-sm" />
                {r.cantidad}
              </span>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

function ZoneSection({
  group,
  completed,
  onToggle,
  onCheckAll,
  onUncheckAll,
}: {
  group: ZoneGroup;
  completed: Set<string>;
  onToggle: (mision: string) => void;
  onCheckAll: (misiones: string[]) => void;
  onUncheckAll: (misiones: string[]) => void;
}) {
  const groupDone = group.quests.filter((q) => completed.has(q.mision)).length;
  const allDone = groupDone === group.quests.length;
  const misiones = group.quests.map((q) => q.mision);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="size-2 rounded-full bg-amber-500 shrink-0" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {group.zona}
        </h2>
        <span className="text-xs text-zinc-300 dark:text-zinc-700">
          {groupDone}/{group.quests.length}
        </span>
        <button
          type="button"
          onClick={() => (allDone ? onUncheckAll(misiones) : onCheckAll(misiones))}
          className="ml-auto text-[11px] text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors cursor-pointer"
        >
          {allDone ? "Desmarcar todas" : "Marcar todas"}
        </button>
      </div>
      <ol className="relative ml-2.5 flex flex-col gap-2.5 border-l border-zinc-200 pl-6 dark:border-zinc-800">
        {group.quests.map((q) => (
          <QuestRow
            key={q.mision}
            quest={q}
            done={completed.has(q.mision)}
            onToggle={() => onToggle(q.mision)}
          />
        ))}
      </ol>
    </div>
  );
}

export function QuestChecklist({
  slug,
  guideName,
  quests,
  rangos,
}: {
  slug: string;
  guideName: string;
  quests: Quest[];
  rangos?: string[];
}) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [rango, setRango] = useState(rangos?.[0] ?? null);

  // Se carga después del montaje (client-only) para que el primer render
  // coincida con el HTML estático del servidor y no rompa la hidratación.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync deliberado desde localStorage, no hay forma de leerlo en el render de servidor
    setCompleted(loadProgress(slug));
  }, [slug]);

  function toggle(mision: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(mision)) next.delete(mision);
      else next.add(mision);
      saveProgress(slug, next);
      return next;
    });
  }

  function checkAll(misiones: string[]) {
    setCompleted((prev) => {
      const next = new Set(prev);
      misiones.forEach((m) => next.add(m));
      saveProgress(slug, next);
      return next;
    });
  }

  function uncheckAll(misiones: string[]) {
    setCompleted((prev) => {
      const next = new Set(prev);
      misiones.forEach((m) => next.delete(m));
      saveProgress(slug, next);
      return next;
    });
  }

  function reset() {
    setCompleted(new Set());
    saveProgress(slug, new Set());
  }

  const questsEnRango = useMemo(() => {
    if (!rangos || !rango) return quests;
    return quests.filter((q) => q.rango === rango);
  }, [quests, rangos, rango]);

  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    const q = normalize(query);
    // La búsqueda ignora el filtro de rango: tiene sentido encontrar una
    // misión sin tener que adivinar en qué pestaña de nivel está.
    return quests.filter((quest) => normalize(quest.mision).includes(q));
  }, [quests, query]);

  const groups = useMemo(() => groupByZone(questsEnRango), [questsEnRango]);

  const total = quests.length;
  const done = completed.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
            <span>
              {done} / {total} completadas
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <OverlayButton
            guideName={guideName}
            quests={questsEnRango}
            completed={completed}
            onToggle={toggle}
            rangos={rangos}
            rango={rango}
            onRangoChange={setRango}
          />
          {done > 0 && (
            <button
              type="button"
              onClick={reset}
              className="text-xs text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Reiniciar progreso
            </button>
          )}
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar misión..."
        aria-label="Buscar misión"
        className="mb-5 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:placeholder:text-zinc-600"
      />

      {!filtered && rangos && rangos.length > 1 && (
        <div className="mb-6 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rangos.map((r) => {
            const rangoQuests = quests.filter((q) => q.rango === r);
            const rangoDone = rangoQuests.filter((q) => completed.has(q.mision)).length;
            const active = r === rango;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRango(r)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-amber-500 text-zinc-900"
                    : rangoDone === rangoQuests.length
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                Niv. {r}
              </button>
            );
          })}
        </div>
      )}

      {filtered ? (
        filtered.length === 0 ? (
          <p className="text-sm text-zinc-400 py-8 text-center">
            Ninguna misión coincide con &quot;{query}&quot;.
          </p>
        ) : (
          <ol className="relative ml-2.5 flex flex-col gap-2.5 border-l border-zinc-200 pl-6 dark:border-zinc-800">
            {filtered.map((q) => (
              <QuestRow
                key={q.mision}
                quest={q}
                done={completed.has(q.mision)}
                onToggle={() => toggle(q.mision)}
              />
            ))}
          </ol>
        )
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group, i) => (
            <ZoneSection
              key={`${group.zona}-${i}`}
              group={group}
              completed={completed}
              onToggle={toggle}
              onCheckAll={checkAll}
              onUncheckAll={uncheckAll}
            />
          ))}
          {!rangos && groups.length > 12 && (
            <AdSlot variant="banner" />
          )}
        </div>
      )}
    </div>
  );
}
