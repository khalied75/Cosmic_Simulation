import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CelestialMenu from "../components/CelestialMenu";
import MarsScene from "../components/MarsScene";
import SimulationSound from "../components/SimulationSound";

const copy = {
  AR: {
    menuLabel: "فتح القائمة",
    instructions: "اسحب للتدوير · عجلة الماوس للتكبير · نقرتان لإيقاف الدوران",
    status: "محاكاة المريخ ·",
    live: "نشطة",
    paused: "متوقفة",
    choose: "اختيار محاكي آخر",
    title: "المريخ",
    subtitle: "الكوكب الأحمر",
    infoTitle: "واقعية سطح المريخ",
    info:
      "المشهد يستخدم نسيجاً مولداً بدقة عالية مع فوهات تصادمية، مناطق داكنة، أغطية قطبية، أخاديد طويلة، وملامح مستوحاة من Olympus Mons و Valles Marineris.",
    statsTitle: "إحصائيات المريخ",
    atmosphere: "الغلاف",
    atmosphereHidden: "الغلاف مخفي",
    moons: "الأقمار",
    moonsHidden: "الأقمار مخفية",
    dust: "الغبار",
    dustHidden: "الغبار مخفي",
    facts: [
      ["القطر", "6,779 كم"],
      ["اليوم", "24.6 ساعة"],
      ["السنة", "687 يوم"],
      ["الجاذبية", "0.38 أرض"],
      ["الأقمار", "فوبوس وديموس"],
      ["الجو", "ثاني أكسيد الكربون"],
    ],
  },
  EN: {
    menuLabel: "Open menu",
    instructions: "Drag to rotate · Mouse wheel to zoom · Double-click to pause rotation",
    status: "Mars Simulation ·",
    live: "Live",
    paused: "Paused",
    choose: "Choose Another Simulator",
    title: "Mars",
    subtitle: "The Red Planet",
    infoTitle: "Realistic Martian Surface",
    info:
      "The scene uses a high-detail generated texture with impact craters, dark albedo regions, polar caps, long canyon marks, and features inspired by Olympus Mons and Valles Marineris.",
    statsTitle: "Mars Stats",
    atmosphere: "Atmosphere",
    atmosphereHidden: "Atmosphere Hidden",
    moons: "Moons",
    moonsHidden: "Moons Hidden",
    dust: "Dust",
    dustHidden: "Dust Hidden",
    facts: [
      ["Diameter", "6,779 km"],
      ["Day", "24.6 hours"],
      ["Year", "687 days"],
      ["Gravity", "0.38 Earth"],
      ["Moons", "Phobos and Deimos"],
      ["Air", "Carbon dioxide"],
    ],
  },
};

function MarsSimulatorPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [isPaused, setIsPaused] = useState(false);
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [showMoons, setShowMoons] = useState(true);
  const [showDust, setShowDust] = useState(true);
  const navigate = useNavigate();
  const isArabic = language === "AR";
  const text = copy[language];

  const handleSelectBody = (bodyId) => {
    if (bodyId === "sun") navigate("/sun");
    if (bodyId === "earth") navigate("/earth");
    if (bodyId === "black-hole") navigate("/black-hole");
    if (bodyId === "magnetar") navigate("/magnetar");
    if (bodyId === "venus") navigate("/venus");
    if (bodyId === "mars") setIsMenuOpen(false);
    if (bodyId === "jupiter") navigate("/jupiter");
    if (bodyId === "saturn") navigate("/saturn");
    if (bodyId === "neptune") navigate("/neptune");
    if (bodyId === "uranus") navigate("/uranus");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050100] text-white" dir={isArabic ? "rtl" : "ltr"}>
      <MarsScene
        isPaused={isPaused}
        onPausedChange={setIsPaused}
        showAtmosphere={showAtmosphere}
        showDust={showDust}
        showMoons={showMoons}
      />
      <SimulationSound language={language} tone="orange" videoId="QP60x-hS5cs" />

      <button
        aria-label={text.menuLabel}
        className={`fixed top-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-orange-200/18 bg-black/45 text-xl text-white shadow-xl shadow-black/35 backdrop-blur-xl transition hover:bg-white/10 ${
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
        selectedBody="mars"
      />

      <header
        className={`pointer-events-auto fixed top-4 z-20 flex items-center ${
          isArabic ? "left-4 right-20 justify-start" : "left-20 right-4 justify-end"
        }`}
      >
        <div className="hidden rounded-full border border-orange-200/25 bg-black/45 px-6 py-3 text-sm font-bold text-orange-50 shadow-xl shadow-black/25 backdrop-blur-xl md:block">
          {text.instructions}
        </div>
      </header>
{/* 
      <section className="pointer-events-none fixed left-1/2 top-5 z-20 hidden -translate-x-1/2 text-center sm:block">
        <div className="rounded-full border border-orange-100/30 bg-gradient-to-r from-red-900/90 via-orange-500/85 to-red-800/90 px-8 py-3 shadow-[0_0_40px_rgba(218,88,32,0.45)]">
          <h1 className="text-2xl font-black text-white drop-shadow-[0_0_18px_rgba(255,154,88,0.85)] md:text-4xl">{text.title}</h1>
          <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-orange-50/90 md:text-sm">{text.subtitle}</p>
        </div>
      </section> */}

      {/* <aside className={`pointer-events-auto fixed top-28 z-20 hidden w-80 space-y-4 xl:block ${isArabic ? "left-5" : "right-5"}`}>
        <section className="rounded-xl border border-orange-200/20 bg-black/48 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <h3 className="text-xl font-bold text-orange-200">{text.infoTitle}</h3>
          <p className="mt-3 text-sm leading-7 text-white/68">{text.info}</p>
        </section>

        <section className="rounded-xl border border-orange-200/20 bg-black/48 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <h4 className="text-lg font-bold text-orange-200">{text.statsTitle}</h4>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {text.facts.map(([label, value]) => (
              <div className="rounded-lg border border-orange-200/14 bg-white/[0.04] p-3" key={label}>
                <p className="text-xs text-white/45">{label}</p>
                <p className="mt-1 text-sm font-bold text-orange-50">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </aside> */}

      <div className="pointer-events-none fixed bottom-5 left-5 right-5 z-20 flex flex-wrap items-end justify-between gap-3">
        <div className="rounded-full border border-orange-200/16 bg-black/52 px-5 py-3 text-sm text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl">
          {text.status}{" "}
          <span className={isPaused ? "text-orange-200" : "text-emerald-200"}>{isPaused ? text.paused : text.live}</span>
        </div>

        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          <button
            className="rounded-full border border-orange-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-orange-200/10"
            onClick={() => setShowAtmosphere((value) => !value)}
            type="button"
          >
            {showAtmosphere ? text.atmosphere : text.atmosphereHidden}
          </button>
          <button
            className="rounded-full border border-orange-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-orange-200/10"
            onClick={() => setShowMoons((value) => !value)}
            type="button"
          >
            {showMoons ? text.moons : text.moonsHidden}
          </button>
          <button
            className="rounded-full border border-orange-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-orange-200/10"
            onClick={() => setShowDust((value) => !value)}
            type="button"
          >
            {showDust ? text.dust : text.dustHidden}
          </button>
          <button
            className="hidden rounded-full border border-orange-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-orange-200/10 md:block"
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

export default MarsSimulatorPage;
