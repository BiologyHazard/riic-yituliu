import { ref } from 'vue';

const THEME_KEY = 'theme';
export const theme = ref<'light' | 'dark'>('light');

function applyTheme(t: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove('theme-light', 'theme-dark');
  document.documentElement.classList.add(`theme-${t}`);
}

export function setTheme(t: 'light' | 'dark') {
  theme.value = t;
  applyTheme(t);
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    // ignore
  }
}

export function toggleTheme() {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
}

export function initTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved ?? (prefersDark ? 'dark' : 'light');
    setTheme(initial);
  } catch {
    // fallback
    setTheme('light');
  }
}

export default {
  theme,
  setTheme,
  toggleTheme,
  initTheme,
};
