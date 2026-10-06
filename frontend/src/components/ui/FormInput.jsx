import { useId } from "react";

export default function FormInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  rightElement,
  error,
  helperText,
  required = false,
  disabled = false,
  id,
  className = "",
  ...props
}) {
  const generatedId = useId();

  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11.5px] font-semibold text-slate-600 mb-1.5"
        >
          {label}

          {required && (
            <span
              className="text-danger ml-1"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span
            aria-hidden="true"
            className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none"
          >
            {icon}
          </span>
        )}

        <input
          {...props}
          id={inputId}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error || helperText
              ? `${inputId}-description`
              : undefined
          }
         className={[
  "w-full",
  "h-11",
  "border",
  "bg-surface",
  "rounded-lg",
  "outline-none",
  "text-sm",
  "transition-colors",

  "placeholder:text-text-light",

  "focus:ring-2",
  "focus:ring-primary/20",
  "focus:border-primary",

  "disabled:bg-surface-secondary",
  "disabled:text-text-light",
  "disabled:cursor-not-allowed",

  icon ? "pl-11" : "pl-4",
  rightElement ? "pr-12" : "pr-4",

  error
    ? "border-danger focus:border-danger focus:ring-danger/20"
    : "border-border",

  className,
]
  .filter(Boolean)
  .join(" ")}
        />

        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">
            {rightElement}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p
          id={`${inputId}-description`}
          className={`mt-1.5 text-xs ${
            error
              ? "text-danger"
              : "text-slate-500"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}