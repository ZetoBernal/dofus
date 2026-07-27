import { describe, expect, it } from "vitest";
import { GUIDES, getGuideData, getGuideMeta, getQuests } from "./guides";

describe("GUIDES", () => {
  it("has no duplicate slugs", () => {
    const slugs = GUIDES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has exactly one guide in the 'completo' category", () => {
    expect(GUIDES.filter((g) => g.categoria === "completo")).toHaveLength(1);
  });
});

describe("getGuideMeta", () => {
  it("finds a known guide by slug", () => {
    expect(getGuideMeta("dofus-argente")?.nombre).toBe("Dofus Argenté");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getGuideMeta("no-existe")).toBeUndefined();
  });
});

describe("getQuests", () => {
  it("reads real quest data for every guide with the expected shape", () => {
    for (const guide of GUIDES) {
      const quests = getQuests(guide.slug);
      expect(quests.length).toBeGreaterThan(0);
      for (const q of quests) {
        expect(typeof q.mision).toBe("string");
        expect(q.mision.length).toBeGreaterThan(0);
        expect(typeof q.link).toBe("string");
        expect(q.link.startsWith("http")).toBe(true);
      }
    }
  });

  it("does not contain duplicate mission names within a single guide", () => {
    for (const guide of GUIDES) {
      const names = getQuests(guide.slug).map((q) => q.mision);
      expect(new Set(names).size).toBe(names.length);
    }
  });
});

describe("getGuideData", () => {
  it("returns local (non-remote) paths for images, never hotlinked URLs", () => {
    for (const guide of GUIDES) {
      const data = getGuideData(guide.slug);
      if (data.icono) expect(data.icono.startsWith("/images/")).toBe(true);
      if (data.banner) expect(data.banner.startsWith("/images/")).toBe(true);
      for (const q of data.misiones) {
        if (q.pnj) expect(q.pnj.img.startsWith("/images/")).toBe(true);
        for (const r of q.recursos) {
          expect(r.img.startsWith("/images/")).toBe(true);
        }
        if (q.donjon?.img) expect(q.donjon.img.startsWith("/images/")).toBe(true);
      }
    }
  });

  it("most missions in a simple guide have a PNJ portrait", () => {
    const { misiones } = getGuideData("dofus-argente");
    const withPnj = misiones.filter((q) => q.pnj !== null);
    expect(withPnj.length / misiones.length).toBeGreaterThan(0.5);
  });

  it("guide-complet has level-range tabs and every mission is tagged with one", () => {
    const { rangos, misiones } = getGuideData("guide-complet");
    expect(rangos && rangos.length).toBeGreaterThan(1);
    for (const q of misiones) {
      expect(rangos).toContain(q.rango);
    }
  });

  it("regular (non guide-complet) guides don't have level ranges", () => {
    const { rangos } = getGuideData("dofus-argente");
    expect(rangos).toBeUndefined();
  });

  it("some missions across the catalog point to a dungeon", () => {
    const { misiones } = getGuideData("guide-complet");
    const withDonjon = misiones.filter((q) => q.donjon !== null);
    expect(withDonjon.length).toBeGreaterThan(0);
    for (const q of withDonjon) {
      expect(q.donjon!.link.startsWith("http")).toBe(true);
    }
  });
});
