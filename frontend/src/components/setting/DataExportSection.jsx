import Card from "../ui/Card";
import Toggle from "../ui/Toggle";
import SectionActions from "./SectionActions";


const EXPORT_CARDS = [
  {
    title: "Full invoice history",
    sub: "1,284 invoices · CSV / XLSX / PDF",
  },
  {
    title: "Client master list",
    sub: "128 clients · CSV / JSON",
  },
  {
    title: "Payment events",
    sub: "42K events · CSV",
  },
  {
    title: "Audit log",
    sub: "SOC 2 audit trail · JSON",
  },
];

export default function DataExportSection({
  exportToggles,
  setExportToggles,
  onDiscard,
  onSave,
}) {
  return (
    <>
      <Card padding="p-6">
        <div className="mb-5 pb-4 border-b border-border-light">
          <div className="text-base font-bold text-text">Export & retention</div>
          <div className="text-xs text-text-muted mt-1">
            Get your data out · SOC 2 & GDPR compliant
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXPORT_CARDS.map((card) => (
              <div
                key={card.title}
                className="p-4 border border-border rounded-xl bg-surface-secondary"
              >
                <div className="text-[13px] font-bold text-text">{card.title}</div>
                <div className="text-[11px] text-text-muted mt-1">{card.sub}</div>
                <button
                  type="button"
                  className="mt-3 px-3 py-1.5 bg-surface border border-border hover:bg-surface-hover text-xs font-bold rounded-lg text-primary flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    download
                  </span>
                  Download
                </button>
              </div>
            ))}
          </div>

          {[
            {
              key: "archive",
              title: "Auto-archive invoices older than 7 years",
              sub: "Per SOX retention requirements",
            },
            {
              key: "encrypt",
              title: "Encrypt exports with AES-256",
              sub: "Password protect downloadable files",
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
                enabled={exportToggles[row.key]}
                onToggle={() =>
                  setExportToggles((p) => ({
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