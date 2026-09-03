import React from "react";

export default function Card({
  children,
  title,
  subtitle,
  action,
  className = "",
  padding = "p-6",
  hover = false,
  bordered = true,
  bgGradient = false,
  onClick,
  ...props
}) {
  return (
    <div
      {...props}
      onClick={onClick}
      className={[
        "bg-surface",
        "rounded-xl",
        "overflow-hidden",
        "transition-all",
        "duration-300",
        "shadow-sm",

        bordered
          ? "border border-border"
          : "",

        hover
          ? "hover:shadow-xl hover:-translate-y-1"
          : "",

        bgGradient
          ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-xl shadow-primary/20"
          : "",

        onClick
          ? "cursor-pointer"
          : "",

        padding,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            {title && (
              <h3
                className={[
                  "text-xl",
                  "font-bold",
                  "tracking-tight",
                  bgGradient
                    ? "text-white"
                    : "text-text",
                ].join(" ")}
              >
                {title}
              </h3>
            )}

            {subtitle && (
              <p
                className={[
                  "text-sm",
                  "mt-1.5",
                  bgGradient
                    ? "text-white/80"
                    : "text-text-muted",
                ].join(" ")}
              >
                {subtitle}
              </p>
            )}
          </div>

          {action && (
            <div className="shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}