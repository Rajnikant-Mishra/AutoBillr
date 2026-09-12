import { useRef } from "react";
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

const labelClass =
  "block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5";

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

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a PNG or image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setLogoUrl(base64);
      localStorage.setItem("autobillr-logo", base64);
      window.dispatchEvent(new Event("autobillr-branding-updated"));
    };
    reader.readAsDataURL(file);
  };

  const handleColorChange = (color) => {
    setBrandColor(color);
    localStorage.setItem("autobillr-brand-color", color);
    document.documentElement.style.setProperty("--color-primary", color);
    window.dispatchEvent(new Event("autobillr-branding-updated"));
  };

  return (
    <>
      <Card padding="p-6">
        <div className="mb-5 pb-4 border-b border-border-light">
          <div className="text-base font-bold text-text">Brand identity</div>
          <div className="text-xs text-text-muted mt-1">
            How your invoices look in client inboxes
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Logo Upload */}
            <div>
              <label className={labelClass}>Logo</label>
              <div className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl">
                <div
                  className="w-12 h-12 rounded-lg grid place-items-center overflow-hidden shrink-0"
                  style={{
                    backgroundColor: logoUrl
                      ? "transparent"
                      : brandColor || "var(--color-primary)",
                  }}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="material-symbols-outlined mi-fill text-[24px] text-white">
                      bolt
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text">
                    {logoUrl ? "Custom logo" : "AutoBillr logo"}
                  </div>
                  <div className="text-[11px] text-text-muted">
                    PNG · 1024×1024 recommended
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-soft rounded-lg"
                >
                  Upload
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>

            {/* Background / Brand Color */}
            <div>
              <label className={labelClass}>Background / Brand color</label>
              <div className="flex items-center gap-3 flex-wrap">
                {BRAND_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleColorChange(c)}
                    className={`w-10 h-10 rounded-xl border-2 transition ${
                      brandColor === c
                        ? "border-text scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ background: c }}
                  />
                ))}

                {/* Paint palette – opens native color picker */}
                <button
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  className="w-10 h-10 rounded-xl border-2 border-dashed border-border text-text-light hover:border-primary hover:text-primary grid place-items-center transition"
                  title="Pick custom color"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    palette
                  </span>
                </button>

                {/* Hidden native color input */}
                <input
                  ref={colorInputRef}
                  type="color"
                  value={brandColor || "#0d9488"}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="absolute opacity-0 w-0 h-0 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
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
                enabled={brandToggles[row.key]}
                onToggle={() =>
                  setBrandToggles((p) => ({
                    ...p,
                    [row.key]: !p[row.key],
                  }))
                }
              />
            </div>
          ))}
        </div>
      </Card>
      <SectionActions onDiscard={onDiscard} onSave={onSave} />
    </>
  );
}


