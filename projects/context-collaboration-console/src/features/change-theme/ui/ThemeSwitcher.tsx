import { useTheme, type ThemePreference } from "@shared/lib/theme";

import "./theme-switcher.css";

const options: ReadonlyArray<{ value: ThemePreference; label: string }> = [
  { value: "system", label: "시스템 설정" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];

export function ThemeSwitcher() {
  const { preference, resolvedTheme, setPreference } = useTheme();

  return (
    <label className="theme-switcher">
      <span className="visually-hidden">화면 테마</span>
      <select
        aria-label={`화면 테마, 현재 ${resolvedTheme === "dark" ? "다크" : "라이트"}`}
        value={preference}
        onChange={(event) => setPreference(event.target.value as ThemePreference)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
