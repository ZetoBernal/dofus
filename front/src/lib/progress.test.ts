import { beforeEach, describe, expect, it } from "vitest";
import { loadProgress, progressCount, saveProgress } from "./progress";

beforeEach(() => {
  window.localStorage.clear();
});

describe("progress storage", () => {
  it("returns an empty set for a guide with no saved progress", () => {
    expect(loadProgress("dofus-argente")).toEqual(new Set());
  });

  it("round-trips a saved set of completed missions", () => {
    saveProgress("dofus-argente", new Set(["Mision A", "Mision B"]));
    expect(loadProgress("dofus-argente")).toEqual(new Set(["Mision A", "Mision B"]));
  });

  it("keeps progress isolated per guide", () => {
    saveProgress("dofus-argente", new Set(["Mision A"]));
    saveProgress("dofus-cawotte", new Set(["Mision Z"]));
    expect(loadProgress("dofus-argente")).toEqual(new Set(["Mision A"]));
    expect(loadProgress("dofus-cawotte")).toEqual(new Set(["Mision Z"]));
  });

  it("progressCount reflects the number of completed missions", () => {
    saveProgress("dofus-argente", new Set(["A", "B", "C"]));
    expect(progressCount("dofus-argente")).toBe(3);
  });

  it("ignores corrupted storage instead of throwing", () => {
    window.localStorage.setItem("dofus-progress:dofus-argente", "{not json");
    expect(loadProgress("dofus-argente")).toEqual(new Set());
  });
});
