export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  position = "center",
}) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">

      {/* Overlay */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Center Modal */}
      {position === "center" && (
        <div className="flex items-center justify-center h-full p-4">
          <div
            className={`bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} relative`}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold">{title}</h2>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      )}

      {/* Right Drawer */}
      {position === "right" && (
        <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col">

          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-bold">
              {title}
            </h2>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-slate-100"
            >
              <span className="material-symbols-outlined">
                close
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      )}

      {/* Right Side Modal */}
{position === "right-modal" && (
  <div className="flex items-center justify-end h-full p-6">
    <div
      className={`
        bg-white
        rounded-3xl
        shadow-2xl
        w-full
        ${sizes[size]}
        relative
        mr-1
      `}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <h2 className="text-lg font-bold">{title}</h2>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl hover:bg-slate-100"
        >
          <span className="material-symbols-outlined">
            close
          </span>
        </button>
      </div>

      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
)}
    </div>
  );
}