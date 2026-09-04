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

    default: {
      bg: "var(--color-surface-hover)",
      text: "var(--color-text-secondary)",
      dot: "var(--color-text-muted)",
    },
  };

  const styles = variants[variant] ?? variants.default;

  return (
    <span
      className={[
        "inline-flex",
        "items-center",
        "gap-1.5",
        "px-3",
        "py-1",
        "rounded-full",
        "text-[11px]",
        "font-bold",
        "uppercase",
        "tracking-wider",
        className,
      ].join(" ")}
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      <span
        aria-hidden="true"
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          backgroundColor: styles.dot,
        }}
      />

      <span>{label}</span>
    </span>
  );
}