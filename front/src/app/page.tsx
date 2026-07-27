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

  // Banner ilustrado de una de las guías, reusado como imagen de portada de
  // la landing (misma fuente ya usada en el resto del sitio).
  const heroImage = getGuideData("dofus-cawotte").banner;
  const iconStrip = dofusGuides.filter((g) => g.icono).slice(0, 6);

  return (
    <main className="flex-1 w-full">
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-amber-100 via-white to-white dark:from-amber-950/30 dark:via-zinc-950 dark:to-zinc-950"
        />

        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center gap-10">
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

              {iconStrip.length > 0 && (
                <div className="flex items-center gap-2.5 mt-8">
                  {iconStrip.map((g) => (
                    // eslint-disable-next-line @next/next/no-img-element -- ícono local, decorativo
                    <img
                      key={g.slug}
                      src={g.icono!}
                      alt=""
                      title={g.nombre}
                      className="size-9 rounded-full border-2 border-white bg-white object-contain p-1 shadow-sm dark:border-zinc-950 dark:bg-zinc-900"
                    />
                  ))}
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    y {GUIDES.filter((g) => g.categoria === "dofus").length - iconStrip.length} más
                  </span>
                </div>
              )}
            </div>

            {heroImage && (
              <div className="relative shrink-0 mx-auto lg:mx-0">
                <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-[2rem] overflow-hidden border border-amber-200/60 shadow-xl shadow-amber-500/10 dark:border-amber-900/60">
                  {/* eslint-disable-next-line @next/next/no-img-element -- imagen local, decorativa */}
                  <img
                    src={heroImage}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                {completoData.icono && (
                  // eslint-disable-next-line @next/next/no-img-element -- ícono local, decorativo
                  <img
                    src={completoData.icono}
                    alt=""
                    className="absolute -bottom-5 -left-5 size-20 rounded-2xl border-4 border-white bg-white object-contain p-2 shadow-lg dark:border-zinc-950 dark:bg-zinc-900"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10 flex gap-10">
        <aside className="hidden xl:block w-64 shrink-0 space-y-6">
          <div className="sticky top-20">
            <AdSlot variant="rectangle" />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <GuideExplorer dofusGuides={dofusGuides} otras={otras} />
        </div>

        <aside className="hidden xl:block w-64 shrink-0 space-y-6">
          <div className="sticky top-20">
            <AdSlot variant="rectangle" />
          </div>
        </aside>
      </section>
    </main>
  );
}
