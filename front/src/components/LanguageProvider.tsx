"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Language, loadLanguage, saveLanguage } from "@/lib/language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "fr",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");

  // Se carga después del montaje (client-only) para que el primer render
  // coincida con el HTML estático del servidor y no rompa la hidratación.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync deliberado desde localStorage, no hay forma de leerlo en el render de servidor
    setLanguageState(loadLanguage());
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    saveLanguage(lang);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
