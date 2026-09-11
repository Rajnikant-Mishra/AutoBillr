import React, { useState } from "react";

import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormInput from "../../components/ui/FormInput";
import Badge from "../../components/ui/Badge";

/* =========================================================
   NAV
========================================================= */
const SETTINGS_NAV = [
  { id: "business", label: "Business Info", icon: "business" },
  { id: "branding", label: "Branding", icon: "palette" },
  { id: "tax", label: "Tax & Invoicing", icon: "receipt" },
  { id: "payments", label: "Payment Methods", icon: "credit_card" },
  { id: "integrations", label: "Integrations", icon: "extension" },
  { id: "notifications", label: "Notifications", icon: "notifications" },
  { id: "api", label: "API & Webhooks", icon: "code" },
  { id: "export", label: "Data & Export", icon: "cloud_download" },
];

const BRAND_COLORS = [
  "#0d9488",
  "#4f46e5",
  "#dc2626",
  "#f59e0b",
  "#0891b2",
  "#7c3aed",
];

const PAYMENT_METHODS = [
  {
    id: "stripe",
    name: "Stripe (Cards + ACH)",
    sub: "$390K processed this year",
    icon: "credit_card",
    iconBg: "bg-indigo-100 text-indigo-600",
    status: "Connected",
    statusVariant: "paid",
  },
  {
    id: "plaid",
    name: "Plaid Bank Transfers",
    sub: "12 bank accounts linked",
    icon: "account_balance",
    iconBg: "bg-primary-soft text-primary",
    status: "Connected",
    statusVariant: "paid",
  },
  {
    id: "paypal",
    name: "PayPal",
    sub: "$18K processed this year",
    icon: "payments",
    iconBg: "bg-warning-soft text-warning",
    status: "Connected",
    statusVariant: "paid",
  },
  {
    id: "apple",
    name: "Apple Pay & Google Pay",
    sub: "Enable to allow mobile payment",
    icon: "phone_iphone",
    iconBg: "bg-surface-secondary text-text-muted",
    status: "Disabled",
    statusVariant: "default",
  },
  {
    id: "wire",
    name: "Wire Transfer",
    sub: "Account details printed on invoice",
    icon: "swap_horiz",
    iconBg: "bg-info-soft text-info",
    status: "Manual",
    statusVariant: "scheduled",
  },
];

const INTEGRATIONS = [
  {
    id: "qb",
    initials: "QB",
    initialsBg: "bg-green-100 text-green-700",
    name: "QuickBooks Online",
    sub: "Two-way sync of invoices & payments",
    connected: true,
  },
  {
    id: "xero",
    initials: "Xe",
    initialsBg: "bg-sky-100 text-sky-700",
    name: "Xero",
    sub: "Cloud accounting integration",
    connected: false,
  },
  {
    id: "ns",
    initials: "NS",
    initialsBg: "bg-orange-100 text-orange-700",
    name: "NetSuite",
    sub: "Enterprise ERP — full bidirectional",
    connected: false,
  },
  {
    id: "sf",
    initials: "SF",
    initialsBg: "bg-blue-100 text-blue-700",
    name: "Salesforce",
    sub: "Sync clients & opportunities",
    connected: true,
  },
  {
    id: "hs",
    initials: "Hb",
    initialsBg: "bg-orange-100 text-orange-700",
    name: "HubSpot",
    sub: "Marketing + sales sync",
    connected: false,
  },
  {
    id: "slack",
    initials: "Sl",
    initialsBg: "bg-purple-100 text-purple-700",
    name: "Slack",
    sub: "Real-time alerts & notifications",
    connected: true,
  },
  {
    id: "zapier",
    initials: "Za",
    initialsBg: "bg-orange-100 text-orange-700",
    name: "Zapier",
    sub: "Connect to 5,000+ apps",
    connected: false,
  },
  {
    id: "snow",
    initials: "Sn",
    initialsBg: "bg-cyan-100 text-cyan-700",
    name: "Snowflake",
    sub: "Stream billing data to warehouse",
    connected: true,
  },
];

const NOTIFICATION_ROWS = [
  {
    id: "paid",
    title: "Invoice paid",
    sub: "$10K+ invoices",
    email: true,
    push: true,
    slack: true,
  },
  {
    id: "overdue",
    title: "Invoice overdue",
    sub: "Any amount",
    email: true,
    push: false,
    slack: true,
  },
  {
    id: "errors",
    title: "Workflow errors",
    sub: "Immediate",
    email: true,
    push: true,
    slack: true,
  },
  {
    id: "mentions",
    title: "Team mentions",
    sub: "Real-time",
    email: true,
    push: true,
    slack: true,
  },
  {
    id: "weekly",
    title: "Weekly summary",
    sub: "Every Monday 9am",
    email: true,
    push: false,
    slack: false,
  },
];

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

/* =========================================================
   SHARED
========================================================= */
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

function Toggle({ enabled, onToggle, size = "md" }) {
  const isSm = size === "sm";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`
        relative shrink-0 rounded-full transition-colors
        ${isSm ? "w-10 h-5" : "w-11 h-6"}
        ${enabled ? "bg-primary" : "bg-border-dark"}
      `}
    >
      <span
        className={`
          absolute top-0.5 bg-surface rounded-full shadow transition-all
          ${isSm ? "w-4 h-4" : "w-5 h-5"}
          ${enabled ? "right-0.5" : "left-0.5"}
        `}
      />
    </button>
  );
}

function SectionActions({ onDiscard, onSave }) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="secondary" onClick={onDiscard}>
        Discard changes
      </Button>
      <Button icon="check" onClick={onSave}>
        Save Changes
      </Button>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function Settings() {
  const [activeTab, setActiveTab] = useState("business");

  /* ---- Business ---- */
  const [business, setBusiness] = useState({
    companyName: "AutoBillr Inc.",
    displayName: "AutoBillr",
    industry: "SaaS / Software",
    companySize: "50–250 employees",
    currency: "USD ($)",
    fiscalYear: "January",
    address:
      "1287 Financial District, San Francisco, CA 94105, United States",
    taxId: "84-3219872",
    vat: "",
  });

  /* ---- Branding ---- */
  const [brandColor, setBrandColor] = useState("#0d9488");
  const [brandToggles, setBrandToggles] = useState({
    qr: true,
    thumbnails: false,
    footer: true,
  });

  /* ---- Tax ---- */
  const [tax, setTax] = useState({
    rate: "8.5",
    label: "Sales Tax (CA)",
    prefix: "INV-",
    nextNumber: "8831",
    terms: "Net 15",
    lateFee: "1.5% / month",
    autoTax: true,
    breakdown: false,
  });

  /* ---- Notifications ---- */
  const [notif, setNotif] = useState(
    Object.fromEntries(
      NOTIFICATION_ROWS.map((r) => [
        r.id,
        { email: r.email, push: r.push, slack: r.slack },
      ])
    )
  );

  /* ---- Export ---- */
  const [exportToggles, setExportToggles] = useState({
    archive: true,
    encrypt: true,
  });

  const setBiz = (key) => (e) =>
    setBusiness((p) => ({ ...p, [key]: e.target.value }));
  const setTaxField = (key) => (e) =>
    setTax((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = () => console.log("Save", activeTab);
  const handleDiscard = () => console.log("Discard", activeTab);

  return (
    <main className="flex-1 pt-2 pb-12 max-w-[1600px] mx-auto w-full scroll-host">
      <div className="page-in">
        <SectionHeader
          title="Settings"
          description="Configure your workspace, branding, tax, integrations and exports."
        />

        <div className="grid grid-cols-12 gap-6">
          {/* SIDEBAR */}
          <aside className="col-span-12 md:col-span-3">
            <div className="bg-surface rounded-xl border border-border shadow-sm p-2 sticky top-24">
              {SETTINGS_NAV.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-colors text-left
                      ${
                        isActive
                          ? "bg-primary-soft text-primary font-semibold"
                          : "text-text-secondary hover:bg-surface-hover"
                      }
                    `}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isActive ? "text-primary" : "text-text-light"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[13.5px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* CONTENT */}
          <div className="col-span-12 md:col-span-9 space-y-5">
            {/* ========== BUSINESS ========== */}
            {activeTab === "business" && (
              <>
                <Card padding="p-6">
                  <div className="mb-5 pb-4 border-b border-border-light">
                    <div className="text-base font-bold text-text">
                      Business details
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      Public info shown on invoices, statements and client
                      portal
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
                <SectionActions onDiscard={handleDiscard} onSave={handleSave} />
              </>
            )}

            {/* ========== BRANDING ========== */}
            {activeTab === "branding" && (
              <>
                <Card padding="p-6">
                  <div className="mb-5 pb-4 border-b border-border-light">
                    <div className="text-base font-bold text-text">
                      Brand identity
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      How your invoices look in client inboxes
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Logo */}
                      <div>
                        <label className={labelClass}>Logo</label>
                        <div className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl">
                          <div
                            className="w-12 h-12 rounded-lg grid place-items-center text-white"
                            style={{ backgroundColor: "var(--color-primary)" }}
                          >
                            <span className="material-symbols-outlined mi-fill text-[24px]">
                              bolt
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-text">
                              AutoBillr logo
                            </div>
                            <div className="text-[11px] text-text-muted">
                              PNG · 1024×1024 · Last updated Aug 2024
                            </div>
                          </div>
                          <button
                            type="button"
                            className="px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-soft rounded-lg"
                          >
                            Upload
                          </button>
                        </div>
                      </div>

                      {/* Colors */}
                      <div>
                        <label className={labelClass}>Primary brand color</label>
                        <div className="flex items-center gap-3 flex-wrap">
                          {BRAND_COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setBrandColor(c)}
                              className={`w-10 h-10 rounded-xl border-2 transition ${
                                brandColor === c
                                  ? "border-text scale-110"
                                  : "border-transparent hover:scale-105"
                              }`}
                              style={{ background: c }}
                            />
                          ))}
                          <button
                            type="button"
                            className="w-10 h-10 rounded-xl border-2 border-dashed border-border text-text-light hover:border-primary grid place-items-center"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              palette
                            </span>
                          </button>
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
                <SectionActions onDiscard={handleDiscard} onSave={handleSave} />
              </>
            )}

            {/* ========== TAX ========== */}
            {activeTab === "tax" && (
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
                        <label className={labelClass}>
                          Payment terms (default)
                        </label>
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
                <SectionActions onDiscard={handleDiscard} onSave={handleSave} />
              </>
            )}

            {/* ========== PAYMENTS ========== */}
            {activeTab === "payments" && (
              <>
                <Card padding="p-6">
                  <div className="mb-5 pb-4 border-b border-border-light">
                    <div className="text-base font-bold text-text">
                      Payment methods
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      Configure how you accept payments from clients
                    </div>
                  </div>

                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-4 p-4 bg-surface-secondary rounded-xl"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg grid place-items-center ${m.iconBg}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {m.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-text">
                            {m.name}
                          </div>
                          <div className="text-[11.5px] text-text-muted">
                            {m.sub}
                          </div>
                        </div>
                        <Badge label={m.status} variant={m.statusVariant} />
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs font-bold text-primary hover:bg-surface rounded-lg"
                        >
                          Configure
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
                <SectionActions onDiscard={handleDiscard} onSave={handleSave} />
              </>
            )}

            {/* ========== INTEGRATIONS ========== */}
            {activeTab === "integrations" && (
              <>
                <Card padding="p-6">
                  <div className="mb-5 pb-4 border-b border-border-light">
                    <div className="text-base font-bold text-text">
                      Integrations
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      Connect AutoBillr to your existing financial stack
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {INTEGRATIONS.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border ${
                          item.connected
                            ? "border-primary/30 bg-primary-soft/30"
                            : "border-border bg-surface"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div
                            className={`w-10 h-10 rounded-lg grid place-items-center font-bold text-xs ${item.initialsBg}`}
                          >
                            {item.initials}
                          </div>
                          <Badge
                            label={
                              item.connected ? "Connected" : "Not connected"
                            }
                            variant={item.connected ? "paid" : "default"}
                          />
                        </div>
                        <div className="text-sm font-bold text-text mb-1">
                          {item.name}
                        </div>
                        <div className="text-[11.5px] text-text-muted mb-3">
                          {item.sub}
                        </div>
                        <button
                          type="button"
                          className={`w-full py-1.5 rounded-lg text-xs font-bold transition ${
                            item.connected
                              ? "bg-surface border border-border text-text-secondary hover:bg-surface-hover"
                              : "bg-primary text-white hover:bg-primary-hover"
                          }`}
                        >
                          {item.connected ? "Manage" : "Connect"}
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
                <SectionActions onDiscard={handleDiscard} onSave={handleSave} />
              </>
            )}

            {/* ========== NOTIFICATIONS ========== */}
            {activeTab === "notifications" && (
              <>
                <Card padding="p-6">
                  <div className="mb-5 pb-4 border-b border-border-light">
                    <div className="text-base font-bold text-text">
                      Notifications
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      When and how to ping you
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="grid grid-cols-[2fr_repeat(3,_70px)] gap-3 text-[10px] font-bold text-text-light uppercase tracking-widest border-b border-border-light pb-2">
                      <span />
                      <span className="text-center">Email</span>
                      <span className="text-center">Push</span>
                      <span className="text-center">Slack</span>
                    </div>

                    {NOTIFICATION_ROWS.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-[2fr_repeat(3,_70px)] gap-3 py-3 border-b border-border-light items-center"
                      >
                        <div>
                          <div className="text-[13px] font-bold text-text">
                            {row.title}
                          </div>
                          <div className="text-[11px] text-text-muted">
                            {row.sub}
                          </div>
                        </div>
                        {["email", "push", "slack"].map((channel) => (
                          <div key={channel} className="grid place-items-center">
                            <Toggle
                              size="sm"
                              enabled={notif[row.id]?.[channel]}
                              onToggle={() =>
                                setNotif((p) => ({
                                  ...p,
                                  [row.id]: {
                                    ...p[row.id],
                                    [channel]: !p[row.id][channel],
                                  },
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </Card>
                <SectionActions onDiscard={handleDiscard} onSave={handleSave} />
              </>
            )}

            {/* ========== API ========== */}
            {activeTab === "api" && (
              <>
                <Card padding="p-6">
                  <div className="mb-5 pb-4 border-b border-border-light">
                    <div className="text-base font-bold text-text">
                      API keys & webhooks
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      Programmatic access to your AutoBillr workspace
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Live API key</label>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value="sk_live_4f8a••••••••••••2c1e"
                          className="flex-1 h-11 px-3 border border-border rounded-lg text-sm font-mono bg-surface-secondary text-text"
                        />
                        <Button variant="secondary" size="sm">
                          Copy
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-danger"
                        >
                          Rotate
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Test API key</label>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value="sk_test_a1b2••••••••••••5e8d"
                          className="flex-1 h-11 px-3 border border-border rounded-lg text-sm font-mono bg-surface-secondary text-text"
                        />
                        <Button variant="secondary" size="sm">
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-border-light pt-5">
                      <div className="text-[11.5px] font-semibold text-text-secondary mb-3 flex items-center justify-between">
                        <span>Webhook endpoints</span>
                        <button
                          type="button"
                          className="text-primary hover:bg-primary-soft px-2 py-1 rounded text-xs flex items-center gap-1 font-bold"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            add
                          </span>
                          Add endpoint
                        </button>
                      </div>

                      <div className="space-y-2">
                        {[
                          {
                            url: "https://api.autobillr.io/webhooks/payments",
                            events: "payment.* · 4 events",
                          },
                          {
                            url: "https://hooks.slack.com/services/T0/B0",
                            events: "invoice.overdue",
                          },
                        ].map((wh) => (
                          <div
                            key={wh.url}
                            className="p-3 border border-border rounded-lg"
                          >
                            <div className="text-[12px] font-mono text-text-secondary">
                              {wh.url}
                            </div>
                            <div className="flex justify-between mt-2 text-[11px]">
                              <span className="text-text-muted">{wh.events}</span>
                              <Badge label="active" variant="paid" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
                <SectionActions onDiscard={handleDiscard} onSave={handleSave} />
              </>
            )}

            {/* ========== EXPORT ========== */}
            {activeTab === "export" && (
              <>
                <Card padding="p-6">
                  <div className="mb-5 pb-4 border-b border-border-light">
                    <div className="text-base font-bold text-text">
                      Export & retention
                    </div>
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
                          <div className="text-[13px] font-bold text-text">
                            {card.title}
                          </div>
                          <div className="text-[11px] text-text-muted mt-1">
                            {card.sub}
                          </div>
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
                <SectionActions onDiscard={handleDiscard} onSave={handleSave} />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}