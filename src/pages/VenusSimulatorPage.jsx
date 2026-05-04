import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CelestialMenu from "../components/CelestialMenu";
import VenusScene from "../components/VenusScene";

const copy = {
  AR: {
    menuLabel: "فتح القائمة",
    instructions: "اسحب للتدوير · عجلة الماوس للتكبير · نقرتان لإيقاف الدوران",
    status: "محاكاة الزهرة ·",
    live: "نشطة",
    paused: "متوقفة",
    choose: "اختيار محاكي آخر",
    title: "الزهرة",
    subtitle: "الكوكب اللامع",
    infoTitle: "غلاف كثيف وسحب كبريتية",
    info:
      "الزهرة مخفي تقريباً تحت طبقات سحب كثيفة من حمض الكبريتيك. لذلك تجمع المحاكاة بين سطح صخري ساخن وغلاف ذهبي متحرك يحجب أغلب التفاصيل.",
    statsTitle: "إحصائيات الزهرة",
    atmosphere: "الغلاف",
    atmosphereHidden: "الغلاف مخفي",
    clouds: "السحب",
    cloudsHidden: "السحب مخفية",
    surface: "السطح",
    surfaceHidden: "السطح مخفي",
    facts: [
      ["القطر", "12,104 كم"],
      ["اليوم", "243 يوم أرضي"],
      ["السنة", "225 يوم"],
      ["الحرارة", "حوالي 465°C"],
      ["الضغط", "92 ضغط أرضي"],
      ["الغلاف", "ثاني أكسيد الكربون"],
    ],
  },
  EN: {
    menuLabel: "Open menu",
    instructions: "Drag to rotate · Mouse wheel to zoom · Double-click to pause rotation",
    status: "Venus Simulation ·",
    live: "Live",
    paused: "Paused",
    choose: "Choose Another Simulator",
    title: "Venus",
    subtitle: "The Bright Planet",
    infoTitle: "Dense Atmosphere And Sulfur Clouds",
    info:
      "Venus is almost hidden beneath thick sulfuric acid clouds. This simulation combines a hot rocky surface with a moving golden atmosphere that obscures most details.",
    statsTitle: "Venus Stats",
    atmosphere: "Atmosphere",
    atmosphereHidden: "Atmosphere Hidden",
    clouds: "Clouds",
    cloudsHidden: "Clouds Hidden",
    surface: "Surface",
    surfaceHidden: "Surface Hidden",
    facts: [
      ["Diameter", "12,104 km"],
      ["Day", "243 Earth days"],
      ["Year", "225 days"],
      ["Temperature", "About 465°C"],
      ["Pressure", "92 Earth atmospheres"],
      ["Atmosphere", "Carbon dioxide"],
    ],
  },
};

function VenusSimulatorPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState("AR");
  const [isPaused, setIsPaused] = useState(false);
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [showClouds, setShowClouds] = useState(false);
  const [showSurface, setShowSurface] = useState(true);
  const navigate = useNavigate();
  const isArabic = language === "AR";
  const text = copy[language];

  const handleSelectBody = (bodyId) => {
    if (bodyId === "sun") navigate("/sun");
    if (bodyId === "earth") navigate("/earth");
    if (bodyId === "venus") setIsMenuOpen(false);
    if (bodyId === "mars") navigate("/mars");
    if (bodyId === "jupiter") navigate("/jupiter");
    if (bodyId === "saturn") navigate("/saturn");
    if (bodyId === "neptune") navigate("/neptune");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050201] text-white" dir={isArabic ? "rtl" : "ltr"}>
      <VenusScene
        isPaused={isPaused}
        onPausedChange={setIsPaused}
        showAtmosphere={showAtmosphere}
        showClouds={showClouds}
        showSurface={showSurface}
      />

      <button
        aria-label={text.menuLabel}
        className={`fixed top-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-yellow-200/18 bg-black/45 text-xl text-white shadow-xl shadow-black/35 backdrop-blur-xl transition hover:bg-white/10 ${
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
        selectedBody="venus"
      />

      <header
        className={`pointer-events-auto fixed top-4 z-20 flex items-center ${
          isArabic ? "left-4 right-20 justify-start" : "left-20 right-4 justify-end"
        }`}
      >
        <div className="hidden rounded-full border border-yellow-200/25 bg-black/45 px-6 py-3 text-sm font-bold text-yellow-50 shadow-xl shadow-black/25 backdrop-blur-xl md:block">
          {text.instructions}
        </div>
      </header>

      {/* <section className="pointer-events-none fixed left-1/2 top-5 z-20 hidden -translate-x-1/2 text-center sm:block">
        <div className="rounded-full border border-yellow-100/30 bg-gradient-to-r from-amber-800/90 via-yellow-500/85 to-orange-700/90 px-8 py-3 shadow-[0_0_40px_rgba(245,184,75,0.42)]">
          <h1 className="text-2xl font-black text-white drop-shadow-[0_0_18px_rgba(255,225,142,0.85)] md:text-4xl">{text.title}</h1>
          <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-yellow-50/90 md:text-sm">{text.subtitle}</p>
        </div>
      </section> */}

      {/* <aside className={`pointer-events-auto fixed top-28 z-20 hidden w-80 space-y-4 xl:block ${isArabic ? "left-5" : "right-5"}`}>
        <section className="rounded-xl border border-yellow-200/20 bg-black/48 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <h3 className="text-xl font-bold text-yellow-200">{text.infoTitle}</h3>
          <p className="mt-3 text-sm leading-7 text-white/68">{text.info}</p>
        </section>

        <section className="rounded-xl border border-yellow-200/20 bg-black/48 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <h4 className="text-lg font-bold text-yellow-200">{text.statsTitle}</h4>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {text.facts.map(([label, value]) => (
              <div className="rounded-lg border border-yellow-200/14 bg-white/[0.04] p-3" key={label}>
                <p className="text-xs text-white/45">{label}</p>
                <p className="mt-1 text-sm font-bold text-yellow-50">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </aside> */}

      <div className="pointer-events-none fixed bottom-5 left-5 right-5 z-20 flex flex-wrap items-end justify-between gap-3">
        <div className="rounded-full border border-yellow-200/16 bg-black/52 px-5 py-3 text-sm text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl">
          {text.status}{" "}
          <span className={isPaused ? "text-orange-200" : "text-emerald-200"}>{isPaused ? text.paused : text.live}</span>
        </div>

        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          <button className="rounded-full border border-yellow-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-yellow-200/10" onClick={() => setShowAtmosphere((value) => !value)} type="button">
            {showAtmosphere ? text.atmosphere : text.atmosphereHidden}
          </button>
          <button className="rounded-full border border-yellow-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-yellow-200/10" onClick={() => setShowClouds((value) => !value)} type="button">
            {showClouds ? text.clouds : text.cloudsHidden}
          </button>
          {/* <button className="rounded-full border border-yellow-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-yellow-200/10" onClick={() => setShowSurface((value) => !value)} type="button">
            {showSurface ? text.surface : text.surfaceHidden}
          </button> */}
          <button className="hidden rounded-full border border-yellow-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-yellow-200/10 md:block" onClick={() => navigate("/")} type="button">
            {text.choose}
          </button>
        </div>
      </div>
    </main>
  );
}

export default VenusSimulatorPage;
