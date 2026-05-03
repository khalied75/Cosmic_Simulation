import { Link } from "react-router-dom";

const simulators = [
  {
    id: "sun",
    title: "محاكاة الشمس",
    englishTitle: "Sun Simulator",
    description: "نجم مركزي تفاعلي مع نسيج شمسي متوهج، بقع شمسية، شواظ متحركة، إكليل ديناميكي، وطبقات يمكن اختيارها.",
    path: "/sun",
    status: "جاهز",
    accent: "orange",
  },
  {
    id: "earth",
    title: "محاكاة الأرض",
    englishTitle: "Earth Simulator",
    description: "كوكب تفاعلي ثلاثي الأبعاد مع دوران، تكبير، غيوم، إضاءة، وعلامات مدن.",
    path: "/earth",
    status: "جاهز",
    accent: "cyan",
  },
  {
    id: "jupiter",
    title: "محاكاة المشتري",
    englishTitle: "Jupiter Simulator",
    description: "عملاق غازي واقعي مع أحزمته، البقعة الحمراء، حلقات خافتة، وأقمار غاليليو.",
    path: "/jupiter",
    status: "جاهز",
    accent: "amber",
  },
  {
    id: "black-hole",
    title: "الثقب الأسود",
    englishTitle: "Black Hole",
    description: "محاكاة للجاذبية وقرص التراكم وانحناء الضوء. ستضاف في المرحلة القادمة.",
    path: "/black-hole",
    status: "قريباً",
    accent: "violet",
  },
  {
    id: "saturn",
    title: "محاكاة زحل",
    englishTitle: "Saturn Simulator",
    description: "كوكب زحل بحلقاته الجليدية، أقمار أساسية، وواجهة تفاعل بسيطة مثل باقي المحاكيات.",
    path: "/saturn",
    status: "جاهز",
    accent: "amber",
  },
];

function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#030511] text-white" dir="rtl">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(98,219,232,0.16),transparent_26%),radial-gradient(circle_at_84%_22%,rgba(214,154,82,0.14),transparent_24%),linear-gradient(180deg,#030511,#080b17_58%,#030511)]" />
      <div className="pointer-events-none fixed inset-0 opacity-70 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:58px_58px]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-14 md:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200">
            Cosmic Simulation
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight md:text-7xl">
            بوابة محاكاة الكون
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/68 md:text-lg">
            صفحة رئيسية لاختيار المحاكيات وقراءة نظرة عامة قبل الدخول إلى التجربة.
            كل محاكي يفتح في صفحة مستقلة حتى تبقى مساحة العرض نظيفة ومركزة.
          </p>
          <p className="mt-6 inline-flex rounded-full border border-cyan-200/25 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-100">
            إعداد: خالد جمال الزعبي
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {simulators.map((simulator) => {
            const isReady = ["جاهز", "Ready"].includes(simulator.status);
            const accentClass =
              simulator.accent === "orange"
                ? "hover:border-orange-200/45 text-orange-100"
                : simulator.accent === "amber"
                ? "hover:border-amber-200/45 text-amber-100"
                : simulator.accent === "violet"
                  ? "hover:border-violet-200/45 text-violet-100"
                  : "hover:border-cyan-200/45 text-cyan-100";
            const badgeClass =
              simulator.accent === "orange"
                ? "bg-orange-200 text-slate-950"
                : simulator.accent === "amber"
                ? "bg-amber-200 text-slate-950"
                : "bg-cyan-200 text-slate-950";
            const content = (
              <article className={`h-full rounded-xl border border-white/12 bg-white/[0.045] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:bg-white/[0.07] ${accentClass}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                      {simulator.englishTitle}
                    </p>
                    <h2 className="mt-3 text-2xl font-bold text-white">{simulator.title}</h2>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${isReady ? badgeClass : "bg-white/10 text-white/55"}`}>
                    {simulator.status}
                  </span>
                </div>
                <p className="mt-5 min-h-24 text-sm leading-7 text-white/62">
                  {simulator.description}
                </p>
                <div className="mt-6 text-sm font-bold">
                  {isReady ? "افتح المحاكي" : "غير متاح الآن"}
                </div>
              </article>
            );

            return isReady ? (
              <Link key={simulator.id} to={simulator.path}>
                {content}
              </Link>
            ) : (
              <div className="cursor-not-allowed opacity-70" key={simulator.id}>
                {content}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default HomePage;
