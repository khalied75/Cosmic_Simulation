import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CosmicNavbar from "../components/CosmicNavbar";
import RealisticEarthScene from "../components/RealisticEarthScene";
import SimulationSound from "../components/SimulationSound";
import { useLanguage } from "../context/LanguageContext";

const copy = {
  AR: {
    instructions: "اسحب للتدوير · عجلة الماوس للتكبير · نقرتان لإيقاف الدوران",
    status: "كوكب الأرض · دوران تلقائي",
    active: "نشط",
    stopped: "متوقف",
    choose: "اختيار محاكي آخر",
    menuLabel: "فتح القائمة",
  },
  EN: {
    instructions: "Drag to rotate · Mouse wheel to zoom · Double-click to pause rotation",
    status: "Planet Earth · Auto rotation",
    active: "Active",
    stopped: "Paused",
    choose: "Choose Another Simulator",
    menuLabel: "Open menu",
  },
};

function EarthSimulatorPage() {
  const [autoRotate, setAutoRotate] = useState(true);
  const navigate = useNavigate();
  const { language, isArabic } = useLanguage();
  const text = copy[language];

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#050510] text-white"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <RealisticEarthScene language={language} onAutoRotateChange={setAutoRotate} />
      <SimulationSound language={language} tone="cyan" videoId="_KbrOYcBXxc" />

      <CosmicNavbar menuLabel={text.menuLabel} selectedBody="earth" tone="cyan" />

      <header
        className={`pointer-events-auto fixed top-4 z-20 flex items-center justify-between gap-3 ${
          isArabic ? "left-4 right-20" : "left-20 right-4"
        }`}
      >
        <div className="hidden rounded-full border border-white/12 bg-black/45 px-4 py-2 text-sm text-white/72 shadow-xl shadow-black/25 backdrop-blur-xl sm:block">
          {text.instructions}
        </div>
      </header>

      <div className="pointer-events-none fixed bottom-5 left-5 right-5 z-20 flex justify-between gap-3">
        <div className="rounded-full border border-white/12 bg-black/48 px-5 py-3 text-sm text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl">
          {text.status}{" "}
          <span className={autoRotate ? "text-cyan-200" : "text-orange-200"}>
            {autoRotate ? text.active : text.stopped}
          </span>
        </div>
        <button
          className="pointer-events-auto hidden rounded-full border border-white/12 bg-black/48 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-white/10 md:block"
          onClick={() => navigate("/")}
          type="button"
        >
          {text.choose}
        </button>
      </div>
    </main>
  );
}

export default EarthSimulatorPage;
