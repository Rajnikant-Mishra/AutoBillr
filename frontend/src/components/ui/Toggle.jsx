export default function Toggle({ enabled, onToggle, size = "md" }) {
  const isSm = size === "sm";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`
        relative shrink-0 rounded-full transition-colors
        ${isSm ? "w-10 h-5" : "w-11 h-6"}
        ${enabled ? "bg-primary" : "bg-border-dark"}
      `}
    >
      <span
        className={`
          absolute top-0.5 bg-surface rounded-full shadow transition-all
          ${isSm ? "w-4 h-4" : "w-5 h-5"}
          ${enabled ? "right-0.5" : "left-0.5"}
        `}
      />
    </button>
  );
}