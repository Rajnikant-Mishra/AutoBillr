import { useState } from "react";

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-2xl",
};

export default function Avatar({
  src,
  firstName,
  lastName,
  name,
  size = "md",
  className = "",
}) {
  const [imgError, setImgError] = useState(false);

  // Build initials
  let initials = "U";

  if (firstName || lastName) {
    initials =
      `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  } else if (name) {
    const parts = name.trim().split(/\s+/);
    initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : (parts[0]?.[0] || "U").toUpperCase();
  }

  const showImage = Boolean(src) && !imgError;

  return (
    <div
      className={`
        relative rounded-full overflow-hidden flex-shrink-0
        ${sizeMap[size]}
        ${className}
      `}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || `${firstName || ""} ${lastName || ""}`.trim() || "User"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-primary text-white grid place-items-center font-bold select-none">
          {initials}
        </div>
      )}
    </div>
  );
}