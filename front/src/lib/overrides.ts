export interface StepInput {
  texto: string;
  imagen: string | null;
}

export interface MissionOverrideData {
  mision: string;
  nombreEs: string | null;
  pasos: StepInput[];
}

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

interface FetchOpts {
  /** Sin cache — para el admin, que necesita ver sus propios cambios al instante. */
  fresh?: boolean;
}

/** Todas las traducciones cargadas, indexadas por nombre de misión (francés). */
export async function getAllOverrides(opts: FetchOpts = {}): Promise<Map<string, MissionOverrideData>> {
  const res = await fetch(`${BACKEND_URL}/api/mission-overrides`, {
    cache: opts.fresh ? "no-store" : undefined,
    next: opts.fresh ? undefined : { revalidate: 60 },
  });
  if (!res.ok) return new Map();
  const rows: MissionOverrideData[] = await res.json();
  return new Map(rows.map((r) => [r.mision, r]));
}

export async function getOverride(
  mision: string,
  opts: FetchOpts = {}
): Promise<MissionOverrideData | null> {
  const res = await fetch(`${BACKEND_URL}/api/mission-overrides/${encodeURIComponent(mision)}`, {
    cache: opts.fresh ? "no-store" : undefined,
    next: opts.fresh ? undefined : { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json();
}
