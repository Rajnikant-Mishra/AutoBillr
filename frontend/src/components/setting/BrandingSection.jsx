
import { useEffect, useRef } from "react";
import Card from "../ui/Card";
import Toggle from "../ui/Toggle";
import SectionActions from "./SectionActions";

const BRAND_COLORS = [
  "#0d9488",
  "#4f46e5",
  "#dc2626",
  "#f59e0b",
  "#0891b2",
  "#7c3aed",
];

const DEFAULT_BRAND_COLOR = "#0d9488";

const labelClass =
  "block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5";

/*
|--------------------------------------------------------------------------
| Default AutoBillr logo
|--------------------------------------------------------------------------
*/
function DefaultAutoBillrLogo({ brandColor }) {
  return (
    <div
      className="w-12 h-12 rounded-lg grid place-items-center overflow-hidden shrink-0"
      style={{
        backgroundColor: brandColor || DEFAULT_BRAND_COLOR,
      }}
    >
      <span className="material-symbols-outlined mi-fill text-[24px] text-white">
        bolt
      </span>
    </div>
  );
}

export default function BrandingSection({
  brandColor,
  setBrandColor,
  brandToggles,
  setBrandToggles,
  logoUrl,
  setLogoUrl,
  onDiscard,
  onSave,
}) {
  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | RESTORE BRANDING AFTER PAGE REFRESH
  |--------------------------------------------------------------------------
  |
  | The previous code saved the logo/color but never loaded them again.
  | This effect restores them from localStorage when the component mounts.
  |
  */
  useEffect(() => {
    const savedLogo = localStorage.getItem("autobillr-logo");
    const savedBrandColor = localStorage.getItem(
      "autobillr-brand-color"
    );

    /*
     * Restore logo only when parent does not already have one.
     */
    if (!logoUrl && savedLogo) {
      setLogoUrl(savedLogo);
    }

    /*
     * Restore brand color only when parent does not already have one.
     */
    if (!brandColor && savedBrandColor) {
      setBrandColor(savedBrandColor);

      document.documentElement.style.setProperty(
        "--color-primary",
        savedBrandColor
      );

      document.documentElement.style.setProperty(
        "--primary",
        savedBrandColor
      );

      document.documentElement.style.setProperty(
        "--primary-color",
        savedBrandColor
      );
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Keep CSS variables synchronized with brand color
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (!brandColor) return;

    document.documentElement.style.setProperty(
      "--color-primary",
      brandColor
    );

    document.documentElement.style.setProperty(
      "--primary",
      brandColor
    );

    document.documentElement.style.setProperty(
      "--primary-color",
      brandColor
    );
  }, [brandColor]);

  /*
  |--------------------------------------------------------------------------
  | Upload logo
  |--------------------------------------------------------------------------
  */
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    /*
     * Validate file type.
     */
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      e.target.value = "";
      return;
    }

    /*
     * Maximum 2 MB.
     */
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo image must be smaller than 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result;

      /*
       * Update React state immediately.
       */
      setLogoUrl(base64);

      /*
       * Persist locally so it survives refresh.
       */
      localStorage.setItem("autobillr-logo", base64);

      /*
       * Notify other components such as Sidebar.
       */
      window.dispatchEvent(
        new Event("autobillr-branding-updated")
      );
    };

    reader.onerror = () => {
      alert("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);

    /*
     * Allows selecting the same file again.
     */
    e.target.value = "";
  };

  /*
  |--------------------------------------------------------------------------
  | Remove custom logo
  |--------------------------------------------------------------------------
  */
  const handleRemoveLogo = () => {
    /*
     * Remove persisted logo.
     */
    localStorage.removeItem("autobillr-logo");

    /*
     * Reset React state.
     */
    setLogoUrl(null);

    /*
     * Notify other components.
     */
    window.dispatchEvent(
      new Event("autobillr-branding-updated")
    );

    /*
     * Reset file picker.
     */
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Change brand color
  |--------------------------------------------------------------------------
  */
  const handleColorChange = (color) => {
    if (!color) return;

    /*
     * Update React state.
     */
    setBrandColor(color);

    /*
     * Persist color.
     */
    localStorage.setItem(
      "autobillr-brand-color",
      color
    );

    /*
     * Update all supported CSS variables.
     */
    document.documentElement.style.setProperty(
      "--color-primary",
      color
    );

    document.documentElement.style.setProperty(
      "--primary",
      color
    );

    document.documentElement.style.setProperty(
      "--primary-color",
      color
    );

    /*
     * Notify application.
     */
    window.dispatchEvent(
      new Event("autobillr-branding-updated")
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Save branding
  |--------------------------------------------------------------------------
  |
  | Keep localStorage synchronized before the parent's onSave().
  |
  */
  const handleSave = () => {
    if (logoUrl) {
      localStorage.setItem(
        "autobillr-logo",
        logoUrl
      );
    } else {
      localStorage.removeItem("autobillr-logo");
    }

    if (brandColor) {
      localStorage.setItem(
        "autobillr-brand-color",
        brandColor
      );
    }

    window.dispatchEvent(
      new Event("autobillr-branding-updated")
    );

    /*
     * Call parent's save function.
     */
    if (typeof onSave === "function") {
      onSave();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Discard branding
  |--------------------------------------------------------------------------
  */
  const handleDiscard = () => {
    /*
     * Parent controls the actual discard behavior.
     */
    if (typeof onDiscard === "function") {
      onDiscard();
    }
  };

  return (
    <>
      <Card padding="p-6">
        {/* Header */}
        <div className="mb-5 pb-4 border-b border-border-light">
          <div className="text-base font-bold text-text">
            Brand identity
          </div>

          <div className="text-xs text-text-muted mt-1">
            How your invoices look in client inboxes
          </div>
        </div>

        <div className="space-y-4">
          {/* =========================================================
              LOGO + BRAND COLOR
          ========================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* =====================================================
                LOGO
            ====================================================== */}
            <div>
              <label className={labelClass}>
                Logo
              </label>

              <div className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl">
                {/* Logo preview */}
                <div className="relative shrink-0">
                  {logoUrl ? (
                    <div className="relative w-12 h-12">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-border-light grid place-items-center">
                        <img
                          src={logoUrl}
                          alt="Custom AutoBillr logo"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            /*
                             * If saved URL is invalid, fall back
                             * to default AutoBillr logo.
                             */
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        title="Remove logo"
                        aria-label="Remove logo"
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition"
                      >
                        <span className="material-symbols-outlined text-[14px] leading-none">
                          close
                        </span>
                      </button>
                    </div>
                  ) : (
                    <DefaultAutoBillrLogo
                      brandColor={brandColor}
                    />
                  )}
                </div>

                {/* Logo information */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text">
                    {logoUrl
                      ? "Custom logo"
                      : "AutoBillr logo"}
                  </div>

                  <div className="text-[11px] text-text-muted">
                    PNG · 1024×1024 recommended
                  </div>

                  {logoUrl && (
                    <div className="text-[10px] text-green-600 mt-0.5 font-medium">
                      Custom logo uploaded
                    </div>
                  )}
                </div>

                {/* Upload / Change button */}
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-soft rounded-lg"
                  >
                    {logoUrl ? "Change" : "Upload"}
                  </button>
                </div>

                {/* Hidden input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>

            {/* =====================================================
                BRAND COLOR
            ====================================================== */}
            <div>
              <label className={labelClass}>
                Background / Brand color
              </label>

              <div className="flex items-center gap-3 flex-wrap">
                {BRAND_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      handleColorChange(color)
                    }
                    className={`w-10 h-10 rounded-xl border-2 transition ${
                      brandColor === color
                        ? "border-text scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: color,
                    }}
                    title={color}
                    aria-label={`Select brand color ${color}`}
                  />
                ))}

                {/* Custom color */}
                <button
                  type="button"
                  onClick={() =>
                    colorInputRef.current?.click()
                  }
                  className="w-10 h-10 rounded-xl border-2 border-dashed border-border text-text-light hover:border-primary hover:text-primary grid place-items-center transition"
                  title="Pick custom color"
                  aria-label="Pick custom brand color"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    palette
                  </span>
                </button>

                <input
                  ref={colorInputRef}
                  type="color"
                  value={
                    brandColor || DEFAULT_BRAND_COLOR
                  }
                  onChange={(e) =>
                    handleColorChange(
                      e.target.value
                    )
                  }
                  className="absolute opacity-0 w-0 h-0 pointer-events-none"
                />
              </div>

              {/* Current color */}
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="w-5 h-5 rounded-md border border-border"
                  style={{
                    backgroundColor:
                      brandColor ||
                      DEFAULT_BRAND_COLOR,
                  }}
                />

                <span className="text-[11px] text-text-muted font-medium uppercase">
                  {brandColor ||
                    DEFAULT_BRAND_COLOR}
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================
              BRANDING TOGGLES
          ========================================================== */}
          {[
            {
              key: "qr",
              title: "Show payment QR code on PDF",
              sub: "Quick mobile payment from a printed invoice",
            },
            {
              key: "thumbnails",
              title: "Include line-item thumbnails",
              sub: "Show product images alongside descriptions",
            },
            {
              key: "footer",
              title: "Use custom footer text on invoices",
              sub: "Add a personalized thank-you message",
            },
          ].map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between py-3 border-b border-border-light last:border-0"
            >
              <div>
                <div className="text-[13.5px] font-semibold text-text">
                  {row.title}
                </div>

                <div className="text-[11.5px] text-text-muted mt-0.5">
                  {row.sub}
                </div>
              </div>

              <Toggle
                enabled={Boolean(
                  brandToggles?.[row.key]
                )}
                onToggle={() =>
                  setBrandToggles((previous) => ({
                    ...previous,
                    [row.key]: !previous[row.key],
                  }))
                }
              />
            </div>
          ))}
        </div>
      </Card>

      <SectionActions
        onDiscard={handleDiscard}
        onSave={handleSave}
      />
    </>
  );
}
