import AtomicStructureSimulation from "../components/AtomicStructureSimulation";
import CosmicNavbar from "../components/CosmicNavbar";
import { useLanguage } from "../context/LanguageContext";

const copy = {
  AR: {
    menuLabel: "فتح القائمة",
  },
  EN: {
    menuLabel: "Open menu",
  },
};

function AtomicSimulationPage() {
  const { language, isArabic } = useLanguage();
  const text = copy[language] ?? copy.EN;

  return (
    <main className="min-h-screen bg-[#02040b] text-white" dir={isArabic ? "rtl" : "ltr"}>
      <CosmicNavbar menuLabel={text.menuLabel} selectedBody="atomic-simulation" tone="sky" />
      <AtomicStructureSimulation />
    </main>
  );
}

export default AtomicSimulationPage;
