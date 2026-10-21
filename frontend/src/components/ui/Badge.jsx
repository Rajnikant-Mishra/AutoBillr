// export default function Badge({
//   label,
//   variant = "active",
//   className = "",
// }) {
//   const variants = {
//     active: {
//       bg: "var(--color-primary-light)",
//       text: "var(--color-primary)",
//       dot: "var(--color-primary)",
//     },

//     paid: {
//       bg: "var(--color-success-light)",
//       text: "var(--color-success)",
//       dot: "var(--color-success)",
//     },

//     pending: {
//       bg: "var(--color-warning-light)",
//       text: "var(--color-warning)",
//       dot: "var(--color-warning)",
//     },

//     risk: {
//       bg: "var(--color-danger-light)",
//       text: "var(--color-danger)",
//       dot: "var(--color-danger)",
//     },

//     scheduled: {
//       bg: "var(--color-info-light)",
//       text: "var(--color-info)",
//       dot: "var(--color-info)",
//     },

//     default: {
//       bg: "var(--color-surface-hover)",
//       text: "var(--color-text-secondary)",
//       dot: "var(--color-text-muted)",
//     },
//   };

//   const styles = variants[variant] ?? variants.default;

//   return (
//     <span
//       className={[
//         "inline-flex",
//         "items-center",
//         "gap-1.5",
//         "px-3",
//         "py-1",
//         "rounded-full",
//         "text-[11px]",
//         "font-bold",
//         "uppercase",
//         "tracking-wider",
//         className,
//       ].join(" ")}
//       style={{
//         backgroundColor: styles.bg,
//         color: styles.text,
//       }}
//     >
//       <span
//         aria-hidden="true"
//         className="w-1.5 h-1.5 rounded-full shrink-0"
//         style={{
//           backgroundColor: styles.dot,
//         }}
//       />

//       <span>{label}</span>
//     </span>
//   );
// }
























const BADGE_VARIANTS = {
  active: {
    bg: "var(--color-primary-light)",
    text: "var(--color-primary)",
    dot: "var(--color-primary)",
  },
  paid: {
    bg: "var(--color-success-light)",
    text: "var(--color-success)",
    dot: "var(--color-success)",
  },
  pending: {
    bg: "var(--color-warning-light)",
    text: "var(--color-warning)",
    dot: "var(--color-warning)",
  },
  risk: {
    bg: "var(--color-danger-light)",
    text: "var(--color-danger)",
    dot: "var(--color-danger)",
  },
  scheduled: {
    bg: "var(--color-info-light)",
    text: "var(--color-info)",
    dot: "var(--color-info)",
  },
  tag: {
    bg: "#F3E8FF",
    text: "#7E22CE",
    dot: "#9333EA",
  },
  vip: {
    bg: "#F3E8FF",
    text: "#7E22CE",
    dot: "#9333EA",
  },
  regular: {
    bg: "#F1F5F9",
    text: "#475569",
    dot: "#64748B",
  },
  premium: {
    bg: "#FCE7F3",
    text: "#BE185D",
    dot: "#DB2777",
  },
  enterprise: {
    bg: "#E0E7FF",
    text: "#3730A3",
    dot: "#4F46E5",
  },
  "new client": {
    bg: "#DBEAFE",
    text: "#1D4ED8",
    dot: "#2563EB",
  },
  "loyal client": {
    bg: "#DCFCE7",
    text: "#166534",
    dot: "#16A34A",
  },
  important: {
    bg: "#FEE2E2",
    text: "#B91C1C",
    dot: "#DC2626",
  },
  "high priority": {
    bg: "#FFEDD5",
    text: "#C2410C",
    dot: "#EA580C",
  },
  "medium priority": {
    bg: "#FEF3C7",
    text: "#92400E",
    dot: "#D97706",
  },
  "low priority": {
    bg: "#F3F4F6",
    text: "#374151",
    dot: "#6B7280",
  },
  active: {
    bg: "#D1FAE5",
    text: "#065F46",
    dot: "#059669",
  },
  inactive: {
    bg: "#F4F4F5",
    text: "#52525B",
    dot: "#71717A",
  },
  "at risk": {
    bg: "#FFE4E6",
    text: "#BE123C",
    dot: "#E11D48",
  },
  "potential client": {
    bg: "#CCFBF1",
    text: "#115E59",
    dot: "#0D9488",
  },
  "payment pending": {
    bg: "#FEF9C3",
    text: "#854D0E",
    dot: "#CA8A04",
  },
  "payment overdue": {
    bg: "#FEE2E2",
    text: "#991B1B",
    dot: "#DC2626",
  },
  "paid client": {
    bg: "#DCFCE7",
    text: "#166534",
    dot: "#16A34A",
  },
  "follow-up": {
    bg: "#CFFAFE",
    text: "#155E75",
    dot: "#0891B2",
  },
  "needs attention": {
    bg: "#FCE7F3",
    text: "#9D174D",
    dot: "#DB2777",
  },
  referral: {
    bg: "#ECFCCB",
    text: "#3F6212",
    dot: "#65A30D",
  },
  "long-term client": {
    bg: "#E0F2FE",
    text: "#075985",
    dot: "#0284C7",
  },
  default: {
    bg: "var(--color-surface-hover)",
    text: "var(--color-text-secondary)",
    dot: "var(--color-text-muted)",
  },
};

export default function Badge({
  label,
  variant,
  className = "",
}) {
  const normalizedLabel = String(label ?? "").trim();
  const lookupKey = String(variant || normalizedLabel)
    .trim()
    .toLowerCase();

  const styles =
    BADGE_VARIANTS[lookupKey] ?? BADGE_VARIANTS.default;

  if (!normalizedLabel) return null;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-full px-2.5 py-1",
        "text-[11px] font-bold",
        "whitespace-nowrap",
        className,
      ].join(" ")}
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: styles.dot }}
      />
      <span>{normalizedLabel}</span>
    </span>
  );
}

