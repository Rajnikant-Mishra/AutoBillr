import { useEffect } from "react";

const SIZES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  position = "center",
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        originalOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sizeClass =
    SIZES[size] || SIZES.md;

  const isRightDrawer =
    position === "right";

  const isRightModal =
    position === "right-modal";

  return (
    <div
      className="fixed inset-0 z-50"
      role="presentation"
    >
      {/* Overlay */}

      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Center */}

      {position === "center" && (
        <div className="relative z-10 flex items-center justify-center min-h-full p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
         className="app-modal" >
            <ModalHeader
              title={title}
              onClose={onClose}
            />

            <div className="overflow-y-auto p-6">
              {children}
            </div>
          </div>
        </div>
      )}

      {/* Right Drawer */}

      {isRightDrawer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="relative z-10 ml-auto h-full w-full max-w-lg bg-white shadow-2xl flex flex-col"
        >
          <ModalHeader
            title={title}
            onClose={onClose}
          />

          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      )}

      {/* Right Modal */}

      {isRightModal && (
        <div className="relative z-10 flex items-center justify-end min-h-full p-4 md:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={`bg-white rounded-3xl shadow-2xl w-full ${sizeClass} max-h-[calc(100vh-3rem)] overflow-hidden flex flex-col`}
          >
            <ModalHeader
              title={title}
              onClose={onClose}
            />

            <div className="overflow-y-auto p-6">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalHeader({
  title,
  onClose,
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 shrink-0">
      <h2
        id="modal-title"
        className="text-lg font-bold text-slate-900"
      >
        {title}
      </h2>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors"
      >
        <span
          className="material-symbols-outlined text-[20px]"
          aria-hidden="true"
        >
          close
        </span>
      </button>
    </div>
  );
}