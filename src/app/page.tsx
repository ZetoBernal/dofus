import Link from "next/link";
import { GUIDES, getGuideData } from "@/lib/guides";
import { GuideExplorer } from "@/components/GuideExplorer";
import { AdSlot } from "@/components/AdSlot";

export default function Home() {
  const completo = GUIDES.find((g) => g.categoria === "completo")!;
  const completoData = getGuideData(completo.slug);

  const dofusGuides = GUIDES.filter((g) => g.categoria === "dofus").map((g) => {
    const data = getGuideData(g.slug);
    return { ...g, total: data.misiones.length, icono: data.icono };
  });
  const otras = GUIDES.filter((g) => g.categoria === "otras").map((g) => {
    const data = getGuideData(g.slug);
    return { ...g, total: data.misiones.length, icono: data.icono };
  });

  const iconStrip = dofusGuides.filter((g) => g.icono).slice(0, 7);

  return (
    <main className="flex-1 w-full">
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-amber-100 via-white to-white dark:from-amber-950/30 dark:via-zinc-950 dark:to-zinc-950"
        />

        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28">
          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-500 mb-3">
                Guías de misiones
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-2xl">
                Conseguí tus Dofus sin perderte en el camino
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-4 max-w-xl">
                Cada misión con su zona, coordenadas listas para{" "}
                <code className="text-sm px-1 py-0.5 rounded bg-amber-100 dark:bg-zinc-800">
                  /travel
                </code>{" "}
                y un enlace de ayuda. Marcá lo que ya hiciste y seguí donde
                quedaste.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-8">
                <Link
                  href={`/guias/${completo.slug}`}
                  className="rounded-lg bg-amber-500 px-6 py-3 text-base font-semibold text-zinc-900 shadow-sm shadow-amber-500/30 hover:bg-amber-400 hover:shadow-md hover:shadow-amber-500/40 transition-all"
                >
                  Ver guía completa (1 a 200) →
                </Link>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {GUIDES.length} guías · {completoData.misiones.length} misiones en la ruta óptima
                </span>
              </div>
            </div>

            {completoData.icono && (
              // eslint-disable-next-line @next/next/no-img-element -- ícono local, decorativo
              <img
                src={completoData.icono}
                alt=""
                className="hidden sm:block size-32 shrink-0 rounded-3xl border border-amber-200 bg-white object-contain p-3 shadow-lg shadow-amber-500/10 dark:border-amber-900 dark:bg-zinc-900"
              />
            )}
          </div>

          {iconStrip.length > 0 && (
            <div className="flex items-center gap-3 mt-10">
              {iconStrip.map((g) => (
                // eslint-disable-next-line @next/next/no-img-element -- ícono local, decorativo
                <img
                  key={g.slug}
                  src={g.icono!}
                  alt=""
                  title={g.nombre}
                  className="size-10 rounded-full border-2 border-white bg-white object-contain p-1 shadow-sm dark:border-zinc-950 dark:bg-zinc-900"
                />
              ))}
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                y {GUIDES.filter((g) => g.categoria === "dofus").length - iconStrip.length} más
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10 flex gap-10">
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="sticky top-20">
            <AdSlot variant="rectangle" />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <GuideExplorer dofusGuides={dofusGuides} otras={otras} />
        </div>

        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="sticky top-20">
            <AdSlot variant="rectangle" />
          </div>
        </aside>
      </section>
    </main>
  );
}
