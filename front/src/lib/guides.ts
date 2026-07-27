import fs from "node:fs";
import path from "node:path";

export interface QuestPnj {
  nombre: string;
  img: string;
}

export interface QuestRecurso {
  nombre: string;
  cantidad: string;
  img: string;
}

export interface QuestDonjon {
  nombre: string;
  link: string;
  img: string | null;
}

export interface Quest {
  mision: string;
  zona: string | null;
  coordenadas: string | null;
  link: string;
  pnj: QuestPnj | null;
  recursos: QuestRecurso[];
  donjon: QuestDonjon | null;
  /** Solo presente en guide-complet: a qué pestaña de nivel pertenece (ej. "1-20"). */
  rango?: string;
}

export interface GuideData {
  icono: string | null;
  banner: string | null;
  /** Solo presente en guide-complet: las pestañas de nivel, en orden. */
  rangos?: string[];
  misiones: Quest[];
}

export interface GuideMeta {
  slug: string;
  nombre: string;
  niveles: string;
  categoria: "completo" | "dofus" | "otras";
}

// Mismo orden y datos que /guides en duffus.fr
export const GUIDES: GuideMeta[] = [
  { slug: "guide-complet", nombre: "Guía completa optimizada", niveles: "1 a 200", categoria: "completo" },
  { slug: "dofus-argente", nombre: "Dofus Argenté", niveles: "15 a 40", categoria: "dofus" },
  { slug: "dofus-cawotte", nombre: "Dofus Cawotte", niveles: "40 a 80", categoria: "dofus" },
  { slug: "dokoko", nombre: "Dokoko", niveles: "50 a 100", categoria: "dofus" },
  { slug: "dofus-emeraude", nombre: "Dofus Émeraude", niveles: "40 a 110", categoria: "dofus" },
  { slug: "dofus-des-veilleurs", nombre: "Dofus des Veilleurs", niveles: "100", categoria: "dofus" },
  { slug: "dofus-pourpre", nombre: "Dofus Pourpre", niveles: "110 a 130", categoria: "dofus" },
  { slug: "domakuro", nombre: "Domakuro", niveles: "30 a 140", categoria: "dofus" },
  { slug: "dorigami", nombre: "Dorigami", niveles: "140 a 170", categoria: "dofus" },
  { slug: "dofus-turquoise", nombre: "Dofus Turquoise", niveles: "100 a 180", categoria: "dofus" },
  { slug: "dofus-des-glaces", nombre: "Dofus des Glaces", niveles: "100 a 200", categoria: "dofus" },
  { slug: "dofus-tachete", nombre: "Dofus Tacheté", niveles: "200", categoria: "dofus" },
  { slug: "dofus-abyssal", nombre: "Dofus Abyssal", niveles: "200", categoria: "dofus" },
  { slug: "dofus-ivoire", nombre: "Dofus Ivoire", niveles: "200", categoria: "dofus" },
  { slug: "dofus-ebene", nombre: "Dofus Ébène", niveles: "200", categoria: "dofus" },
  { slug: "dofus-nebuleux", nombre: "Dofus Nébuleux", niveles: "100 a 200", categoria: "dofus" },
  { slug: "dofus-vulbis", nombre: "Dofus Vulbis", niveles: "200", categoria: "dofus" },
  { slug: "dofus-forgelave", nombre: "Dofus Forgelave", niveles: "200", categoria: "dofus" },
  { slug: "dofus-du-cauchemar", nombre: "Dofus du Cauchemar", niveles: "200", categoria: "dofus" },
  { slug: "dom-de-pin", nombre: "Dom de Pin", niveles: "200", categoria: "dofus" },
  { slug: "dofus-sylvestre", nombre: "Dofus Sylvestre", niveles: "200", categoria: "dofus" },
  { slug: "dofoozbz", nombre: "Dofoozbz", niveles: "170 a 200", categoria: "dofus" },
  { slug: "alignement-bonta", nombre: "Alineación de Bonta", niveles: "20 a 200", categoria: "otras" },
];

const DATA_DIR = path.join(process.cwd(), "src/data/quests");

export function getGuideMeta(slug: string): GuideMeta | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getGuideData(slug: string): GuideData {
  const file = path.join(DATA_DIR, `${slug}.json`);
  const raw = fs.readFileSync(file, "utf-8");
  return JSON.parse(raw) as GuideData;
}

export function getQuests(slug: string): Quest[] {
  return getGuideData(slug).misiones;
}
