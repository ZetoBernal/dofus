import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "./LanguageProvider";
import { LanguageToggle } from "./LanguageToggle";

beforeEach(() => {
  window.localStorage.clear();
});

describe("LanguageToggle", () => {
  it("defaults to French", () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    );
    expect(screen.getByRole("button", { name: "FR" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "ES" })).toHaveAttribute("aria-pressed", "false");
  });

  it("switches to Spanish and persists the choice", async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    );

    await user.click(screen.getByRole("button", { name: "ES" }));

    expect(screen.getByRole("button", { name: "ES" })).toHaveAttribute("aria-pressed", "true");
    expect(window.localStorage.getItem("dofus-language")).toBe("es");
  });
});
