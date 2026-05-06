import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CelestialMenu from "../components/CelestialMenu";
import NeptuneScene from "../components/NeptuneScene";

const copy = {
  AR: {
    menuLabel: "فتح القائمة",
    instructions: "اسحب للتدوير · عجلة الماوس للتكبير · نقرتان لإيقاف الدوران",
    status: "محاكاة نبتون ·",
    live: "نشطة",
    paused: "متوقفة",
    choose: "اختيار محاكي آخر",
    title: "نبتون",
    subtitle: "العملاق الأزرق",
    infoTitle: "رياح سريعة وحلقات خافتة",
    info:
      "نبتون كوكب جليدي بعيد بلون أزرق عميق بسبب الميثان في غلافه. المحاكاة تعرض أحزمة خفيفة، عاصفة بيضاء، وهالة مع حلقات رفيعة خافتة.",
    statsTitle: "إحصائيات نبتون",
    atmosphere: "الغلاف",
    atmosphereHidden: "الغلاف مخفي",
    rings: "الحلقات",
    ringsHidden: "الحلقات مخفية",
    facts: [
      ["القطر", "49,244 كم"],
      ["اليوم", "16.1 ساعة"],
      ["السنة", "165 سنة أرضية"],
      ["الرياح", "حتى 2,100 كم/س"],
      ["الأقمار", "14 قمر معروف"],
      ["التركيب", "جليد وغازات"],
    ],
  },
  EN: {
    menuLabel: "Open menu",
    instructions: "Drag to rotate · Mouse wheel to zoom · Double-click to pause rotation",
    status: "Neptune Simulation ·",
    live: "Live",
    paused: "Paused",
    choose: "Choose Another Simulator",
    title: "Neptune",
    subtitle: "The Blue Giant",
    infoTitle: "Fast Winds And Faint Rings",
    info:
      "Neptune is a distant ice giant with a deep blue color caused by methane in its atmosphere. This scene shows subtle bands, a bright storm, a glow, and thin faint rings.",
    statsTitle: "Neptune Stats",
    atmosphere: "Atmosphere",
    atmosphereHidden: "Atmosphere Hidden",
    rings: "Rings",
    ringsHidden: "Rings Hidden",
    facts: [
      ["Diameter", "49,244 km"],
      ["Day", "16.1 hours"],
      ["Year", "165 Earth years"],
      ["Winds", "Up to 2,100 km/h"],
      ["Moons", "14 known moons"],
      ["Makeup", "Ices and gases"],
    ],
  },
};

function NeptuneSimulatorPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState("AR");
  const [isPaused, setIsPaused] = useState(false);
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [showRings, setShowRings] = useState(true);
  const navigate = useNavigate();
  const isArabic = language === "AR";
  const text = copy[language];

  const handleSelectBody = (bodyId) => {
    if (bodyId === "sun") navigate("/sun");
    if (bodyId === "earth") navigate("/earth");
    if (bodyId === "black-hole") navigate("/black-hole");
    if (bodyId === "venus") navigate("/venus");
    if (bodyId === "mars") navigate("/mars");
    if (bodyId === "jupiter") navigate("/jupiter");
    if (bodyId === "saturn") navigate("/saturn");
    if (bodyId === "uranus") navigate("/uranus");
    if (bodyId === "neptune") setIsMenuOpen(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000006] text-white" dir={isArabic ? "rtl" : "ltr"}>
      <NeptuneScene isPaused={isPaused} onPausedChange={setIsPaused} showAtmosphere={showAtmosphere} showRings={showRings} />

      <button
        aria-label={text.menuLabel}
        className={`fixed top-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-sky-200/18 bg-black/45 text-xl text-white shadow-xl shadow-black/35 backdrop-blur-xl transition hover:bg-white/10 ${
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
        selectedBody="neptune"
      />

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
        <div className="rounded-full border border-sky-100/30 bg-gradient-to-r from-blue-900/90 via-sky-500/85 to-indigo-800/90 px-8 py-3 shadow-[0_0_42px_rgba(56,150,255,0.45)]">
          <h1 className="text-2xl font-black text-white drop-shadow-[0_0_18px_rgba(145,220,255,0.9)] md:text-4xl">{text.title}</h1>
          <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-sky-50/90 md:text-sm">{text.subtitle}</p>
        </div>
      </section> */}

      {/* <aside className={`pointer-events-auto fixed top-28 z-20 hidden w-80 space-y-4 xl:block ${isArabic ? "left-5" : "right-5"}`}>
        <section className="rounded-xl border border-sky-200/20 bg-black/48 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <h3 className="text-xl font-bold text-sky-200">{text.infoTitle}</h3>
          <p className="mt-3 text-sm leading-7 text-white/68">{text.info}</p>
        </section>

        <section className="rounded-xl border border-sky-200/20 bg-black/48 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <h4 className="text-lg font-bold text-sky-200">{text.statsTitle}</h4>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {text.facts.map(([label, value]) => (
              <div className="rounded-lg border border-sky-200/14 bg-white/[0.04] p-3" key={label}>
                <p className="text-xs text-white/45">{label}</p>
                <p className="mt-1 text-sm font-bold text-sky-50">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </aside> */}

      <div className="pointer-events-none fixed bottom-5 left-5 right-5 z-20 flex flex-wrap items-end justify-between gap-3">
        <div className="rounded-full border border-sky-200/16 bg-black/52 px-5 py-3 text-sm text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl">
          {text.status}{" "}
          <span className={isPaused ? "text-orange-200" : "text-emerald-200"}>{isPaused ? text.paused : text.live}</span>
        </div>
        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          <button className="rounded-full border border-sky-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-sky-200/10" onClick={() => setShowAtmosphere((value) => !value)} type="button">
            {showAtmosphere ? text.atmosphere : text.atmosphereHidden}
          </button>
          <button className="rounded-full border border-sky-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-sky-200/10" onClick={() => setShowRings((value) => !value)} type="button">
            {showRings ? text.rings : text.ringsHidden}
          </button>
          <button className="hidden rounded-full border border-sky-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-sky-200/10 md:block" onClick={() => navigate("/")} type="button">
            {text.choose}
          </button>
        </div>
      </div>
    </main>
  );
}

export default NeptuneSimulatorPage;
