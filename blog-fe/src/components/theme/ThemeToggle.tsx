"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }}
      aria-pressed={isDark}
      aria-label={isDark ? "Bật light mode" : "Bật dark mode"}
      className="theme-toggle"
    >
      <span className="theme-toggle-track">
        <span
          className={`theme-toggle-thumb${isDark ? " theme-toggle-thumb--dark" : ""}`}
        />
        <span className="theme-toggle-icon theme-toggle-icon--sun" aria-hidden>
          ☀
        </span>
        <span className="theme-toggle-icon theme-toggle-icon--moon" aria-hidden>
          ☾
        </span>
      </span>
    </button>
  );
}
