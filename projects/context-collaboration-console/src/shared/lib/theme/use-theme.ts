import { useContext } from "react";

import { ThemeContext } from "./theme-context";

export function useTheme() {
  const value = useContext(ThemeContext);

  if (value === null) {
    throw new Error("ProductThemeProvider is missing from the application tree.");
  }

  return value;
}
