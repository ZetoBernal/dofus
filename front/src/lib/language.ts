export type Language = "fr" | "es";

const KEY = "dofus-language";

export function loadLanguage(): Language {
  if (typeof window === "undefined") return "fr";
  return window.localStorage.getItem(KEY) === "es" ? "es" : "fr";
}

export function saveLanguage(lang: Language): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, lang);
}
