import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CosmicNavbar from "../components/CosmicNavbar";
import SimulationSound from "../components/SimulationSound";
import SunScene from "../components/SunScene";
import { useLanguage } from "../context/LanguageContext";

const copy = {
  AR: {
    menuLabel: "فتح القائمة",
    instructions: "اسحب للتدوير · عجلة الماوس للتكبير · نقرتان لإيقاف الدوران",
    status: "محاكاة الشمس ·",
    live: "نشطة",
    paused: "متوقفة",
    choose: "اختيار محاكي آخر",
    title: "الشمس",
    subtitle: "نجمنا المركزي",
    statsTitle: "إحصائيات الشمس",
    layersTitle: "طبقات الشمس",
    flares: "الشواظ",
    flaresHidden: "الشواظ مخفية",
    corona: "الإكليل",
    coronaHidden: "الإكليل مخفي",
    reset: "إعادة",
    pause: "إيقاف",
    play: "تشغيل",
    facts: [
      ["القطر", "1,392,700 كم"],
      ["الكتلة", "333,000 أرض"],
      ["حرارة السطح", "5,500°C"],
      ["حرارة النواة", "15 مليون °C"],
      ["العمر", "4.6 مليار سنة"],
      ["البعد عن الأرض", "150 مليون كم"],
    ],
  },
  EN: {
    menuLabel: "Open menu",
    instructions: "Drag to rotate · Mouse wheel to zoom · Double-click to pause rotation",
    status: "Sun Simulation ·",
    live: "Live",
    paused: "Paused",
    choose: "Choose Another Simulator",
    title: "Sun",
    subtitle: "Our central star",
    statsTitle: "Solar Stats",
    layersTitle: "Solar Layers",
    flares: "Flares",
    flaresHidden: "Flares Hidden",
    corona: "Corona",
    coronaHidden: "Corona Hidden",
    reset: "Reset",
    pause: "Pause",
    play: "Play",
    facts: [
      ["Diameter", "1,392,700 km"],
      ["Mass", "333,000 Earths"],
      ["Surface Temp", "5,500°C"],
      ["Core Temp", "15 million °C"],
      ["Age", "4.6 billion years"],
      ["Distance", "150 million km"],
    ],
  },
};

const layers = [
  {
    id: "core",
    color: "bg-white",
    ar: "النواة",
    en: "Core",
    arMeta: "15 مليون درجة",
    enMeta: "15 million degrees",
    arText:
      "مركز الشمس حيث يحدث الاندماج النووي. يتحول الهيدروجين إلى هيليوم تحت ضغط هائل، وتولد الطاقة التي تغذي ضوء الشمس وحرارتها.",
    enText:
      "The solar center where nuclear fusion converts hydrogen into helium under immense pressure, producing the Sun's light and heat.",
  },
  {
    id: "radiative",
    color: "bg-yellow-300",
    ar: "النطاق الإشعاعي",
    en: "Radiative Zone",
    arMeta: "نقل الطاقة",
    enMeta: "Energy transport",
    arText:
      "طبقة كثيفة تنتقل فيها الطاقة على شكل إشعاع. قد تحتاج الفوتونات آلاف السنين حتى تعبرها بسبب التصادمات المستمرة.",
    enText:
      "A dense layer where energy travels as radiation. Photons can take thousands of years to escape through repeated scattering.",
  },
  {
    id: "convective",
    color: "bg-orange-500",
    ar: "النطاق الحملي",
    en: "Convective Zone",
    arMeta: "تيارات الحمل",
    enMeta: "Plasma currents",
    arText:
      "هنا ترتفع البلازما الساخنة وتهبط البلازما الأبرد، فتتشكل خلايا الحمل التي تعطي سطح الشمس مظهره الحبيبي.",
    enText:
      "Hot plasma rises while cooler plasma sinks, creating convection cells that give the solar surface its granular texture.",
  },
  {
    id: "photosphere",
    color: "bg-amber-300",
    ar: "الغلاف الضوئي",
    en: "Photosphere",
    arMeta: "سطح الشمس",
    enMeta: "Visible surface",
    arText:
      "الطبقة المرئية من الشمس وموطن الحبيبات والبقع الشمسية. معظم الضوء الذي نراه يصدر من هذه المنطقة.",
    enText:
      "The visible solar surface, home to granules and sunspots. Most sunlight we see comes from this region.",
  },
  {
    id: "chromosphere",
    color: "bg-rose-500",
    ar: "الغلاف اللوني",
    en: "Chromosphere",
    arMeta: "طبقة حمراء",
    enMeta: "Red layer",
    arText:
      "طبقة رقيقة فوق الغلاف الضوئي تظهر بلون أحمر أثناء الكسوف، وتنشأ منها الكثير من الشواظ الشمسية.",
    enText:
      "A thin layer above the photosphere that appears red during eclipses and feeds many solar prominences.",
  },
  {
    id: "corona",
    color: "bg-orange-100",
    ar: "الإكليل",
    en: "Corona",
    arMeta: "هالة شمسية",
    enMeta: "Solar halo",
    arText:
      "الغلاف الخارجي شديد الحرارة للشمس. يمتد بعيداً في الفضاء ويظهر بوضوح أثناء الكسوف الكلي.",
    enText:
      "The Sun's extremely hot outer atmosphere. It stretches far into space and is clearest during total eclipses.",
  },
];

function SunSimulatorPage() {
  const [isPaused, setIsPaused] = useState(false);
  const [showFlares, setShowFlares] = useState(true);
  const [showCorona, setShowCorona] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState("photosphere");
  const [resetKey, setResetKey] = useState(0);
  const navigate = useNavigate();
  const { language, isArabic } = useLanguage();
  const text = copy[language];
  const activeLayer = layers.find((layer) => layer.id === selectedLayer) ?? layers[3];

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white"  dir={isArabic ? "rtl" : "ltr"}>
      <SunScene
        isPaused={isPaused}
        key={resetKey}
        onPausedChange={setIsPaused}
        selectedLayer={selectedLayer}
        showCorona={showCorona}
        showFlares={showFlares}
      />
      <SimulationSound language={language} tone="orange" videoId="aMNi7UX6wOc" />
      <CosmicNavbar menuLabel={text.menuLabel} selectedBody="sun" tone="orange" />

      <header
        className={`pointer-events-auto fixed top-4 z-20 flex items-start gap-3 ${
          isArabic ? "left-4 right-20 justify-start" : "left-20 right-4 justify-end"
        }`}
      >
        <div className="hidden rounded-full border border-orange-200/25 bg-black/45 px-6 py-3 text-sm font-bold text-orange-50 shadow-xl shadow-orange-950/25 backdrop-blur-xl md:block">
          {text.instructions}
        </div>
        {/* <button
          className="rounded-full border border-orange-200/18 bg-black/48 px-5 py-3 text-sm font-semibold text-white/80 shadow-xl shadow-orange-950/25 backdrop-blur-xl transition hover:bg-orange-200/10"
          onClick={() => setIsPaused((value) => !value)}
          type="button"
        >
          {isPaused ? text.play : text.pause}
        </button> */}
        {/* <button
          className="rounded-full border border-orange-200/18 bg-black/48 px-5 py-3 text-sm font-semibold text-white/80 shadow-xl shadow-orange-950/25 backdrop-blur-xl transition hover:bg-orange-200/10"
          onClick={() => setResetKey((value) => value + 1)}
          type="button"
        >
          {text.reset}
        </button> */}
      </header>

      {/* <section className="pointer-events-none fixed left-1/2 top-5 z-20 -translate-x-1/2 text-center">
        <div className="rounded-full border border-orange-100/35 bg-gradient-to-r from-orange-600/90 via-yellow-300/85 to-orange-600/90 px-8 py-3 shadow-[0_0_42px_rgba(255,146,24,0.55)]">
          <h1 className="text-2xl font-black text-white drop-shadow-[0_0_18px_rgba(255,245,170,0.95)] md:text-4xl">
            {text.title}
          </h1>
          <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-yellow-50/90 md:text-sm">{text.subtitle}</p>
        </div>
      </section> */}

      {/* <aside className={`pointer-events-auto fixed top-32 z-20 hidden w-80 space-y-4 xl:block ${isArabic ? "left-5" : "right-5"}`}>
        <section className="max-h-[calc(100vh-10rem)] overflow-y-auto rounded-xl border border-orange-200/22 bg-black/50 p-5 shadow-2xl shadow-orange-950/25 backdrop-blur-2xl">
          <h3 className="text-xl font-bold text-orange-200">{isArabic ? activeLayer.ar : activeLayer.en}</h3>
          <p className="mt-3 text-sm leading-7 text-white/70">{isArabic ? activeLayer.arText : activeLayer.enText}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
            <span className="rounded-full border border-orange-200/18 bg-orange-200/10 px-3 py-1">{isArabic ? "اندماج نووي" : "Nuclear fusion"}</span>
            <span className="rounded-full border border-orange-200/18 bg-orange-200/10 px-3 py-1">{isArabic ? "بلازما" : "Plasma"}</span>
            <span className="rounded-full border border-orange-200/18 bg-orange-200/10 px-3 py-1">{isArabic ? "نجم قزم أصفر" : "Yellow dwarf"}</span>
          </div>
        </section> */}

        {/* <section className="rounded-xl border border-orange-200/22 bg-black/50 p-5 shadow-2xl shadow-orange-950/25 backdrop-blur-2xl">
          <h4 className="text-lg font-bold text-orange-200">{text.statsTitle}</h4>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {text.facts.map(([label, value]) => (
              <div className="rounded-lg border border-orange-200/14 bg-white/[0.04] p-3" key={label}>
                <p className="text-xs text-white/45">{label}</p>
                <p className="mt-1 text-sm font-bold text-orange-50">{value}</p>
              </div>
            ))}
          </div>
        </section> */}
      {/* </aside> */}

      <aside className={`pointer-events-auto fixed top-24 z-20 hidden w-60 lg:block ${isArabic ? "right-5" : "left-5"}`}>
        <section className="max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl border border-orange-200/22 bg-black/50 p-4 shadow-2xl shadow-orange-950/25 backdrop-blur-2xl">
          <h4 className="text-base font-bold text-orange-200">{text.layersTitle}</h4>
          <div className="mt-3 space-y-1.5">
            {layers.map((layer) => (
              <button
                className={`flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2.5 transition ${
                  isArabic ? "text-right" : "text-left"
                } ${
                  selectedLayer === layer.id
                    ? "border-orange-200/70 bg-orange-200/16 shadow-[0_0_22px_rgba(255,146,24,0.22)]"
                    : "border-white/10 bg-white/[0.03] hover:border-orange-200/35"
                }`}
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                type="button"
              >
                <span className={`h-3 w-3 shrink-0 rounded-full ${layer.color} shadow-[0_0_14px_currentColor]`} />
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold leading-5">{isArabic ? layer.ar : layer.en}</span>
                  <span className="block text-[11px] leading-4 text-white/45">{isArabic ? layer.arMeta : layer.enMeta}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </aside>

      <div className="pointer-events-none fixed bottom-5 left-5 right-5 z-20 flex flex-wrap items-end justify-between gap-3">
        <div className="rounded-full border border-orange-200/16 bg-black/52 px-5 py-3 text-sm text-white/78 shadow-xl shadow-orange-950/25 backdrop-blur-xl">
          {text.status}{" "}
          <span className={isPaused ? "text-orange-200" : "text-emerald-200"}>{isPaused ? text.paused : text.live}</span>
        </div>
        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          <button
            className="rounded-full border border-orange-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-orange-950/25 backdrop-blur-xl transition hover:bg-orange-200/10"
            onClick={() => setShowFlares((value) => !value)}
            type="button"
          >
            {showFlares ? text.flares : text.flaresHidden}
          </button>
          <button
            className="rounded-full border border-orange-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-orange-950/25 backdrop-blur-xl transition hover:bg-orange-200/10"
            onClick={() => setShowCorona((value) => !value)}
            type="button"
          >
            {showCorona ? text.corona : text.coronaHidden}
          </button>
          <button
            className="hidden rounded-full border border-orange-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-orange-950/25 backdrop-blur-xl transition hover:bg-orange-200/10 md:block"
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

export default SunSimulatorPage;
