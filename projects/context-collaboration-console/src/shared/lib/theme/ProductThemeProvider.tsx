import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { type PropsWithChildren, useEffect, useMemo, useState } from "react";

import { ThemeContext, type ThemePreference } from "./theme-context";

const storageKey = "context-console.theme-preference.v1";
const darkQuery = "(prefers-color-scheme: dark)";

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function readStoredPreference(): ThemePreference {
  const stored = window.localStorage.getItem(storageKey);
  return isThemePreference(stored) ? stored : "system";
}

export function ProductThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreference] = useState<ThemePreference>(readStoredPreference);
  const [systemIsDark, setSystemIsDark] = useState(() => window.matchMedia(darkQuery).matches);
  const resolvedTheme = preference === "system" ? (systemIsDark ? "dark" : "light") : preference;

  useEffect(() => {
    const media = window.matchMedia(darkQuery);
    const handleChange = (event: MediaQueryListEvent) => setSystemIsDark(event.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, preference);
    document.documentElement.dataset.themePreference = preference;
    document.documentElement.dataset.resolvedTheme = resolvedTheme;
  }, [preference, resolvedTheme]);

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <Theme theme={neutralTheme} mode={preference}>
        {children}
      </Theme>
    </ThemeContext.Provider>
  );
}
