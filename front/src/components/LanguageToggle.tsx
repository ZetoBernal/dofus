"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 text-xs shrink-0">
      {(["fr", "es"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          aria-pressed={language === lang}
          className={`px-2 py-1 rounded transition-colors cursor-pointer ${
            language === lang
              ? "bg-amber-500 text-zinc-900 font-semibold"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
