import { useState } from "react";
import CosmicNavbar from "../components/CosmicNavbar";
import NeutronBinaryScene from "../components/NeutronBinaryScene";
import { useLanguage } from "../context/LanguageContext";

export default function NeutronBinarySimulatorPage() {
  const { isArabic } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);
  const [restart, setRestart] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [stage, setStage] = useState(0);
  const button = "rounded-full border border-indigo-200/20 bg-black/55 px-4 py-3 text-sm font-semibold text-indigo-50 shadow-xl backdrop-blur-xl transition hover:bg-indigo-200/10";
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02030c] text-white" dir={isArabic ? "rtl" : "ltr"}>
      <NeutronBinaryScene isPaused={isPaused} onPausedChange={setIsPaused} restart={restart} speed={speed} onStageChange={setStage} />
      <CosmicNavbar selectedBody="neutron-binary" tone="indigo" menuLabel={isArabic ? "فتح القائمة" : "Open menu"} />
      <header className={`pointer-events-none fixed top-4 z-20 max-w-[75vw] rounded-2xl border border-indigo-200/20 bg-black/45 px-5 py-3 backdrop-blur-xl ${isArabic ? "left-4" : "right-4"}`}>
        <h1 className="text-lg font-bold text-indigo-50">{isArabic ? "ثنائي نيتروني" : "Neutron Binary"}</h1>
        <p className="mt-1 text-xs text-indigo-100/65">{isArabic ? "نجمان · مدار متقلص · موجات جاذبية" : "Two stars · Inspiral · Gravitational waves"}</p>
        <p className="mt-2 hidden text-xs text-white/50 md:block">{isArabic ? "اسحب للتدوير · مرّر للتكبير · نقرتان للإيقاف" : "Drag to orbit · Scroll to zoom · Double-click to pause"}</p>
      </header>
      <div className="pointer-events-none fixed bottom-5 left-5 right-5 z-20 flex flex-wrap items-end justify-between gap-3">
        <div className="rounded-2xl border border-indigo-200/20 bg-black/55 px-4 py-3 text-sm backdrop-blur-xl">
          <p className={isPaused ? "text-orange-200" : "text-cyan-200"} aria-live="polite">{isPaused ? (isArabic ? "متوقفة" : "Paused") : (isArabic ? ["دوران وتقارب", "اندماج النجمين", "بقايا الاندماج"][stage] : ["Inspiral", "Merging", "Merger remnant"][stage])}</p>
          <p className="mt-1 text-[10px] text-white/45">{isArabic ? "تمثيل توضيحي · الزمن وتشوه الغشاء بمقياس بصري" : "Illustration · Time and fabric displacement visually scaled"}</p>
        </div>
        <div className="pointer-events-auto flex flex-wrap gap-2">
          <button className={button} type="button" aria-pressed={isPaused} onClick={() => setIsPaused(v => !v)}>{isArabic ? (isPaused ? "تشغيل" : "إيقاف مؤقت") : (isPaused ? "Resume" : "Pause")}</button>
          <button className={button} type="button" onClick={() => { setRestart(v => v + 1); setIsPaused(false); }}>{isArabic ? "إعادة المحاكاة" : "Restart"}</button>
          <label className={`${button} flex items-center gap-2`}>
            <span>{isArabic ? "السرعة" : "Speed"}</span>
            <select className="bg-transparent text-indigo-100" value={speed} onChange={e => setSpeed(Number(e.target.value))}>
              {[0.5, 1, 2].map(v => <option className="bg-slate-950" key={v} value={v}>{v}×</option>)}
            </select>
          </label>
        </div>
      </div>
    </main>
  );
}
