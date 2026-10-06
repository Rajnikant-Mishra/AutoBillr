// src/components/common/FeatureGate.jsx
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";

/* Pure inline SVG Icons (no external package needed) */
function LockIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SparklesIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

export default function FeatureGate({
  feature,
  requiredPlan = "Pro",
  children,
}) {
  const permissions = usePermissions();
  const navigate = useNavigate();

  const isAllowed = permissions[feature];

  // Agar user ko permission hai, toh actual feature dikhao
  if (isAllowed) {
    return children;
  }

  // Agar permission nahi hai, toh Lock overlay dikhao
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center min-h-[260px] flex items-center justify-center">
      {/* Blurred background view */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-20 blur-sm p-6 overflow-hidden">
        {children}
      </div>

      {/* Lock CTA Card */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-md p-6 rounded-xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
          <LockIcon className="h-5 w-5" />
        </div>

        <h3 className="text-base font-semibold text-slate-100">
          Unlock {requiredPlan} Feature
        </h3>

        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          This feature is only available on the{" "}
          <span className="font-semibold text-emerald-400">{requiredPlan}</span> plan or higher. Upgrade to unlock full access.
        </p>

        <button
          onClick={() => navigate("/app/pricing")}
          className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition cursor-pointer"
        >
          <SparklesIcon className="h-4 w-4" /> Upgrade to {requiredPlan}
        </button>
      </div>
    </div>
  );
}