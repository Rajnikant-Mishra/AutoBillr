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























export default function Badge({
  label,
  variant = "active",
  className = "",
}) {
  const variants = {
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
    important: {
      bg: "#FEE2E2",
      text: "#B91C1C",
      dot: "#DC2626",
    },
    priority: {
      bg: "#FFEDD5",
      text: "#C2410C",
      dot: "#EA580C",
    },
    default: {
      bg: "var(--color-surface-hover)",
      text: "var(--color-text-secondary)",
      dot: "var(--color-text-muted)",
    },
  };

  const styles = variants[variant.toLowerCase()] ?? variants.default;

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
      <span>{label}</span>
    </span>
  );
}
