import { useRef, useState } from "react";

const labels = {
  AR: {
    play: "تشغيل الصوت",
    stop: "إيقاف الصوت",
    title: "صوت المحاكاة",
  },
  EN: {
    play: "Play Sound",
    stop: "Stop Sound",
    title: "Simulation sound",
  },
};

function SimulationSound({ language = "EN", tone = "white", videoId, volume = 30 }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef(null);
  const text = labels[language] ?? labels.EN;
  const origin = typeof window === "undefined" ? "" : encodeURIComponent(window.location.origin);
  const safeVolume = Math.max(0, Math.min(100, volume));
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}`;

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

  if (!videoId) return null;

  const setPlayerVolume = () => {
    const player = iframeRef.current?.contentWindow;

    if (!player) return;

    player.postMessage(
      JSON.stringify({ event: "command", func: "setVolume", args: [safeVolume] }),
      "https://www.youtube.com",
    );
  };

  return (
    <>
      <button
        aria-pressed={isPlaying}
        className={`pointer-events-auto fixed bottom-20 right-5 z-30 rounded-full border bg-black/52 px-4 py-2 text-sm font-semibold text-white/82 shadow-xl shadow-black/25 backdrop-blur-xl transition ${toneClass}`}
        onClick={() => setIsPlaying((value) => !value)}
        type="button"
      >
        {isPlaying ? text.stop : text.play}
      </button>

      {isPlaying && (
        <iframe
          allow="autoplay; encrypted-media"
          aria-hidden="true"
          className="pointer-events-none fixed -left-10 -top-10 h-1 w-1 opacity-0"
          onLoad={() => {
            window.setTimeout(setPlayerVolume, 500);
            window.setTimeout(setPlayerVolume, 1200);
          }}
          ref={iframeRef}
          src={src}
          tabIndex={-1}
          title={text.title}
        />
      )}
    </>
  );
}

export default SimulationSound;
