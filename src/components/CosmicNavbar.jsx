import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import CelestialMenu from "./CelestialMenu";
import SpacetimeFabricToggle from "./SpacetimeFabricToggle";

const routes = {
  sun: "/sun",
  earth: "/earth",
  "atomic-simulation": "/atomic-simulation",
  venus: "/venus",
  uranus: "/uranus",
  mars: "/mars",
  jupiter: "/jupiter",
  saturn: "/saturn",
  neptune: "/neptune",
  magnetar: "/magnetar",
  "black-hole": "/black-hole",
  "milky-way": "/milky-way",
};

function CosmicNavbar({ selectedBody, menuLabel, tone = "default" }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isArabic } = useLanguage();

  const toneClass =
    {
      amber: "border-amber-200/18",
      cyan: "border-cyan-200/18",
      indigo: "border-indigo-200/18",
      orange: "border-orange-200/18",
      sky: "border-sky-200/18",
      white: "border-white/15",
      yellow: "border-yellow-200/18",
    }[tone] ?? "border-white/15";

  const handleSelectBody = (bodyId) => {
    if (bodyId === selectedBody) {
      setIsOpen(false);
      return;
    }

    if (routes[bodyId]) {
      navigate(routes[bodyId]);
    }
  };

  return (
    <>
      <button
        aria-label={menuLabel}
        className={`fixed top-4 z-40 grid h-11 w-11 place-items-center rounded-full border bg-black/42 text-xl text-white shadow-xl shadow-black/35 backdrop-blur-xl transition hover:bg-white/10 ${
          isArabic ? "right-4" : "left-4"
        } ${toneClass} ${isOpen ? "pointer-events-none scale-90 opacity-0" : "opacity-100"}`}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        =
      </button>

      <CelestialMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelectBody={handleSelectBody}
        selectedBody={selectedBody}
      />

      {selectedBody !== "atomic-simulation" && <SpacetimeFabricToggle bodyId={selectedBody} tone={tone} />}
    </>
  );
}

export default CosmicNavbar;
