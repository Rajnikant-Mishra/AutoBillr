import Card from "../ui/Card";
import FormInput from "../ui/FormInput";
import Toggle from "./Toggle";
import SectionActions from "./SectionActions";

const labelClass =
  "block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5";

const selectClassName = `
  w-full h-11 px-3
  border border-border rounded-lg text-sm
  bg-[var(--input-background)] text-text
  focus:outline-none
  focus:border-primary focus:ring-2 focus:ring-primary/20
  transition-colors
`;

export default function TaxInvoicingSection({
  tax,
  setTaxField,
  setTax,
  onDiscard,
  onSave,
}) {
  return (
    <>
      <Card padding="p-6">
        <div className="mb-5 pb-4 border-b border-border-light">
          <div className="text-base font-bold text-text">
            Tax & invoicing rules
          </div>
          <div className="text-xs text-text-muted mt-1">
            Configure default tax behavior and invoice numbering
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Default tax rate</label>
              <div className="relative">
                <input
                  value={tax.rate}
                  onChange={setTaxField("rate")}
                  className="w-full h-11 pl-3 pr-8 border border-border rounded-lg text-sm tabular bg-[var(--input-background)] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light text-sm">
                  %
                </span>
              </div>
            </div>
            <FormInput
              label="Tax label"
              value={tax.label}
              onChange={setTaxField("label")}
            />
            <FormInput
              label="Invoice prefix"
              value={tax.prefix}
              onChange={setTaxField("prefix")}
            />
            <FormInput
              label="Next invoice number"
              value={tax.nextNumber}
              onChange={setTaxField("nextNumber")}
            />
            <div>
              <label className={labelClass}>Payment terms (default)</label>
              <select
                value={tax.terms}
                onChange={setTaxField("terms")}
                className={selectClassName}
              >
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Net 60</option>
                <option>Due on receipt</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Late fee policy</label>
              <select
                value={tax.lateFee}
                onChange={setTaxField("lateFee")}
                className={selectClassName}
              >
                <option>1.5% / month</option>
                <option>Flat $50</option>
                <option>None</option>
              </select>
            </div>
          </div>

          {[
            {
              key: "autoTax",
              title: "Auto-calculate tax based on client location",
              sub: "Use Avalara to determine destination-based tax",
            },
            {
              key: "breakdown",
              title: "Include tax breakdown on invoices",
              sub: "Show tax per line item",
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
                enabled={tax[row.key]}
                onToggle={() =>
                  setTax((p) => ({ ...p, [row.key]: !p[row.key] }))
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