import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BubbleUniverseScene from "../components/BubbleUniverseScene";
import CosmicNavbar from "../components/CosmicNavbar";
import { useLanguage } from "../context/LanguageContext";

const copy = {
  AR: {
    menuLabel: "فتح القائمة",
    instructions: "اسحب للدوران · مرّر أو قرّب للتكبير · اضغط على فقاعة أو الثقب الأسود للانتقال إليه",
    status: "محاكاة الفقاعات الكونية ·",
    live: "نشطة",
    paused: "متوقفة",
    pause: "إيقاف الحركة",
    resume: "متابعة الحركة",
    overview: "العودة إلى المشهد العام",
    choose: "اختر محاكيًا آخر",
  },
  EN: {
    menuLabel: "Open menu",
    instructions: "Drag to orbit · Scroll or pinch to zoom · Select a bubble or the black hole to travel to it",
    status: "Cosmic Bubble Simulation ·",
    live: "Live",
    paused: "Paused",
    pause: "Pause Motion",
    resume: "Resume Motion",
    overview: "Return to Overview",
    choose: "Choose Another Simulator",
  },
};

function BubbleUniverseSimulatorPage() {
  const [isPaused, setIsPaused] = useState(false);
  const [focusedBubble, setFocusedBubble] = useState(null);
  const [resetVersion, setResetVersion] = useState(0);
  const navigate = useNavigate();
  const { language, isArabic } = useLanguage();
  const text = copy[language];

  const returnToOverview = () => {
    setFocusedBubble(null);
    setResetVersion((value) => value + 1);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#01020a] text-white" dir={isArabic ? "rtl" : "ltr"}>
      <BubbleUniverseScene
        isPaused={isPaused}
        onFocusChange={setFocusedBubble}
        resetVersion={resetVersion}
      />

      <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(circle_at_50%_42%,transparent_38%,rgba(1,2,10,0.32)_74%,rgba(1,2,10,0.72)_100%)]" />

      <CosmicNavbar menuLabel={text.menuLabel} selectedBody="bubble-universe" tone="violet" />

      <header
        className={`pointer-events-none fixed top-4 z-20 flex items-center ${
          isArabic ? "left-4 right-20 justify-start" : "left-20 right-4 justify-end"
        }`}
      >
        <div className="hidden rounded-full border border-violet-200/20 bg-black/45 px-6 py-3 text-sm font-bold text-violet-50 shadow-xl shadow-black/25 backdrop-blur-xl md:block">
          {text.instructions}
        </div>
      </header>

      <div
        aria-live="polite"
        className={`pointer-events-none fixed left-1/2 top-24 z-20 -translate-x-1/2 transition duration-500 ${
          focusedBubble ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        <p className="whitespace-nowrap rounded-full border border-cyan-100/25 bg-black/52 px-6 py-3 text-base font-bold text-cyan-50 shadow-[0_0_36px_rgba(103,232,249,0.2)] backdrop-blur-xl md:text-lg">
          {focusedBubble?.[language] ?? ""}
        </p>
      </div>

      <div className="pointer-events-none fixed bottom-5 left-5 right-5 z-20 flex flex-wrap items-end justify-between gap-3">
        <div className="rounded-full border border-violet-200/16 bg-black/52 px-5 py-3 text-sm text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl">
          {text.status}{" "}
          <span className={isPaused ? "text-orange-200" : "text-emerald-200"}>
            {isPaused ? text.paused : text.live}
          </span>
        </div>

        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          {focusedBubble && (
            <button
              className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-5 py-3 text-sm font-semibold text-cyan-50 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-cyan-200/16"
              onClick={returnToOverview}
              type="button"
            >
              {text.overview}
            </button>
          )}
          <button
            aria-pressed={isPaused}
            className="rounded-full border border-violet-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-violet-200/10"
            onClick={() => setIsPaused((value) => !value)}
            type="button"
          >
            {isPaused ? text.resume : text.pause}
          </button>
          <button
            className="hidden rounded-full border border-violet-200/16 bg-black/52 px-5 py-3 text-sm font-semibold text-white/78 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:bg-violet-200/10 md:block"
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

export default BubbleUniverseSimulatorPage;
