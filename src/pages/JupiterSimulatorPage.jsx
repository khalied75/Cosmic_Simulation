import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CelestialMenu from "../components/CelestialMenu";
import JupiterScene from "../components/JupiterScene";
import jupiterMoons from "../data/jupiterMoons";

const copy = {
  AR: {
    back: "العودة للرئيسية",
    menuLabel: "فتح القائمة",
    title: "المشتري",
    subtitle: "عملاق المجموعة الشمسية",
    pause: "إيقاف",
    play: "تشغيل",
    reset: "إعادة",
    instructions: "اسحب للتدوير · عجلة الماوس للتكبير · نقرتان للإيقاف",
    status: "محاكاة المشتري ·",
    live: "نشطة",
    paused: "متوقفة",
    choose: "اختيار محاكي آخر",
    infoTitle: "كوكب المشتري",
    info: "المشتري هو خامس الكواكب بعداً عن الشمس وأكبر كواكب المجموعة الشمسية. يتميز بأحزمته الغازية والبقعة الحمراء العظيمة، وهي عاصفة ضخمة مستمرة منذ قرون.",
    moons: "أقمار غاليليو",
    stats: "إحصائيات",
    diameter: "القطر",
    mass: "الكتلة",
    moonCount: "الأقمار",
    day: "طول اليوم",
  },
  EN: {
    back: "Back Home",
    menuLabel: "Open menu",
    title: "Jupiter",
    subtitle: "Giant of the Solar System",
    pause: "Pause",
    play: "Play",
    reset: "Reset",
    instructions: "Drag to rotate · Mouse wheel to zoom · Double-click to pause",
    status: "Jupiter Simulation ·",
    live: "Live",
    paused: "Paused",
    choose: "Choose Another Simulator",
    infoTitle: "Planet Jupiter",
    info: "Jupiter is the fifth planet from the Sun and the largest planet in the Solar System. It is known for its gas bands and the Great Red Spot, a giant storm that has lasted for centuries.",
    moons: "Galilean Moons",
    stats: "Stats",
    diameter: "Diameter",
    mass: "Mass",
    moonCount: "Moons",
    day: "Day Length",
  },
};

const moonInfo = {
  io: {
    ar: "أكثر أجرام المجموعة الشمسية نشاطاً بركانياً.",
    en: "The most volcanically active body in the Solar System.",
  },
  europa: {
    ar: "قمر جليدي قد يخفي محيطاً مالحاً تحت سطحه.",
    en: "An icy moon that may hide a salty ocean below its crust.",
  },
  ganymede: {
    ar: "أكبر قمر في المجموعة الشمسية، أكبر من عطارد.",
    en: "The largest moon in the Solar System, larger than Mercury.",
  },
  callisto: {
    ar: "سطح قديم مليء بالفوهات الصدمية.",
    en: "An ancient surface covered with impact craters.",
  },
};

function JupiterSimulatorPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState("AR");
  const [isPaused, setIsPaused] = useState(false);
  const [selectedMoon, setSelectedMoon] = useState("io");
  const navigate = useNavigate();
  const isArabic = language === "AR";
  const text = copy[language];

  const handleSelectBody = (bodyId) => {
    if (bodyId === "earth") navigate("/earth");
    if (bodyId === "jupiter") setIsMenuOpen(false);
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#000008] text-white"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <JupiterScene isPaused={isPaused} onPausedChange={setIsPaused} />

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
        selectedBody="jupiter"
      />

      <header
        className={`pointer-events-auto fixed top-4 z-20 flex items-center justify-between gap-3 ${
          isArabic ? "left-4 right-20" : "left-20 right-4"
        }`}
      >
        <Link className="rounded-full border border-white/15 bg-black/45 px-4 py-2 text-sm font-semibold text-white/82 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-white/10 hover:text-white" to="/">
          {text.back}
        </Link>
        <div className="rounded-full border border-amber-200/20 bg-black/45 px-5 py-2 text-center shadow-xl shadow-black/25 backdrop-blur-xl">
          <div className="text-lg font-black text-amber-100">{text.title}</div>
          <div className="text-xs text-amber-100/70">{text.subtitle}</div>
        </div>
        {/* <div className="flex gap-2">
          <button className="rounded-full border border-white/15 bg-black/45 px-4 py-2 text-sm font-semibold text-white/82 backdrop-blur-xl transition hover:bg-white/10" onClick={() => setIsPaused((value) => !value)} type="button">
            {isPaused ? text.play : text.pause}
          </button>
        </div> */}
      </header>

      {/* <aside className={`pointer-events-auto fixed top-28 z-20 hidden w-80 space-y-4 lg:block ${isArabic ? "left-5" : "right-5"}`}>
        <section className="rounded-xl border border-amber-200/18 bg-black/42 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-amber-200">{text.infoTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-white/70">{text.info}</p>
        </section>
        <section className="rounded-xl border border-amber-200/18 bg-black/42 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-amber-200">{text.stats}</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white/6 p-3"><p className="text-white/45">{text.diameter}</p><p className="font-bold text-amber-100">142,984 km</p></div>
            <div className="rounded-lg bg-white/6 p-3"><p className="text-white/45">{text.mass}</p><p className="font-bold text-amber-100">318 Earths</p></div>
            <div className="rounded-lg bg-white/6 p-3"><p className="text-white/45">{text.moonCount}</p><p className="font-bold text-amber-100">95</p></div>
            <div className="rounded-lg bg-white/6 p-3"><p className="text-white/45">{text.day}</p><p className="font-bold text-amber-100">9.93 h</p></div>
          </div>
        </section>
      </aside> */}

      <aside className={`pointer-events-auto fixed top-28 z-20 hidden w-64 lg:block ${isArabic ? "right-5" : "left-5"}`}>
        <section className="rounded-xl border border-amber-200/18 bg-black/42 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-amber-200">{text.moons}</h3>
          <div className="mt-4 space-y-2">
            {jupiterMoons.map((moon) => (
              <button
                className={`w-full rounded-lg border px-3 py-3 text-sm transition ${
                  selectedMoon === moon.id
                    ? "border-amber-200/70 bg-amber-200/14"
                    : "border-white/10 bg-white/[0.03] hover:border-amber-200/35"
                }`}
                key={moon.id}
                onClick={() => setSelectedMoon(moon.id)}
                type="button"
              >
                <span className="font-bold">{isArabic ? moon.ar : moon.en}</span>
                <span className="mt-1 block text-xs text-white/50">{moonInfo[moon.id][isArabic ? "ar" : "en"]}</span>
              </button>
            ))}
          </div>
        </section>
      </aside>

      <div className="pointer-events-none fixed bottom-5 left-5 right-5 z-20 flex justify-between gap-3">
        <div className="rounded-full border border-white/12 bg-black/48 px-5 py-3 text-sm text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl">
          {text.status} <span className={isPaused ? "text-orange-200" : "text-emerald-200"}>{isPaused ? text.paused : text.live}</span>
        </div>
        <button className="pointer-events-auto hidden rounded-full border border-white/12 bg-black/48 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-white/10 md:block" onClick={() => navigate("/")} type="button">
          {text.choose}
        </button>
      </div>
    </main>
  );
}

export default JupiterSimulatorPage;
