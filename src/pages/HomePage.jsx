import { useState } from "react";
import { Link } from "react-router-dom";

const copy = {
  AR: {
    dir: "rtl",
    badge: "Cosmic Simulation",
    heading: "بوابة محاكاة الكون",
    intro:
      "صفحة رئيسية لاختيار المحاكيات وقراءة نظرة عامة قبل الدخول إلى التجربة. كل محاكي يفتح في صفحة مستقلة حتى تبقى مساحة العرض نظيفة ومركزة.",
    credit: "إعداد: خالد جمال الزعبي",
    open: "افتح المحاكي",
    unavailable: "غير متاح الآن",
    ready: "جاهز",
    soon: "قريباً",
  },
  EN: {
    dir: "ltr",
    badge: "Cosmic Simulation",
    heading: "Cosmic Simulation Portal",
    intro:
      "Choose a simulator and get a quick overview before entering the experience. Each simulator opens on its own page so the viewing area stays clean and focused.",
    credit: "Prepared by: Khaled Jamal Al-Zoubi",
    open: "Open Simulator",
    unavailable: "Not Available Yet",
    ready: "Ready",
    soon: "Soon",
  },
};

const simulators = [
  {
    id: "sun",
    title: { AR: "محاكاة الشمس", EN: "Sun Simulator" },
    subtitle: { AR: "Sun Simulator", EN: "الشمس" },
    description: {
      AR: "نجم مركزي تفاعلي مع نسيج شمسي متوهج، بقع شمسية، شواظ متحركة، إكليل ديناميكي، وطبقات يمكن اختيارها.",
      EN: "An interactive central star with a glowing solar texture, sunspots, moving prominences, a dynamic corona, and selectable layers.",
    },
    path: "/sun",
    status: "ready",
    accent: "orange",
  },
  {
    id: "earth",
    title: { AR: "محاكاة الأرض", EN: "Earth Simulator" },
    subtitle: { AR: "Earth Simulator", EN: "الأرض" },
    description: {
      AR: "كوكب تفاعلي ثلاثي الأبعاد مع دوران، تكبير، غيوم، إضاءة، وعلامات مدن.",
      EN: "A 3D interactive planet with rotation, zoom, clouds, lighting, and a more realistic surface.",
    },
    path: "/earth",
    status: "ready",
    accent: "cyan",
  },
  {
    id: "venus",
    title: { AR: "محاكاة الزهرة", EN: "Venus Simulator" },
    subtitle: { AR: "Venus Simulator", EN: "الزهرة" },
    description: {
      AR: "كوكب لامع بغلاف جوي كثيف، سحب كبريتية ذهبية، سطح صخري ساخن، وحركة سحب سريعة.",
      EN: "A bright planet with a dense atmosphere, golden sulfur clouds, a hot rocky surface, and fast-moving cloud layers.",
    },
    path: "/venus",
    status: "ready",
    accent: "yellow",
  },
  {
    id: "uranus",
    title: { AR: "محاكاة أورانوس", EN: "Uranus Simulator" },
    subtitle: { AR: "Uranus Simulator", EN: "أورانوس" },
    description: {
      AR: "عملاق فيروزي هادئ مع ميل محوري حاد، حلقات شبه عمودية، غلاف بارد، وأحزمة جوية خفيفة جداً.",
      EN: "A calm turquoise giant with an extreme axial tilt, near-vertical rings, a cold atmosphere, and very subtle atmospheric bands.",
    },
    path: "/uranus",
    status: "ready",
    accent: "teal",
  },
  {
    id: "mars",
    title: { AR: "محاكاة المريخ", EN: "Mars Simulator" },
    subtitle: { AR: "Mars Simulator", EN: "المريخ" },
    description: {
      AR: "الكوكب الأحمر بنسيج عالي الواقعية، فوهات تصادمية، أغطية قطبية، غبار مرئي، وقمري فوبوس وديموس.",
      EN: "The Red Planet with a highly realistic texture, impact craters, polar caps, visible dust, and the moons Phobos and Deimos.",
    },
    path: "/mars",
    status: "ready",
    accent: "red",
  },
  {
    id: "jupiter",
    title: { AR: "محاكاة المشتري", EN: "Jupiter Simulator" },
    subtitle: { AR: "Jupiter Simulator", EN: "المشتري" },
    description: {
      AR: "عملاق غازي واقعي مع أحزمته، البقعة الحمراء، حلقات خافتة، وأقمار غاليليو.",
      EN: "A realistic gas giant with bands, the Great Red Spot, faint rings, and the Galilean moons.",
    },
    path: "/jupiter",
    status: "ready",
    accent: "amber",
  },
  {
    id: "milky-way",
    title: { AR: "محاكاة درب التبانة", EN: "Milky Way Simulator" },
    subtitle: { AR: "Milky Way", EN: "درب التبانة" },
    description: {
      AR: "مجرة حلزونية ثلاثية الأبعاد مع نواة مضيئة، أذرع نجمية متدرجة، سحب غبار، ومجرات قزمة صغيرة حولها لإحساس بصري أقرب للواقع.",
      EN: "A 3D spiral galaxy with a luminous core, layered stellar arms, dust lanes, and small satellite galaxies for a more realistic look.",
    },
    path: "/milky-way",
    status: "ready",
    accent: "sky",
  },
  {
    id: "black-hole",
    title: { AR: "الثقب الأسود", EN: "Black Hole" },
    subtitle: { AR: "Black Hole", EN: "الثقب الأسود" },
    description: {
      AR: "مشهد كوني واقعي يجمع أفق الحدث، حلقة فوتونية، قرص تراكم متوهج، وتأثيرات عدسة جاذبية عميقة.",
      EN: "A realistic cosmic scene combining the event horizon, photon ring, glowing accretion disk, and deep gravitational lensing.",
    },
    path: "/black-hole",
    status: "ready",
    accent: "violet",
  },
  {
    id: "magnetar",
    title: { AR: "محاكاة النجم النيوتروني المغناطيسي", EN: "Magnetar Simulator" },
    subtitle: { AR: "Magnetar Simulator", EN: "النجم المغناطيسي" },
    description: {
      AR: "نجم نيوتروني شديد الكثافة مع مجال مغناطيسي متوهج، نفاثات قطبية، وهالة زرقاء بنفسجية مشحونة بالطاقة.",
      EN: "An ultra-dense neutron star with glowing magnetic fields, polar jets, and a blue-violet halo charged with energy.",
    },
    path: "/magnetar",
    status: "ready",
    accent: "indigo",
  },
  {
    id: "saturn",
    title: { AR: "محاكاة زحل", EN: "Saturn Simulator" },
    subtitle: { AR: "Saturn Simulator", EN: "زحل" },
    description: {
      AR: "كوكب زحل بحلقاته الجليدية، أقمار أساسية، وواجهة تفاعل بسيطة مثل باقي المحاكيات.",
      EN: "Saturn with icy rings, main moons, and a simple interaction interface like the other simulators.",
    },
    path: "/saturn",
    status: "ready",
    accent: "amber",
  },
  {
    id: "neptune",
    title: { AR: "محاكاة نبتون", EN: "Neptune Simulator" },
    subtitle: { AR: "Neptune Simulator", EN: "نبتون" },
    description: {
      AR: "عملاق أزرق بعيد مع عاصفة لامعة، أحزمة جوية خفيفة، هالة زرقاء، وحلقات رفيعة خافتة.",
      EN: "A distant blue giant with a bright storm, subtle atmospheric bands, a blue glow, and thin faint rings.",
    },
    path: "/neptune",
    status: "ready",
    accent: "sky",
  },
];

function getAccentClasses(accent) {
  if (accent === "orange") {
    return {
      card: "hover:border-orange-200/45 text-orange-100",
      badge: "bg-orange-200 text-slate-950",
    };
  }
  if (accent === "amber") {
    return {
      card: "hover:border-amber-200/45 text-amber-100",
      badge: "bg-amber-200 text-slate-950",
    };
  }
  if (accent === "violet") {
    return {
      card: "hover:border-violet-200/45 text-violet-100",
      badge: "bg-violet-200 text-slate-950",
    };
  }
  if (accent === "red") {
    return {
      card: "hover:border-red-200/45 text-red-100",
      badge: "bg-red-200 text-slate-950",
    };
  }
  if (accent === "yellow") {
    return {
      card: "hover:border-yellow-200/45 text-yellow-100",
      badge: "bg-yellow-200 text-slate-950",
    };
  }
  if (accent === "sky") {
    return {
      card: "hover:border-sky-200/45 text-sky-100",
      badge: "bg-sky-200 text-slate-950",
    };
  }
  if (accent === "teal") {
    return {
      card: "hover:border-cyan-200/45 text-cyan-100",
      badge: "bg-cyan-200 text-slate-950",
    };
  }
  if (accent === "indigo") {
    return {
      card: "hover:border-indigo-200/45 text-indigo-100",
      badge: "bg-indigo-200 text-slate-950",
    };
  }
  return {
    card: "hover:border-cyan-200/45 text-cyan-100",
    badge: "bg-cyan-200 text-slate-950",
  };
}

function HomePage() {
  const [language, setLanguage] = useState("EN");
  const text = copy[language];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030511] text-white" dir={text.dir}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(98,219,232,0.16),transparent_26%),radial-gradient(circle_at_84%_22%,rgba(214,154,82,0.14),transparent_24%),linear-gradient(180deg,#030511,#080b17_58%,#030511)]" />
      <div className="pointer-events-none fixed inset-0 opacity-70 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:58px_58px]" />

      <div className="fixed right-5 top-5 z-20 flex rounded-full border border-white/15 bg-black/45 p-1 shadow-xl shadow-black/30 backdrop-blur-xl">
        {["AR", "EN"].map((item) => (
          <button
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              language === item ? "bg-cyan-200 text-slate-950" : "text-white/65 hover:text-white"
            }`}
            key={item}
            onClick={() => setLanguage(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 pb-16 pt-24 md:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200">{text.badge}</p>
          <h1 className="mt-5 text-4xl font-bold leading-tight md:text-7xl">{text.heading}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/68 md:text-lg">{text.intro}</p>
          <p className="mt-6 inline-flex rounded-full border border-cyan-200/25 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-100">
            {text.credit}
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {simulators.map((simulator) => {
            const isReady = simulator.status === "ready";
            const accentClass = getAccentClasses(simulator.accent);
            const content = (
              <article
                className={`h-full rounded-xl border border-white/12 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:bg-white/[0.07] ${accentClass.card}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                      {simulator.subtitle[language]}
                    </p>
                    <h2 className="mt-3 text-xl font-bold leading-8 text-white">{simulator.title[language]}</h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      isReady ? accentClass.badge : "bg-white/10 text-white/55"
                    }`}
                  >
                    {isReady ? text.ready : text.soon}
                  </span>
                </div>
                <p className="mt-4 min-h-20 text-sm leading-7 text-white/62">{simulator.description[language]}</p>
                <div className="mt-6 text-sm font-bold">{isReady ? text.open : text.unavailable}</div>
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
