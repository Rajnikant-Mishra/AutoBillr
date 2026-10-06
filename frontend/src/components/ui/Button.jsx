import React from "react";

const VARIANTS = {
  primary:
    "bg-primary hover:bg-primary-hover text-white shadow-sm",

  secondary:
    "bg-surface border border-border text-text-secondary hover:bg-surface-hover",

  ghost:
    "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20",

  danger:
    "bg-danger hover:bg-danger-hover text-white shadow-sm",
};

const SIZES = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  children,
  icon,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const variantClass =
    VARIANTS[variant] ?? VARIANTS.primary;

  const sizeClass =
    SIZES[size] ?? SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
      className={[
        "inline-flex",
        "items-center",
        "justify-center",
        "gap-2",
        "rounded-lg",
        "font-semibold",
        "transition-all",
        "duration-200",
        "active:scale-[0.98]",
        "disabled:opacity-50",
        "disabled:pointer-events-none",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-primary/30",
        variantClass,
        sizeClass,
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <span
          className="material-symbols-outlined animate-spin text-[20px]"
          aria-hidden="true"
        >
          progress_activity
        </span>
      ) : (
        icon && (
          <span
            className="material-symbols-outlined text-[22px]"
            aria-hidden="true"
          >
            {icon}
          </span>
        )
      )}

      {children}
    </button>
  );
}