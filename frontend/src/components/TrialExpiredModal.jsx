import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TrialExpiredModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);

  if (!isOpen) return null;

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const runExit = (after) => {
    if (prefersReducedMotion()) {
      after();
      return;
    }
    setExiting(true);
    setTimeout(after, 380);
  };

  const handleUpgrade = () =>
    runExit(() => {
      if (onClose) onClose();
      navigate("/app/pricing");
    });

  const handleLogout = () =>
    runExit(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    });

  const rows = [
    { label: "Plan", value: "AutoBillr Pro Trial" },
    { label: "Duration", value: "14 days" },
    { label: "Status", value: "Expired", emphasis: true },
  ];

  // Zigzag polygon for the torn bottom edge, generated once per render.
  const teeth = 24;
  const toothWidth = 10;
  const zigzag = Array.from({ length: teeth }, (_, i) => {
    const x = i * toothWidth;
    const y = i % 2 === 0 ? 10 : 0;
    return `${x},${y}`;
  }).join(" ");
  const zigzagPoints = `0,10 ${zigzag} ${teeth * toothWidth},10`;

  return (
    <div
      className={`tem-overlay fixed inset-0 z-50 flex items-center justify-center bg-[#0E1F19]/70 backdrop-blur-sm p-4 transition-opacity duration-300 ${
        exiting ? "opacity-0" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trial-expired-heading"
    >
      <style>{`
        @keyframes temOverlayIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes temPrintIn {
          0%   { clip-path: inset(0 0 100% 0); transform: translateY(-4px); }
          70%  { clip-path: inset(0 0 0% 0); transform: translateY(2px); }
          100% { clip-path: inset(0 0 0% 0); transform: translateY(0); }
        }
        @keyframes temTearAway {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg); clip-path: inset(0 0 0% 0); }
          100% { opacity: 0; transform: translateY(-34px) rotate(-3deg); clip-path: inset(0 0 100% 0); }
        }
        @keyframes temGlow { 0%, 100% { opacity: 0.32; } 50% { opacity: 0.52; } }
        @keyframes temStampIn {
          0%   { opacity: 0; transform: rotate(-9deg) scale(2.4); }
          55%  { opacity: 1; transform: rotate(-11deg) scale(0.94); }
          75%  { transform: rotate(-7deg) scale(1.04); }
          100% { transform: rotate(-9deg) scale(1); }
        }
        @keyframes temStampSway {
          0%, 100% { transform: rotate(-9deg); }
          50%      { transform: rotate(-6.5deg); }
        }
        @keyframes temImpactRing {
          0%   { transform: scale(0.5); opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes temRowIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes temTear { from { width: 0; } to { width: 100%; } }
        @keyframes temFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes temShimmer { from { transform: translateX(-140%) skewX(-12deg); } to { transform: translateX(220%) skewX(-12deg); } }

        .tem-overlay { animation: temOverlayIn 0.25s ease-out both; }
        .tem-card { animation: temPrintIn 0.6s cubic-bezier(.2,.8,.25,1) 0.05s both; }
        .tem-card-exit { animation: temTearAway 0.36s cubic-bezier(.4,0,.7,.4) both; }
        .tem-glow { animation: temGlow 4s ease-in-out infinite; }
        .tem-stamp {
          animation:
            temStampIn 0.6s cubic-bezier(.25,1.4,.4,1) 0.5s both,
            temStampSway 3.2s ease-in-out 1.15s infinite alternate;
        }
        .tem-impact-ring { animation: temImpactRing 0.45s ease-out 0.78s both; }
        .tem-row { opacity: 0; animation: temRowIn 0.35s ease-out both; }
        .tem-row:nth-of-type(1) { animation-delay: 0.75s; }
        .tem-row:nth-of-type(2) { animation-delay: 0.85s; }
        .tem-row:nth-of-type(3) { animation-delay: 0.95s; }
        .tem-tear { animation: temTear 0.4s ease-out 1.05s both; }
        .tem-actions { opacity: 0; animation: temFadeUp 0.4s ease-out 1.2s both; }
        .tem-shimmer { animation: temShimmer 1.4s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .tem-overlay, .tem-card, .tem-card-exit, .tem-glow, .tem-stamp,
          .tem-impact-ring, .tem-row, .tem-tear, .tem-actions, .tem-shimmer {
            animation: none !important; opacity: 1 !important; transform: none !important;
            width: 100% !important; clip-path: none !important;
          }
        }
      `}</style>

      <div className="relative">
        {/* Ambient glow behind the card */}
        <div
          className="tem-glow pointer-events-none absolute -inset-8 -z-10 rounded-[40px] bg-[#12876B] blur-3xl"
          aria-hidden="true"
        />

        <div
          className={`relative w-full max-w-sm overflow-hidden rounded-t-[26px] bg-[#FBFAF5] shadow-[0_24px_60px_-15px_rgba(14,31,25,0.5)] ring-1 ring-[#12241D]/10 ${
            exiting ? "tem-card-exit" : "tem-card"
          }`}
        >
          {/* Faint paper grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(#12241D 0.6px, transparent 0.6px)",
              backgroundSize: "10px 10px",
            }}
            aria-hidden="true"
          />

          {/* Ink impact ring behind the stamp */}
          <div
            className="tem-impact-ring pointer-events-none absolute right-6 top-6 h-9 w-16 rounded-md border-2 border-[#9C3B2E]"
            aria-hidden="true"
          />

          {/* Stamp mark */}
          <div className="tem-stamp pointer-events-none absolute right-6 top-6 select-none rounded-md border-[3px] border-[#9C3B2E]/80 px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#9C3B2E]/80">
            EXPIRED
          </div>

          {/* Receipt header */}
          <div className="relative px-7 pb-5 pt-7">
            <div className="flex items-center gap-2 text-[#12876B]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 3h13l3 3v15H4V3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="text-[15px] font-semibold tracking-tight text-[#12241D]">AutoBillr</span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-[#6E7A73]">Trial receipt · No. TR-0014</p>

            <dl className="mt-5 space-y-2 font-mono text-[13px]">
              {rows.map((row) => (
                <div key={row.label} className="tem-row flex items-baseline justify-between">
                  <dt className="text-[#6E7A73]">{row.label}</dt>
                  <dd className={row.emphasis ? "font-semibold text-[#9C3B2E]" : "text-[#12241D]"}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Perforated tear line */}
          <div className="relative border-t border-dashed border-[#12241D]/15">
            <div className="tem-tear absolute inset-y-0 left-0 border-t border-dashed border-[#12241D]/40" />
            <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-[#0E1F19]/70" />
            <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-[#0E1F19]/70" />
          </div>

          {/* Action area */}
          <div className="relative px-7 pb-7 pt-6 text-center">
            <h3 id="trial-expired-heading" className="text-[19px] font-bold text-[#12241D]">
              Your trial has run its course
            </h3>
            <p className="mx-auto mt-2 max-w-[280px] text-[13.5px] leading-relaxed text-[#6E7A73]">
              Upgrade to keep creating invoices, managing clients, and viewing your revenue analytics.
            </p>

            <div className="tem-actions mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={exiting}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#12876B] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#12876B]/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0C6552] hover:shadow-lg hover:shadow-[#12876B]/30 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#12876B]"
              >
                <span className="pointer-events-none absolute inset-0 hidden group-hover:block">
                  <span className="tem-shimmer absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                </span>
                <span className="relative">Upgrade plan</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={exiting}
                className="w-full rounded-xl px-4 py-2 text-[13px] font-medium text-[#6E7A73] transition-colors duration-200 hover:text-[#12241D] disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#12876B]"
              >
                Sign out instead
              </button>
            </div>
          </div>

          {/* Torn bottom edge */}
          <svg
            viewBox={`0 0 ${teeth * toothWidth} 10`}
            preserveAspectRatio="none"
            className="block h-2.5 w-full"
            aria-hidden="true"
          >
            <polygon points={zigzagPoints} fill="rgba(14,31,25,0.7)" />
          </svg>
        </div>
      </div>
    </div>
  );
}