import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CelestialMenu from "../components/CelestialMenu";
import RealisticEarthScene from "../components/RealisticEarthScene";
import SimulationSound from "../components/SimulationSound";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [autoRotate, setAutoRotate] = useState(true);
  const navigate = useNavigate();
  const text = copy[language];

  const handleSelectBody = (bodyId) => {
    if (bodyId === "sun") navigate("/sun");
    if (bodyId === "black-hole") navigate("/black-hole");
    if (bodyId === "magnetar") navigate("/magnetar");
    if (bodyId === "earth") setIsMenuOpen(false);
    if (bodyId === "venus") navigate("/venus");
    if (bodyId === "mars") navigate("/mars");
    if (bodyId === "jupiter") navigate("/jupiter");
    if (bodyId === "saturn") navigate("/saturn");
    if (bodyId === "neptune") navigate("/neptune");
    if (bodyId === "uranus") navigate("/uranus");
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#050510] text-white"
      dir={language === "AR" ? "rtl" : "ltr"}
    >
      <RealisticEarthScene language={language} onAutoRotateChange={setAutoRotate} />
      <SimulationSound language={language} tone="cyan" videoId="_KbrOYcBXxc" />

      <button
        aria-label={text.menuLabel}
        className={`fixed top-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/42 text-xl text-white shadow-xl shadow-black/35 backdrop-blur-xl transition hover:bg-white/10 ${
          language === "AR" ? "right-4" : "left-4"
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
        selectedBody="earth"
      />

      <header
        className={`pointer-events-auto fixed top-4 z-20 flex items-center justify-between gap-3 ${
          language === "AR" ? "left-4 right-20" : "left-20 right-4"
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
