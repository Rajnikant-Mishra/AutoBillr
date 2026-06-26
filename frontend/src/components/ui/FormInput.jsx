export default function FormInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  rightElement,
}) {
  return (
    <div>
      {label && (
        <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10">
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full py-3 border border-slate-200 bg-white rounded-xl
            focus:ring-2 focus:ring-teal-500/20
            focus:border-teal-500 outline-none text-sm
            ${icon ? "pl-11" : "pl-4"}
            ${rightElement ? "pr-12" : "pr-4"}
          `}
        />

        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}