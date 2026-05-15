import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CelestialMenu from "../components/CelestialMenu";
import MagnetarScene from "../components/MagnetarScene";
import SimulationSound from "../components/SimulationSound";

const copy = {
  AR: {
    menuLabel: "فتح القائمة",
    instructions: "اسحب للتدوير · عجلة الماوس للتكبير · نقرتان لإيقاف الدوران",
    status: "محاكاة النجم النيوتروني المغناطيسي ·",
    live: "نشطة",
    paused: "متوقفة",
    choose: "اختيار محاكي آخر",
    title: "النجم النيوتروني المغناطيسي",
    subtitle: "مغناطيسية قصوى ونفاثات قطبية",
    infoTitle: "ضغط هائل ومجال متطرف",
    info:
      "المغناطار هو نوع بالغ الشدة من النجوم النيوترونية، يمتلك مجالاً مغناطيسياً من الأقوى في الكون. المشهد يركز على الوهج الكثيف، الحقول المقوسة، والانفجارات الإشعاعية المحيطة به.",
    statsTitle: "سمات المشهد",
    fields: "المجال",
    fieldsHidden: "المجال مخفي",
    jets: "النفاثات",
    jetsHidden: "النفاثات مخفية",
    burst: "الانبعاث",
    burstHidden: "الانبعاث مخفي",
    facts: [
      ["النوع", "نجم نيوتروني"],
      ["الميزة", "مجال مغناطيسي هائل"],
      ["الوهج", "أزرق بنفسجي"],
      ["النفاثات", "قطبية"],
      ["المحيط", "جسيمات مشحونة"],
      ["الإحساس", "طاقة كثيفة جداً"],
    ],
  },
  EN: {
    menuLabel: "Open menu",
    instructions: "Drag to rotate · Mouse wheel to zoom · Double-click to pause rotation",
    status: "Magnetar Simulation ·",
    live: "Live",
    paused: "Paused",
    choose: "Choose Another Simulator",
    title: "Magnetar",
    subtitle: "Extreme Magnetism And Polar Jets",
    infoTitle: "Immense Pressure And Extreme Fields",
    info:
      "A magnetar is an intensely powerful type of neutron star with one of the strongest magnetic fields in the universe. This scene emphasizes the dense glow, curved field lines, and violent radiative outbursts around it.",
    statsTitle: "Scene Features",
    fields: "Field",
    fieldsHidden: "Field Hidden",
    jets: "Jets",
    jetsHidden: "Jets Hidden",
    burst: "Burst",
    burstHidden: "Burst Hidden",
    facts: [
      ["Type", "Neutron star"],
      ["Trait", "Extreme magnetic field"],
      ["Glow", "Blue-violet"],
      ["Jets", "Polar"],
      ["Surroundings", "Charged particles"],
      ["Feel", "Very dense energy"],
    ],
  },
};

function MagnetarSimulatorPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [isPaused, setIsPaused] = useState(false);
  const [showFields, setShowFields] = useState(true);
  const [showJets, setShowJets] = useState(true);
  const [showBurst, setShowBurst] = useState(true);
  const navigate = useNavigate();
  const isArabic = language === "AR";
  const text = copy[language];

  const handleSelectBody = (bodyId) => {
    if (bodyId === "sun") navigate("/sun");
    if (bodyId === "earth") navigate("/earth");
    if (bodyId === "black-hole") navigate("/black-hole");
    if (bodyId === "venus") navigate("/venus");
    if (bodyId === "uranus") navigate("/uranus");
    if (bodyId === "mars") navigate("/mars");
    if (bodyId === "jupiter") navigate("/jupiter");
    if (bodyId === "saturn") navigate("/saturn");
    if (bodyId === "neptune") navigate("/neptune");
    if (bodyId === "magnetar") setIsMenuOpen(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02030c] text-white" dir={isArabic ? "rtl" : "ltr"}>
      <MagnetarScene
        isPaused={isPaused}
        onPausedChange={setIsPaused}
        showFields={showFields}
        showJets={showJets}
        showBurst={showBurst}
      />
      <SimulationSound language={language} tone="indigo" videoId="LQm9X3KjTjk" />

      <button
        aria-label={text.menuLabel}
        className={`fixed top-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-indigo-200/18 bg-black/45 text-xl text-white shadow-xl shadow-black/35 backdrop-blur-xl transition hover:bg-white/10 ${
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
        selectedBody="magnetar"
      />

      <header
        className={`pointer-events-auto fixed top-4 z-20 flex items-center ${
          isArabic ? "left-4 right-20 justify-start" : "left-20 right-4 justify-end"
        }`}
      >
        <div className="hidden rounded-full border border-indigo-200/25 bg-black/45 px-6 py-3 text-sm font-bold text-indigo-50 shadow-xl shadow-black/25 backdrop-blur-xl md:block">
          {text.instructions}
        </div>
      </header>

      {/* <section className="pointer-events-none fixed left-1/2 top-5 z-20 hidden -translate-x-1/2 text-center sm:block">
        <div className="rounded-full border border-indigo-100/30 bg-gradient-to-r from-blue-950/92 via-cyan-500/78 to-violet-700/90 px-8 py-3 shadow-[0_0_42px_rgba(106,154,255,0.34)]">
          <h1 className="text-2xl font-black text-white drop-shadow-[0_0_18px_rgba(202,240,255,0.9)] md:text-4xl">{text.title}</h1>
          <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-indigo-50/90 md:text-sm">{text.subtitle}</p>
        </div>
      </section> */}

      {/* <aside className={`pointer-events-auto fixed top-28 z-20 hidden w-80 space-y-4 xl:block ${isArabic ? "left-5" : "right-5"}`}>
        <section className="rounded-xl border border-indigo-200/20 bg-black/48 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <h3 className="text-xl font-bold text-indigo-200">{text.infoTitle}</h3>
          <p className="mt-3 text-sm leading-7 text-white/68">{text.info}</p>
        </section>

        <section className="rounded-xl border border-indigo-200/20 bg-black/48 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <h4 className="text-lg font-bold text-indigo-200">{text.statsTitle}</h4>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {text.facts.map(([label, value]) => (
              <div className="rounded-lg border border-indigo-200/14 bg-white/[0.04] p-3" key={label}>
                <p className="text-xs text-white/45">{label}</p>
                <p className="mt-1 text-sm font-bold text-indigo-50">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </aside> */}

      <div className="pointer-events-none fixed bottom-5 left-5 right-5 z-20 flex flex-wrap items-end justify-between gap-3">
        <div className="rounded-full border border-indigo-200/16 bg-black/52 px-5 py-3 text-sm text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl">
          {text.status}{" "}
          <span className={isPaused ? "text-orange-200" : "text-emerald-200"}>{isPaused ? text.paused : text.live}</span>
        </div>
        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          <button
            className="rounded-full border border-indigo-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-indigo-200/10"
            onClick={() => setShowFields((value) => !value)}
            type="button"
          >
            {showFields ? text.fields : text.fieldsHidden}
          </button>
          <button
            className="rounded-full border border-indigo-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-indigo-200/10"
            onClick={() => setShowJets((value) => !value)}
            type="button"
          >
            {showJets ? text.jets : text.jetsHidden}
          </button>
          <button
            className="rounded-full border border-indigo-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-indigo-200/10"
            onClick={() => setShowBurst((value) => !value)}
            type="button"
          >
            {showBurst ? text.burst : text.burstHidden}
          </button>
          <button
            className="hidden rounded-full border border-indigo-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-indigo-200/10 md:block"
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

export default MagnetarSimulatorPage;
