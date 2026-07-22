import { prisma } from "@/lib/db";

export interface StepInput {
  texto: string;
  imagen: string | null;
}

export interface MissionOverrideData {
  mision: string;
  nombreEs: string | null;
  pasos: StepInput[];
}

/** Todas las traducciones cargadas, indexadas por nombre de misión (francés). */
export async function getAllOverrides(): Promise<Map<string, MissionOverrideData>> {
  const rows = await prisma.missionOverride.findMany({
    include: { pasos: { orderBy: { orden: "asc" } } },
  });
  const map = new Map<string, MissionOverrideData>();
  for (const row of rows) {
    map.set(row.mision, {
      mision: row.mision,
      nombreEs: row.nombreEs,
      pasos: row.pasos.map((p) => ({ texto: p.texto, imagen: p.imagen })),
    });
  }
  return map;
}

export async function getOverride(mision: string): Promise<MissionOverrideData | null> {
  const row = await prisma.missionOverride.findUnique({
    where: { mision },
    include: { pasos: { orderBy: { orden: "asc" } } },
  });
  if (!row) return null;
  return {
    mision: row.mision,
    nombreEs: row.nombreEs,
    pasos: row.pasos.map((p) => ({ texto: p.texto, imagen: p.imagen })),
  };
}

export async function saveOverride(
  mision: string,
  data: { nombreEs: string | null; pasos: StepInput[] }
): Promise<void> {
  const nombreEs = data.nombreEs?.trim() || null;
  const pasos = data.pasos.filter((p) => p.texto.trim().length > 0);

  await prisma.$transaction(async (tx) => {
    const override = await tx.missionOverride.upsert({
      where: { mision },
      create: { mision, nombreEs },
      update: { nombreEs },
    });
    await tx.step.deleteMany({ where: { overrideId: override.id } });
    if (pasos.length > 0) {
      await tx.step.createMany({
        data: pasos.map((p, i) => ({
          overrideId: override.id,
          orden: i,
          texto: p.texto.trim(),
          imagen: p.imagen,
        })),
      });
    }
  });
}

/** Borra la traducción completa de una misión (nombre + pasos). */
export async function deleteOverride(mision: string): Promise<void> {
  await prisma.missionOverride.deleteMany({ where: { mision } });
}
