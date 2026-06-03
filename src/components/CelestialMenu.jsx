const bodies = [
  {
    id: "sun",
    name: "Sun",
    arabicName: "الشمس",
    type: "Star",
    arabicType: "نجم",
    status: "Ready",
    arabicStatus: "جاهز",
    color: "bg-orange-300",
  },
  {
    id: "earth",
    name: "Earth",
    arabicName: "الأرض",
    type: "Planet",
    arabicType: "كوكب",
    status: "Ready",
    arabicStatus: "جاهز",
    color: "bg-cyan-200",
  },
  {
    id: "venus",
    name: "Venus",
    arabicName: "الزهرة",
    type: "Terrestrial Planet",
    arabicType: "كوكب صخري",
    status: "Ready",
    arabicStatus: "جاهز",
    color: "bg-yellow-200",
  },
  {
    id: "mars",
    name: "Mars",
    arabicName: "المريخ",
    type: "Terrestrial Planet",
    arabicType: "الكوكب الأحمر",
    status: "Ready",
    arabicStatus: "جاهز",
    color: "bg-red-400",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    arabicName: "المشتري",
    type: "Gas Giant",
    arabicType: "عملاق غازي",
    status: "Ready",
    arabicStatus: "جاهز",
    color: "bg-amber-200",
  },
  {
    id: "black-hole",
    name: "Black Hole",
    arabicName: "الثقب الأسود",
    type: "Gravity",
    arabicType: "جاذبية",
    status: "Ready",
    arabicStatus: "جاهز",
    color: "bg-violet-300",
  },
  {
    id: "milky-way",
    name: "Milky Way",
    arabicName: "درب التبانة",
    type: "Galaxy",
    arabicType: "مجرة حلزونية",
    status: "Ready",
    arabicStatus: "جاهز",
    color: "bg-sky-200",
  },
  {
    id: "magnetar",
    name: "Magnetar",
    arabicName: "النجم المغناطيسي",
    type: "Neutron Star",
    arabicType: "نجم نيوتروني",
    status: "Ready",
    arabicStatus: "جاهز",
    color: "bg-indigo-300",
  },
  {
    id: "saturn",
    name: "Saturn",
    arabicName: "زحل",
    type: "Ringed Planet",
    arabicType: "كوكب حلقي",
    status: "Ready",
    arabicStatus: "جاهز",
    color: "bg-yellow-100",
  },
  {
    id: "neptune",
    name: "Neptune",
    arabicName: "نبتون",
    type: "Ice Giant",
    arabicType: "عملاق جليدي",
    status: "Ready",
    arabicStatus: "جاهز",
    color: "bg-sky-300",
  },
  {
    id: "uranus",
    name: "Uranus",
    arabicName: "أورانوس",
    type: "Ice Giant",
    arabicType: "عملاق جليدي",
    status: "Ready",
    arabicStatus: "جاهز",
    color: "bg-cyan-300",
  },
];

const languages = ["AR", "EN"];

function CelestialMenu({
  selectedBody,
  onSelectBody,
  language,
  onLanguageChange,
  isOpen,
  onClose,
}) {
  const isArabic = language === "AR";

  return (
    <aside
      className={`pointer-events-auto fixed top-4 z-30 flex max-h-[calc(100vh-2rem)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-white/12 bg-black/42 text-white shadow-2xl shadow-black/45 backdrop-blur-2xl transition duration-300 ${
        isArabic ? "right-4" : "left-4"
      } ${
        isOpen
          ? "translate-x-0 opacity-100"
          : isArabic
            ? "translate-x-[115%] opacity-0"
            : "-translate-x-[115%] opacity-0"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Cosmic</p>
          <h1 className="mt-1 text-lg font-semibold">{isArabic ? "قائمة المحاكيات" : "Simulators Menu"}</h1>
        </div>
        <button
          aria-label={isArabic ? "إغلاق القائمة" : "Close menu"}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-white/6 text-lg text-white/75 transition hover:bg-white/12 hover:text-white"
          onClick={onClose}
          type="button"
        >
          x
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">
          {isArabic ? "اللغة" : "Language"}
        </span>
        <div className="flex rounded-full border border-white/15 bg-white/5 p-1">
          {languages.map((item) => (
            <button
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                language === item ? "bg-cyan-200 text-slate-950" : "text-white/70 hover:text-white"
              }`}
              key={item}
              onClick={() => onLanguageChange(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-3 px-2 text-xs font-medium uppercase tracking-[0.22em] text-white/45">
          {isArabic ? "المحاكيات" : "Simulators"}
        </p>
        <div className="space-y-2">
          {bodies.map((body) => {
            const isSelected = selectedBody === body.id;
            const title = isArabic ? body.arabicName : body.name;
            const subtitle = isArabic
              ? `${body.name} - ${body.arabicType}`
              : `${body.arabicName} - ${body.type}`;

            return (
              <button
                className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-3 transition ${
                  isArabic ? "text-right" : "text-left"
                } ${
                  isSelected
                    ? "border-cyan-200/70 bg-cyan-200/12"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.07]"
                }`}
                key={body.id}
                onClick={() => onSelectBody(body.id)}
                type="button"
              >
                <span className={`h-3 w-3 shrink-0 rounded-full ${body.color} shadow-[0_0_18px_currentColor]`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block truncate text-xs text-white/50">{subtitle}</span>
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    body.status === "Ready" ? "bg-cyan-200 text-slate-950" : "bg-white/10 text-white/55"
                  }`}
                >
                  {isArabic ? body.arabicStatus : body.status}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

export default CelestialMenu;
