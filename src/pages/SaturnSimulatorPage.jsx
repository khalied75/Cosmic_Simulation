import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CelestialMenu from "../components/CelestialMenu";
import SaturnScene from "../components/SaturnScene";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState("AR");
  const [isPaused, setIsPaused] = useState(false);
  const [showRings, setShowRings] = useState(true);
  const navigate = useNavigate();
  const isArabic = language === "AR";
  const text = copy[language];

  const handleSelectBody = (bodyId) => {
    if (bodyId === "sun") navigate("/sun");
    if (bodyId === "earth") navigate("/earth");
    if (bodyId === "venus") navigate("/venus");
    if (bodyId === "mars") navigate("/mars");
    if (bodyId === "jupiter") navigate("/jupiter");
    if (bodyId === "saturn") setIsMenuOpen(false);
    if (bodyId === "neptune") navigate("/neptune");
  };

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

      <button
        aria-label={text.menuLabel}
        className={`fixed top-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/42 text-xl text-white shadow-xl shadow-black/35 backdrop-blur-xl transition hover:bg-white/10 ${
          isArabic ? "right-4" : "left-4"
        } ${isMenuOpen ? "pointer-events-none scale-90 opacity-0" : "opacity-100"}`}
        onClick={() => setIsMenuOpen(true)}
        type="button"
      >
        =
      </button>

      <CelestialMenu
        isOpen={isMenuOpen}
        language={language}
        onClose={() => setIsMenuOpen(false)}
        onLanguageChange={setLanguage}
        onSelectBody={handleSelectBody}
        selectedBody="saturn"
      />

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
