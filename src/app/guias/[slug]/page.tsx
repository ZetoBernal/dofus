import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuideData, getGuideMeta } from "@/lib/guides";
import { QuestChecklist } from "@/components/QuestChecklist";
import { AdSlot } from "@/components/AdSlot";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideMeta(slug);
  if (!guide) return {};

  const total = getGuideData(slug).misiones.length;
  const title = `${guide.nombre} — misiones nivel ${guide.niveles}`;
  const description = `Lista completa de las ${total} misiones de ${guide.nombre} (nivel ${guide.niveles}), con zona, coordenadas y enlace de ayuda para cada una.`;

  return { title, description };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideMeta(slug);
  if (!guide) notFound();

  const { icono, banner, misiones, rangos } = getGuideData(slug);
  const conDonjon = misiones.filter((m) => m.donjon).length;

  return (
    <main className="flex-1 w-full">
      <div className="relative border-b border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {banner && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- imagen de fondo decorativa, local */}
            <img
              src={banner}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full object-cover opacity-60 dark:opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-zinc-950 dark:via-zinc-950/50" />
          </>
        )}

        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-10">
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors"
          >
            ← Todas las guías
          </Link>

          <div className="flex items-center gap-4 mt-4">
            {icono && (
              // eslint-disable-next-line @next/next/no-img-element -- ícono local, tamaño fijo
              <img
                src={icono}
                alt=""
                className="size-16 sm:size-20 shrink-0 rounded-2xl border border-zinc-200 bg-white object-contain p-1.5 shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              />
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-sm">
                {guide.nombre}
              </h1>
              <p className="text-zinc-700 dark:text-zinc-300">
                Nivel {guide.niveles} · {misiones.length} misiones
                {conDonjon > 0 && ` · ${conDonjon} con mazmorra`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 flex gap-10">
        <div className="flex-1 min-w-0 max-w-2xl">
          <QuestChecklist slug={slug} quests={misiones} rangos={rangos} />
        </div>

        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="sticky top-20 space-y-6">
            <AdSlot variant="rectangle" />
            <AdSlot variant="rectangle" />
          </div>
        </aside>
      </div>
    </main>
  );
}
