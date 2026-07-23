import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeSwitcher } from "@features/change-theme";
import { useTheme } from "@shared/lib/theme";
import { renderWithProviders } from "@test/renderWithProviders";

describe("ThemeSwitcher", () => {
  it("persists an explicit dark preference without remounting the app", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSwitcher />);

    await user.selectOptions(screen.getByRole("combobox", { name: "화면 테마, 현재 라이트" }), "dark");

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-resolved-theme", "dark");
      expect(localStorage.getItem("context-console.theme-preference.v1")).toBe("dark");
    });
  });

  it("defaults to the system preference", () => {
    localStorage.clear();
    renderWithProviders(<span>theme</span>);
    expect(document.documentElement).toHaveAttribute("data-theme-preference", "system");
  });

  it("follows an operating-system theme change while preference is system", () => {
    const originalMatchMedia = window.matchMedia.bind(window);
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    let matches = false;

    window.matchMedia = (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => listeners.add(listener as (event: MediaQueryListEvent) => void),
      removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => listeners.delete(listener as (event: MediaQueryListEvent) => void),
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    });

    function ThemeStatus() {
      const { resolvedTheme } = useTheme();
      return <output>{resolvedTheme}</output>;
    }

    renderWithProviders(<ThemeStatus />);
    expect(screen.getByText("light")).toBeInTheDocument();

    act(() => {
      matches = true;
      const event = { matches, media: "(prefers-color-scheme: dark)" } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    });

    expect(screen.getByText("dark")).toBeInTheDocument();
    window.matchMedia = originalMatchMedia;
  });
});
