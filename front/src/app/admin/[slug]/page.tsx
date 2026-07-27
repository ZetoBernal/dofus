import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuideData, getGuideMeta } from "@/lib/guides";
import { getAllOverrides } from "@/lib/overrides";

export default async function AdminGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideMeta(slug);
  if (!guide) notFound();

  const { misiones } = getGuideData(slug);
  const overrides = await getAllOverrides({ fresh: true });

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 flex-1 w-full">
      <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
        ← Todas las guías
      </Link>
      <h1 className="text-xl font-bold mt-3 mb-1">{guide.nombre}</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        {misiones.length} misiones ·{" "}
        {misiones.filter((m) => overrides.has(m.mision)).length} con traducción
      </p>

      <ol className="flex flex-col gap-1.5">
        {misiones.map((m) => {
          const override = overrides.get(m.mision);
          const traducida = !!override?.nombreEs || (override?.pasos.length ?? 0) > 0;
          return (
            <li key={m.mision}>
              <Link
                href={`/admin/${slug}/${encodeURIComponent(m.mision)}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 hover:border-amber-300 dark:hover:border-amber-800 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.mision}</p>
                  {override?.nombreEs && (
                    <p className="text-xs text-zinc-400 truncate">{override.nombreEs}</p>
                  )}
                </div>
                {traducida ? (
                  <span className="shrink-0 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    ✓ traducida
                  </span>
                ) : (
                  <span className="shrink-0 text-[11px] text-zinc-300 dark:text-zinc-700">
                    sin traducir
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
