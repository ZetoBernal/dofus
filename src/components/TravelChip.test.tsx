import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TravelChip, travelCommand } from "./TravelChip";

describe("travelCommand", () => {
  it("turns bracket coordinates into a /travel command", () => {
    expect(travelCommand("[-3,-3]")).toBe("/travel -3,-3");
  });
});

describe("TravelChip", () => {
  it("shows the /travel command as its label", () => {
    render(<TravelChip coordenadas="[-3,-3]" />);
    expect(screen.getByRole("button", { name: /travel -3,-3/i })).toHaveTextContent(
      "/travel -3,-3"
    );
  });

  it("copies the /travel command to the clipboard on click", async () => {
    const user = userEvent.setup();

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<TravelChip coordenadas="[12,-7]" />);
    await user.click(screen.getByRole("button", { name: "Copiar /travel 12,-7" }));

    expect(writeText).toHaveBeenCalledWith("/travel 12,-7");
    expect(await screen.findByText(/copiado/i)).toBeInTheDocument();
  });
});
