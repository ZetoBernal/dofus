import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GuideExplorer } from "./GuideExplorer";
import type { GuideMeta } from "@/lib/guides";

const dofusGuides: (GuideMeta & { total: number; icono: string | null })[] = [
  { slug: "dofus-argente", nombre: "Dofus Argenté", niveles: "15 a 40", categoria: "dofus", total: 58, icono: null },
  { slug: "dofus-ivoire", nombre: "Dofus Ivoire", niveles: "200", categoria: "dofus", total: 62, icono: null },
];
const otras: (GuideMeta & { total: number; icono: string | null })[] = [
  { slug: "alignement-bonta", nombre: "Alineación de Bonta", niveles: "20 a 200", categoria: "otras", total: 105, icono: null },
];

beforeEach(() => {
  window.localStorage.clear();
});

describe("GuideExplorer", () => {
  it("shows both sections when there is no search query", () => {
    render(<GuideExplorer dofusGuides={dofusGuides} otras={otras} />);
    expect(screen.getByText("Dofus Argenté")).toBeInTheDocument();
    expect(screen.getByText("Alineación de Bonta")).toBeInTheDocument();
  });

  it("filters guides across sections, accent-insensitively", async () => {
    const user = userEvent.setup();
    render(<GuideExplorer dofusGuides={dofusGuides} otras={otras} />);

    await user.type(screen.getByLabelText(/buscar guía/i), "ivoire");

    expect(screen.getByText("Dofus Ivoire")).toBeInTheDocument();
    expect(screen.queryByText("Dofus Argenté")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<GuideExplorer dofusGuides={dofusGuides} otras={otras} />);

    await user.type(screen.getByLabelText(/buscar guía/i), "zzz");

    expect(screen.getByText(/ninguna guía coincide/i)).toBeInTheDocument();
  });
});
