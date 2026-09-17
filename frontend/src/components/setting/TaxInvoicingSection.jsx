
import FormInput from "../ui/FormInput";
import Toggle from "../ui/Toggle";
import SectionActions from "./SectionActions";
import Card from "../ui/Card";

const labelClass =
  "block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5";

const inputClassName = `
  w-full h-11 px-3
  border border-border rounded-lg text-sm
  bg-[var(--input-background)] text-text
  focus:outline-none
  focus:border-primary
  focus:ring-2 focus:ring-primary/20
  transition-colors
`;

const selectClassName = `
  w-full h-11 px-3
  border border-border rounded-lg text-sm
  bg-[var(--input-background)] text-text
  focus:outline-none
  focus:border-primary
  focus:ring-2 focus:ring-primary/20
  transition-colors
`;

export default function TaxInvoicingSection({
  tax = {},
  setTaxField,
  setTax,
  onDiscard,
  onSave,
}) {
  /*
   * Do NOT put company defaults here.
   *
   * These values come from Settings.jsx.
   *
   * Example:
   *
   * tax.rate
   * tax.label
   * tax.prefix
   * tax.nextNumber
   * tax.terms
   * tax.lateFee
   */

  const safeTax = {
  rate: tax?.rate !== undefined && tax?.rate !== null && tax?.rate !== ""
    ? tax.rate
    : "18",                 // ← default 18
  label: tax?.label ?? "",
  prefix: tax?.prefix ?? "",
  nextNumber: tax?.nextNumber ?? "",
  terms: tax?.terms ?? "",
  lateFee: tax?.lateFee ?? "",
  autoTax: Boolean(tax?.autoTax),
  breakdown: Boolean(tax?.breakdown),
};

  /*
   * Keep standard choices available.
   *
   * If the registered value is different from these,
   * it is added automatically so it remains selected.
   */

  const paymentTermsOptions = [
    "Net 15",
    "Net 30",
    "Net 60",
    "Due on receipt",
  ];

  const lateFeeOptions = [
    "1.5% / month",
    "Flat $50",
    "None",
  ];

  const finalPaymentTermsOptions = [
    ...(safeTax.terms &&
    !paymentTermsOptions.includes(safeTax.terms)
      ? [safeTax.terms]
      : []),
    ...paymentTermsOptions,
  ];

  const finalLateFeeOptions = [
    ...(safeTax.lateFee &&
    !lateFeeOptions.includes(safeTax.lateFee)
      ? [safeTax.lateFee]
      : []),
    ...lateFeeOptions,
  ];

  return (
    <>
      <Card padding="p-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-5 pb-4 border-b border-border-light">
          <div className="text-base font-bold text-text">
            Tax & invoicing rules
          </div>

          <div className="text-xs text-text-muted mt-1">
            Configure default tax behavior and invoice numbering
          </div>
        </div>

        <div className="space-y-4">

          {/* ===================================================
              INPUTS
          =================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* =================================================
                DEFAULT TAX RATE
            ================================================= */}

            <div>
              <label className={labelClass}>
                Default tax rate
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={safeTax.rate}
                  onChange={setTaxField("rate")}
                  placeholder="Enter tax rate"
                  className={`
                    ${inputClassName}
                    pl-3
                    pr-8
                    tabular
                  `}
                />

                <span
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-text-light
                    text-sm
                  "
                >
                  %
                </span>
              </div>
            </div>

            {/* =================================================
                TAX LABEL
            ================================================= */}

            <FormInput
              label="Tax label"
              value={safeTax.label}
              onChange={setTaxField("label")}
              placeholder="Enter tax label"
            />

            {/* =================================================
                INVOICE PREFIX
            ================================================= */}

            <FormInput
              label="Invoice prefix"
              value={safeTax.prefix}
              onChange={setTaxField("prefix")}
              placeholder="Enter invoice prefix"
            />

            {/* =================================================
                NEXT INVOICE NUMBER
            ================================================= */}

            <FormInput
              label="Next invoice number"
              type="number"
              value={safeTax.nextNumber}
              onChange={setTaxField("nextNumber")}
              placeholder="Enter next invoice number"
            />

            {/* =================================================
                PAYMENT TERMS
            ================================================= */}

            <div>
              <label className={labelClass}>
                Payment terms (default)
              </label>

              <select
                value={safeTax.terms}
                onChange={setTaxField("terms")}
                className={selectClassName}
              >
                <option value="">
                  Select payment terms
                </option>

                {finalPaymentTermsOptions.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* =================================================
                LATE FEE
            ================================================= */}

            <div>
              <label className={labelClass}>
                Late fee policy
              </label>

              <select
                value={safeTax.lateFee}
                onChange={setTaxField("lateFee")}
                className={selectClassName}
              >
                <option value="">
                  Select late fee policy
                </option>

                {finalLateFeeOptions.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* ===================================================
              TAX TOGGLES
          =================================================== */}

          <div className="pt-2">

            {/* =================================================
                AUTO TAX
            ================================================= */}

            <div
              className="
                flex
                items-center
                justify-between
                py-3
                border-b
                border-border-light
              "
            >
              <div>
                <div
                  className="
                    text-[13.5px]
                    font-semibold
                    text-text
                  "
                >
                  Auto-calculate tax based on client location
                </div>

                <div
                  className="
                    text-[11.5px]
                    text-text-muted
                    mt-0.5
                  "
                >
                  Use Avalara to determine destination-based tax
                </div>
              </div>

              <Toggle
                enabled={safeTax.autoTax}
                onToggle={() =>
                  setTax((previous) => ({
                    ...previous,
                    autoTax:
                      !Boolean(previous.autoTax),
                  }))
                }
              />
            </div>

            {/* =================================================
                TAX BREAKDOWN
            ================================================= */}

            <div
              className="
                flex
                items-center
                justify-between
                py-3
              "
            >
              <div>
                <div
                  className="
                    text-[13.5px]
                    font-semibold
                    text-text
                  "
                >
                  Include tax breakdown on invoices
                </div>

                <div
                  className="
                    text-[11.5px]
                    text-text-muted
                    mt-0.5
                  "
                >
                  Show tax per line item
                </div>
              </div>

              <Toggle
                enabled={safeTax.breakdown}
                onToggle={() =>
                  setTax((previous) => ({
                    ...previous,
                    breakdown:
                      !Boolean(previous.breakdown),
                  }))
                }
              />
            </div>
          </div>
        </div>
      </Card>

      {/* =====================================================
          SAVE / DISCARD
      ===================================================== */}

      <SectionActions
        onDiscard={onDiscard}
        onSave={onSave}
      />
    </>
  );
}

