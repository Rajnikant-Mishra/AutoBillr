// components/ui/Card.jsx

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
  ...props
}) {
  return (
    <div
      {...props}
      className={`
        bg-white
        rounded-xl
        overflow-hidden
        transition-all duration-300
        shadow-sm
        ${bordered ? "border border-slate-200/70" : ""}
        ${hover ? "hover:shadow-xl hover:-translate-y-1" : ""}
        ${
          bgGradient
            ? "bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-xl shadow-teal-600/20"
            : ""
        }
        ${props.onClick ? "cursor-pointer" : ""}
        ${padding}
        ${className}
      `}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && (
              <h3
                className={`text-2xl font-bold tracking-tight ${
                  bgGradient ? "text-white" : "text-slate-900"
                }`}
              >
                {title}
              </h3>
            )}

            {subtitle && (
              <p
                className={`text-sm mt-1.5 ${
                  bgGradient ? "text-white/80" : "text-slate-500"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>

          {action && <div>{action}</div>}
        </div>
      )}

      {children}
    </div>
  );
}