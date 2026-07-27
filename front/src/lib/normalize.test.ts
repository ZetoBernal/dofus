import { describe, expect, it } from "vitest";
import { normalize } from "./normalize";

describe("normalize", () => {
  it("lowercases and strips accents", () => {
    expect(normalize("Dofus Émeraude")).toBe("dofus emeraude");
  });

  it("trims surrounding whitespace", () => {
    expect(normalize("  Réponses à tout  ")).toBe("reponses a tout");
  });

  it("makes accented and unaccented queries match", () => {
    expect(normalize("Ébène")).toBe(normalize("ebene"));
  });
});
