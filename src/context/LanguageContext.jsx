import { createContext, useContext, useMemo, useState } from "react";

const LanguageContext = createContext(null);

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("EN");

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      isArabic: language === "AR",
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}

export { LanguageProvider, useLanguage };
