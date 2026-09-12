import Card from "../ui/Card";
import FormInput from "../ui/FormInput";
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

export default function BusinessInfoSection({
  business,
  setBiz,
  onDiscard,
  onSave,
}) {
  return (
    <>
      <Card padding="p-6">
        <div className="mb-5 pb-4 border-b border-border-light">
          <div className="text-base font-bold text-text">Business details</div>
          <div className="text-xs text-text-muted mt-1">
            Public info shown on invoices, statements and client portal
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Company name"
              value={business.companyName}
              onChange={setBiz("companyName")}
            />
            <FormInput
              label="Display name"
              value={business.displayName}
              onChange={setBiz("displayName")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Industry</label>
              <select
                value={business.industry}
                onChange={setBiz("industry")}
                className={selectClassName}
              >
                <option>SaaS / Software</option>
                <option>Agency</option>
                <option>Consulting</option>
                <option>Freelance</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Company size</label>
              <select
                value={business.companySize}
                onChange={setBiz("companySize")}
                className={selectClassName}
              >
                <option>1–10 employees</option>
                <option>11–50 employees</option>
                <option>50–250 employees</option>
                <option>250–1,000</option>
                <option>1,000+</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Default currency</label>
              <select
                value={business.currency}
                onChange={setBiz("currency")}
                className={selectClassName}
              >
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>INR (₹)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Fiscal year starts</label>
              <select
                value={business.fiscalYear}
                onChange={setBiz("fiscalYear")}
                className={selectClassName}
              >
                <option>January</option>
                <option>April</option>
                <option>July</option>
                <option>October</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <textarea
              rows={2}
              value={business.address}
              onChange={setBiz("address")}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-[var(--input-background)] text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Tax ID / EIN"
              value={business.taxId}
              onChange={setBiz("taxId")}
            />
            <FormInput
              label="VAT (EU only)"
              value={business.vat}
              onChange={setBiz("vat")}
              placeholder="—"
            />
          </div>
        </div>
      </Card>
      <SectionActions onDiscard={onDiscard} onSave={onSave} />
    </>
  );
}