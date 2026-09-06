import { useLanguage } from "../context/LanguageContext";
import { toggleSpacetimeFabric, useSpacetimeFabric } from "./spacetimeFabricState";

const labels = {
  EN: {
    show: "Spacetime Fabric",
    hide: "Hide Fabric",
  },
  AR: {
    show: "غشاء الزمكان",
    hide: "إخفاء الغشاء",
  },
};

function SpacetimeFabricToggle({ bodyId, tone = "white", inline = false }) {
  const { language } = useLanguage();
  const isOpen = useSpacetimeFabric(bodyId);
  const text = labels[language] ?? labels.EN;

  const toneClass =
    {
      amber: "border-amber-200/20 hover:bg-amber-200/10",
      cyan: "border-cyan-200/20 hover:bg-cyan-200/10",
      indigo: "border-indigo-200/20 hover:bg-indigo-200/10",
      orange: "border-orange-200/20 hover:bg-orange-200/10",
      sky: "border-sky-200/20 hover:bg-sky-200/10",
      yellow: "border-yellow-200/20 hover:bg-yellow-200/10",
      white: "border-white/15 hover:bg-white/10",
    }[tone] ?? "border-white/15 hover:bg-white/10";

  return (
    <button
      aria-pressed={isOpen}
      className={`pointer-events-auto ${inline ? "min-h-11 w-full" : "fixed bottom-36 left-1/2 z-30 -translate-x-1/2 md:bottom-20 md:left-5 md:translate-x-0"} rounded-full border bg-black/52 px-4 py-2 text-sm font-semibold text-white/82 shadow-xl shadow-black/25 backdrop-blur-xl transition ${toneClass}`}
      onClick={() => toggleSpacetimeFabric(bodyId)}
      type="button"
    >
      {isOpen ? text.hide : text.show}
    </button>
  );
}

export default SpacetimeFabricToggle;
