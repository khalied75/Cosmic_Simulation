import { useState } from "react";
import { Link } from "react-router-dom";
import CosmicNavbar from "../components/CosmicNavbar";
import SpacetimeFabricToggle from "../components/SpacetimeFabricToggle";
import NeutronBinaryScene from "../components/NeutronBinaryScene";
import { useLanguage } from "../context/LanguageContext";
import "./binarySimulator.css";

export default function BinarySimulatorPage({ blackHoles = false }) {
  const { isArabic } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);
  const [restart, setRestart] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [stage, setStage] = useState(0);
  const bodyId = blackHoles ? "black-hole-binary" : "neutron-binary";
  const stages = isArabic
    ? ["دوران وتقارب", blackHoles ? "اندماج الثقبين" : "اندماج النجمين", blackHoles ? "ثقب أسود واحد · استقرار" : "بقايا الاندماج"]
    : ["Inspiral", "Merging", blackHoles ? "Single black hole · Ringdown" : "Merger remnant"];
  return (
    <main className="binary-page bg-[#02030c] text-white" dir={isArabic ? "rtl" : "ltr"}>
      <CosmicNavbar selectedBody={bodyId} tone="indigo" showFabricToggle={false} menuLabel={isArabic ? "فتح القائمة" : "Open menu"} />
      <header className="binary-header rounded-2xl border border-indigo-200/20 bg-black/45 px-4 py-3 backdrop-blur-xl">
        <h1 className="text-lg font-bold text-indigo-50">{blackHoles ? (isArabic ? "ثنائي ثقوب سوداء" : "Black Hole Binary") : (isArabic ? "ثنائي نيتروني" : "Neutron Binary")}</h1>
        <p className="mt-1 text-xs leading-relaxed text-indigo-100/65">{isArabic ? "مدار متقلص · اندماج · موجات جاذبية" : "Inspiral · Merger · Gravitational waves"}</p>
        <p className="mt-2 hidden text-xs text-white/50 md:block">{isArabic ? "اسحب للتدوير · مرّر للتكبير · نقرتان للإيقاف" : "Drag to orbit · Scroll to zoom · Double-click to pause"}</p>
      </header>
      <div className="binary-viewport">
        <NeutronBinaryScene blackHoles={blackHoles} isPaused={isPaused} onPausedChange={setIsPaused} restart={restart} speed={speed} onStageChange={setStage} />
      </div>
      <footer className="binary-footer">
        <section className="binary-status rounded-2xl border border-indigo-200/20 bg-black/55 px-4 py-3 backdrop-blur-xl">
          <p className={`text-sm ${isPaused ? "text-orange-200" : "text-cyan-200"}`} aria-live="polite">{isPaused ? (isArabic ? "متوقفة" : "Paused") : stages[stage]}</p>
          <p className="mt-2 text-xs leading-relaxed text-white/55">{isArabic ? "تمثيل توضيحي · الزمن وتشوه الغشاء بمقياس بصري" : "Illustration · Time and fabric displacement visually scaled"}</p>
          {blackHoles && <p className="mt-1 text-xs leading-relaxed text-white/45">{isArabic ? "الحلقات المضيئة تحدد الظلال بصريًا" : "Luminous outlines mark the black hole shadows"}</p>}
        </section>
        <div className="binary-actions">
          <SpacetimeFabricToggle bodyId={bodyId} tone="indigo" inline />
          <button className="binary-button" type="button" aria-pressed={isPaused} onClick={() => setIsPaused(v => !v)}>{isArabic ? (isPaused ? "تشغيل" : "إيقاف مؤقت") : (isPaused ? "Resume" : "Pause")}</button>
          <button className="binary-button" type="button" onClick={() => { setRestart(v => v + 1); setIsPaused(false); }}>{isArabic ? "إعادة المحاكاة" : "Restart"}</button>
          <label className="binary-button flex items-center justify-center gap-2">
            <span>{isArabic ? "السرعة" : "Speed"}</span>
            <select className="min-w-0 bg-transparent text-indigo-100" value={speed} onChange={e => setSpeed(Number(e.target.value))}>
              {[0.5, 1, 2].map(v => <option className="bg-slate-950" key={v} value={v}>{v}×</option>)}
            </select>
          </label>
          <Link className="binary-button binary-return" to="/">{isArabic ? "العودة لاختيار محاكيات أخرى" : "Choose Another Simulator"}</Link>
        </div>
      </footer>
    </main>
  );
}
