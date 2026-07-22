import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuideData, getGuideMeta } from "@/lib/guides";
import { getOverride } from "@/lib/overrides";
import { MissionEditor } from "@/components/admin/MissionEditor";

export default async function AdminMissionPage({
  params,
}: {
  params: Promise<{ slug: string; mision: string }>;
}) {
  const { slug, mision: encodedMision } = await params;
  const mision = decodeURIComponent(encodedMision);

  const guide = getGuideMeta(slug);
  if (!guide) notFound();

  const quest = getGuideData(slug).misiones.find((m) => m.mision === mision);
  if (!quest) notFound();

  const override = await getOverride(mision);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10 flex-1 w-full">
      <Link
        href={`/admin/${slug}`}
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← {guide.nombre}
      </Link>
      <h1 className="text-xl font-bold mt-3 mb-6">Traducir misión</h1>

      <MissionEditor
        slug={slug}
        mision={mision}
        link={quest.link}
        initialNombreEs={override?.nombreEs ?? null}
        initialPasos={override?.pasos ?? []}
      />
    </main>
  );
}
