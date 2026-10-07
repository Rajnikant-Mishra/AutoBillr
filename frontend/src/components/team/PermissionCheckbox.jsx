// import React from "react";

// export default function PermissionCheckbox({
//   checked = false,
//   disabled = false,
//   label,
//   onChange,
//   className = "",
// }) {
//   return (
//     <label
//       className={`
//         flex items-center gap-3
//         p-2.5 rounded-lg
//         border cursor-pointer
//         transition
//         ${
//           checked
//             ? "border-primary/30 bg-primary-soft"
//             : "border-border-light hover:border-border"
//         }
//         ${
//           disabled
//             ? "opacity-60 cursor-not-allowed"
//             : ""
//         }
//         ${className}
//       `}
//     >
//       <input
//         type="checkbox"
//         checked={checked}
//         disabled={disabled}
//         onChange={onChange}
//         className="
//           h-4 w-4
//           shrink-0
//           rounded
//           border-border
//           text-primary
//           focus:ring-primary
//         "
//       />

//       <span className="text-xs text-text-secondary">
//         {label}
//       </span>
//     </label>
//   );
// }

import React from "react";

export default function PermissionCheckbox({
  checked = false,
  disabled = false,
  label,
  onChange,
  className = "",
}) {
  return (
    <label
      className={`
        flex items-center gap-3
        p-2.5 rounded-lg
        border
        transition
        select-none
        ${
          checked
            ? "border-primary/30 bg-primary-soft"
            : "border-border-light hover:border-border"
        }
        ${
          disabled
            ? "opacity-60 cursor-not-allowed pointer-events-none"
            : "cursor-pointer"
        }
        ${className}
      `}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          if (disabled) return;
          onChange?.(e);
        }}
        className="
          h-4 w-4
          shrink-0
          rounded
          border-border
          text-primary
          focus:ring-primary
          focus:ring-2
          focus:ring-offset-0
        "
      />

      <span className="text-xs text-text-secondary leading-tight">
        {label}
      </span>
    </label>
  );
}