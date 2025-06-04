const THEME_KEY = "preferred-theme";

export function applyStoredTheme() {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === "dark") {
    document.documentElement.classList.add("dark-mode");
  }
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark-mode");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}