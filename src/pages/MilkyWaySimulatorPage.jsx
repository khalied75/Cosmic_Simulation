import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CosmicNavbar from "../components/CosmicNavbar";
import MilkyWayScene from "../components/MilkyWayScene";
import SimulationSound from "../components/SimulationSound";
import { useLanguage } from "../context/LanguageContext";

const copy = {
  AR: {
    menuLabel: "فتح القائمة",
    instructions: "اسحب للدوران - عجلة الماوس للتكبير - نقرتان لإيقاف الدوران",
    status: "محاكاة درب التبانة -",
    live: "نشطة",
    paused: "متوقفة",
    choose: "اختر محاكيًا آخر",
    title: "درب التبانة",
    subtitle: "قرص نجمي حلزوني مع وهج مركزي وسحب غبار",
    dust: "إخفاء الغبار",
    dustHidden: "إظهار الغبار",
    halo: "إخفاء الهالة",
    haloHidden: "إظهار الهالة",
  },
  EN: {
    menuLabel: "Open menu",
    instructions: "Drag to rotate - Mouse wheel to zoom - Double-click to pause rotation",
    status: "Milky Way Simulation -",
    live: "Live",
    paused: "Paused",
    choose: "Choose Another Simulator",
    title: "Milky Way",
    subtitle: "Spiral star disk with a bright core and dusty lanes",
    dust: "Hide Dust",
    dustHidden: "Show Dust",
    halo: "Hide Halo",
    haloHidden: "Show Halo",
  },
};

function MilkyWaySimulatorPage() {
  const [isPaused, setIsPaused] = useState(false);
  const [showDust, setShowDust] = useState(true);
  const [showHalo, setShowHalo] = useState(true);
  const navigate = useNavigate();
  const { language, isArabic } = useLanguage();
  const text = copy[language];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02030a] text-white" dir={isArabic ? "rtl" : "ltr"}>
      <MilkyWayScene
        isPaused={isPaused}
        onPausedChange={setIsPaused}
        showDust={showDust}
        showHalo={showHalo}
      />
      <SimulationSound language={language} tone="sky" videoId="3N9RnmwIWbA" volume={42} />

      <CosmicNavbar menuLabel={text.menuLabel} selectedBody="milky-way" tone="sky" />

      <header
        className={`pointer-events-auto fixed top-4 z-20 flex items-center ${
          isArabic ? "left-4 right-20 justify-start" : "left-20 right-4 justify-end"
        }`}
      >
        <div className="hidden rounded-full border border-sky-200/25 bg-black/45 px-6 py-3 text-sm font-bold text-sky-50 shadow-xl shadow-black/25 backdrop-blur-xl md:block">
          {text.instructions}
        </div>
      </header>

      {/* <section className="pointer-events-none fixed left-1/2 top-5 z-20 hidden -translate-x-1/2 text-center sm:block">
        <div className="rounded-full border border-sky-100/20 bg-gradient-to-r from-slate-950/90 via-blue-950/80 to-amber-900/70 px-7 py-3 shadow-[0_0_42px_rgba(116,174,255,0.2)]">
          <h1 className="text-2xl font-black text-white md:text-4xl">{text.title}</h1>
          <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-sky-50/90 md:text-sm">{text.subtitle}</p>
        </div>
      </section> */}

      <div className="pointer-events-none fixed bottom-5 left-5 right-5 z-20 flex flex-wrap items-end justify-between gap-3">
        <div className="rounded-full border border-sky-200/16 bg-black/52 px-5 py-3 text-sm text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl">
          {text.status} <span className={isPaused ? "text-orange-200" : "text-emerald-200"}>{isPaused ? text.paused : text.live}</span>
        </div>

        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          <button
            className="rounded-full border border-sky-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-sky-200/10"
            onClick={() => setShowDust((value) => !value)}
            type="button"
          >
            {showDust ? text.dust : text.dustHidden}
          </button>
          <button
            className="rounded-full border border-sky-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-sky-200/10"
            onClick={() => setShowHalo((value) => !value)}
            type="button"
          >
            {showHalo ? text.halo : text.haloHidden}
          </button>
          <button
            className="hidden rounded-full border border-sky-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-sky-200/10 md:block"
            onClick={() => navigate("/")}
            type="button"
          >
            {text.choose}
          </button>
        </div>
      </div>
    </main>
  );
}

export default MilkyWaySimulatorPage;
