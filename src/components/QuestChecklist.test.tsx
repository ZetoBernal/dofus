import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestChecklist } from "./QuestChecklist";
import { loadProgress } from "@/lib/progress";
import type { Quest } from "@/lib/guides";

const quests: Quest[] = [
  {
    mision: "Mort au rat !",
    zona: "Incarnam",
    coordenadas: "[0,-3]",
    link: "https://example.com/a",
    pnj: { nombre: "Berb", img: "/images/pnj/berb.png" },
    recursos: [{ nombre: "Ortie", cantidad: "×4", img: "/images/recursos/1.png" }],
    donjon: null,
  },
  {
    mision: "Vu du ciel",
    zona: "Astrub",
    coordenadas: "[-1,-3]",
    link: "https://example.com/b",
    pnj: null,
    recursos: [],
    donjon: { nombre: "Crypte De Kardorim", link: "https://example.com/donjon", img: "/images/donjones/x.png" },
  },
];

beforeEach(() => {
  window.localStorage.clear();
});

describe("QuestChecklist", () => {
  it("starts with nothing checked and shows the total", () => {
    render(<QuestChecklist slug="test-guide" guideName="Test Guide" quests={quests} />);
    expect(screen.getByText("0 / 2 completadas")).toBeInTheDocument();
  });

  it("checking a mission updates the progress count and persists it", async () => {
    const user = userEvent.setup();
    render(<QuestChecklist slug="test-guide" guideName="Test Guide" quests={quests} />);

    await user.click(screen.getByRole("checkbox", { name: /mort au rat/i }));

    expect(screen.getByText("1 / 2 completadas")).toBeInTheDocument();
    expect(loadProgress("test-guide")).toEqual(new Set(["Mort au rat !"]));
  });

  it("filters missions by the search box", async () => {
    const user = userEvent.setup();
    render(<QuestChecklist slug="test-guide" guideName="Test Guide" quests={quests} />);

    await user.type(screen.getByLabelText(/buscar misión/i), "ciel");

    expect(screen.queryByText("Mort au rat !")).not.toBeInTheDocument();
    expect(screen.getByText("Vu du ciel")).toBeInTheDocument();
  });

  it("groups missions by zone with a header per zone", () => {
    render(<QuestChecklist slug="test-guide" guideName="Test Guide" quests={quests} />);

    expect(screen.getByRole("heading", { name: "Incarnam" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Astrub" })).toBeInTheDocument();
  });

  it("reset button clears progress", async () => {
    const user = userEvent.setup();
    render(<QuestChecklist slug="test-guide" guideName="Test Guide" quests={quests} />);

    await user.click(screen.getByRole("checkbox", { name: /mort au rat/i }));
    await user.click(screen.getByRole("button", { name: /reiniciar progreso/i }));

    expect(screen.getByText("0 / 2 completadas")).toBeInTheDocument();
    expect(loadProgress("test-guide")).toEqual(new Set());
  });

  it("shows a dungeon badge linking out for missions that have one", () => {
    render(<QuestChecklist slug="test-guide" guideName="Test Guide" quests={quests} />);

    const link = screen.getByRole("link", { name: /crypte de kardorim/i });
    expect(link).toHaveAttribute("href", "https://example.com/donjon");
  });

  it("'Marcar todas' checks every mission in that zone", async () => {
    const user = userEvent.setup();
    render(<QuestChecklist slug="test-guide" guideName="Test Guide" quests={quests} />);

    // Una zona por misión en este fixture: el primer botón es el de Incarnam.
    await user.click(screen.getAllByRole("button", { name: /marcar todas/i })[0]);

    expect(screen.getByText("1 / 2 completadas")).toBeInTheDocument();
    expect(loadProgress("test-guide")).toEqual(new Set(["Mort au rat !"]));
  });

  it("turns into 'Desmarcar todas' once the zone is complete, and undoes it", async () => {
    const user = userEvent.setup();
    render(<QuestChecklist slug="test-guide" guideName="Test Guide" quests={quests} />);

    await user.click(screen.getAllByRole("button", { name: /marcar todas/i })[0]);
    expect(loadProgress("test-guide")).toEqual(new Set(["Mort au rat !"]));

    await user.click(screen.getByRole("button", { name: /desmarcar todas/i }));

    expect(screen.getByText("0 / 2 completadas")).toBeInTheDocument();
    expect(loadProgress("test-guide")).toEqual(new Set());
  });

  it("shows level-range tabs and filters missions by the selected range", async () => {
    const rangedQuests: Quest[] = [
      { ...quests[0], rango: "1-20" },
      { ...quests[1], rango: "20-40" },
    ];
    const user = userEvent.setup();
    render(<QuestChecklist slug="guide-complet" guideName="Guia Completa" quests={rangedQuests} rangos={["1-20", "20-40"]} />);

    expect(screen.getByText("Mort au rat !")).toBeInTheDocument();
    expect(screen.queryByText("Vu du ciel")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Niv. 20-40" }));

    expect(screen.queryByText("Mort au rat !")).not.toBeInTheDocument();
    expect(screen.getByText("Vu du ciel")).toBeInTheDocument();
  });
});
