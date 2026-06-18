import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CosmicNavbar from "../components/CosmicNavbar";
import SaturnScene from "../components/SaturnScene";
import SimulationSound from "../components/SimulationSound";
import { useLanguage } from "../context/LanguageContext";

const copy = {
  AR: {
    menuLabel: "فتح القائمة",
    instructions: "اسحب للتدوير · عجلة الماوس للتكبير · نقرتان لإيقاف الدوران",
    status: "محاكاة زحل ·",
    live: "نشطة",
    paused: "متوقفة",
    choose: "اختيار محاكي آخر",
    rings: "الحلقات",
    ringsHidden: "الحلقات مخفية",
  },
  EN: {
    menuLabel: "Open menu",
    instructions: "Drag to rotate · Mouse wheel to zoom · Double-click to pause rotation",
    status: "Saturn Simulation ·",
    live: "Live",
    paused: "Paused",
    choose: "Choose Another Simulator",
    rings: "Rings",
    ringsHidden: "Rings Hidden",
  },
};

function SaturnSimulatorPage() {
  const [isPaused, setIsPaused] = useState(false);
  const [showRings, setShowRings] = useState(true);
  const navigate = useNavigate();
  const { language, isArabic } = useLanguage();
  const text = copy[language];

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#000010] text-white"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <SaturnScene
        isPaused={isPaused}
        onPausedChange={setIsPaused}
        showRings={showRings}
      />
      <SimulationSound language={language} tone="amber" videoId="hWHLCHv4PiI" />
      <CosmicNavbar menuLabel={text.menuLabel} selectedBody="saturn" tone="amber" />

      <header
        className={`pointer-events-auto fixed top-4 z-20 flex items-center gap-3 ${
          isArabic ? "left-4 right-20 justify-start" : "left-20 right-4 justify-end"
        }`}
      >
        <div className="hidden rounded-full border border-white/80 bg-black/45 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-black/25 backdrop-blur-xl md:block">
          {text.instructions}
        </div>
        <button
          className="rounded-full border border-white/12 bg-black/48 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-white/10"
          onClick={() => setShowRings((value) => !value)}
          type="button"
        >
          {showRings ? text.rings : text.ringsHidden}
        </button>
      </header>

      <div className="pointer-events-none fixed bottom-5 left-5 right-5 z-20 flex justify-between gap-3">
        <div className="rounded-full border border-white/12 bg-black/48 px-5 py-3 text-sm text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl">
          {text.status}{" "}
          <span className={isPaused ? "text-orange-200" : "text-emerald-200"}>
            {isPaused ? text.paused : text.live}
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

export default SaturnSimulatorPage;
 
