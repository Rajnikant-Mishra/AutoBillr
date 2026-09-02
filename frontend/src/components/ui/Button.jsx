// components/ui/Button.jsx
import React from 'react';

export default function Button({
  children,
  icon,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    rounded-xl font-semibold transition-all duration-200
    active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none
  `;

  const variants = {
    primary: `
      bg-teal-600 hover:bg-teal-700 text-white shadow-sm
    `,
    secondary: `
      bg-white border border-slate-200 text-slate-700 hover:bg-slate-50
    `,
    ghost: `
      bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20
    `,
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {icon && (
        <span className="material-symbols-outlined text-[22px] -mt-0.5">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}