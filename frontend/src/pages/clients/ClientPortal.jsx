import React, { useMemo, useState } from "react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import useCurrency from "../../hooks/useCurrency";

/* =========================================================
   MOCK DATA (replace with API later)
========================================================= */
const CLIENT = {
  firstName: "Sarah",
  company: "Apex Partners",
  supportEmail: "billing@apexpartners.com",
};

const STATS = {
  outstanding: 1100,
  ytdPaid: 28000,
  ytdPaidLabel: "$28K",
  invoicesPaid: 9,
  onTimeRate: 100,
  nextBillingDate: "Dec 12",
  nextBillingEstimate: 2450,
  nextBillingNote: "Monthly retainer",
};

const INVOICES = [
  {
    id: "INV-8821",
    date: "Oct 12, 2024",
    amount: 2450,
    status: "paid",
  },
  {
    id: "INV-8820",
    date: "Sep 12, 2024",
    amount: 2450,
    status: "paid",
  },
  {
    id: "INV-8819",
    date: "Aug 12, 2024",
    amount: 2200,
    status: "paid",
  },
  {
    id: "INV-8822",
    date: "Nov 12, 2024",
    amount: 1100,
    status: "pending",
  },
];

const PAYMENT_METHODS = [
  {
    id: 1,
    brand: "Visa",
    last4: "4242",
    expires: "04/27",
    isDefault: true,
  },
];

/* =========================================================
   PAGE
========================================================= */
export default function ClientPortal() {
  const { format } = useCurrency();
  const [invoices] = useState(INVOICES);

  const statusVariant = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "paid") return "paid";
    if (s === "pending") return "pending";
    if (s === "overdue") return "risk";
    return "default";
  };

  const handlePayNow = (invoiceId) => {
    console.log("Pay invoice:", invoiceId || "outstanding");
  };

  const handleDownload = (invoiceId) => {
    console.log("Download invoice:", invoiceId);
  };

  const handleDownloadAll = () => {
    console.log("Download all invoices CSV");
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Minimal top bar (no admin sidebar) */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg grid place-items-center text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <span className="material-symbols-outlined text-[18px] mi-fill">
                bolt
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-text leading-tight">
                AutoBillr
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">
                Client Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary hidden sm:inline">
              {CLIENT.company}
            </span>
            <div className="w-9 h-9 rounded-full bg-primary-soft text-primary grid place-items-center text-xs font-bold">
              {CLIENT.firstName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text tracking-tight mb-2">
            Welcome back, {CLIENT.firstName}
          </h1>
          <p className="text-text-muted">
            Manage your invoices, payments, and account information.
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {/* Outstanding */}
          <Card padding="p-6">
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">
              Outstanding Balance
            </div>
            <div className="text-3xl font-bold text-text tabular">
              {format(STATS.outstanding)}
            </div>
            <Button
              fullWidth
              icon="payments"
              className="mt-4"
              onClick={() => handlePayNow()}
            >
              Pay Now
            </Button>
          </Card>

          {/* YTD Paid */}
          <Card padding="p-6">
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">
              YTD Paid
            </div>
            <div className="text-3xl font-bold text-text tabular">
              {STATS.ytdPaidLabel}
            </div>
            <div className="text-[12px] text-text-muted mt-4">
              {STATS.invoicesPaid} invoices paid · {STATS.onTimeRate}% on-time
              rate
            </div>
          </Card>

          {/* Next Billing */}
          <Card padding="p-6">
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">
              Next Billing
            </div>
            <div className="text-3xl font-bold text-text tabular">
              {STATS.nextBillingDate}
            </div>
            <div className="text-[12px] text-text-muted mt-4">
              {STATS.nextBillingNote} · ~{format(STATS.nextBillingEstimate)}{" "}
              (estimate)
            </div>
          </Card>
        </div>

        {/* Invoices table */}
        <Card padding="p-0" className="overflow-hidden">
          <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
            <h3 className="text-base font-bold text-text">Your Invoices</h3>
            <button
              type="button"
              onClick={handleDownloadAll}
              className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">
                download
              </span>
              Download all (CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-secondary text-[10.5px] font-bold text-text-muted uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-3 text-left">Invoice</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-surface-hover transition"
                  >
                    <td className="px-6 py-4 font-bold text-text text-sm tabular">
                      #{inv.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {inv.date}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-text tabular">
                      {format(inv.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        label={inv.status}
                        variant={statusVariant(inv.status)}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDownload(inv.id)}
                        className="text-primary text-xs font-bold hover:underline mr-3"
                        aria-label={`Download ${inv.id}`}
                      >
                        <span className="material-symbols-outlined align-middle text-[16px]">
                          download
                        </span>
                      </button>
                      {inv.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handlePayNow(inv.id)}
                          className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold"
                        >
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Bottom row */}
        <div className="grid md:grid-cols-2 gap-5 mt-6">
          {/* Payment methods */}
          <Card padding="p-6">
            <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">
                credit_card
              </span>
              Payment Methods
            </h3>

            <div className="space-y-3">
              {PAYMENT_METHODS.map((pm) => (
                <div
                  key={pm.id}
                  className="flex items-center justify-between p-3 border border-border-light rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 rounded bg-gradient-to-br from-blue-600 to-blue-800" />
                    <div>
                      <div className="text-[13px] font-semibold text-text">
                        {pm.brand} •••• {pm.last4}
                      </div>
                      <div className="text-[11px] text-text-muted">
                        Expires {pm.expires}
                        {pm.isDefault ? " · Default" : ""}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-bold text-text-muted hover:text-primary"
                  >
                    Edit
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="w-full py-2.5 border border-dashed border-border rounded-lg text-sm text-text-secondary hover:border-primary/40 hover:text-primary hover:bg-primary-soft flex items-center justify-center gap-2 transition"
              >
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
                Add payment method
              </button>
            </div>
          </Card>

          {/* Help */}
          <Card padding="p-6">
            <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">
                contact_support
              </span>
              Need help?
            </h3>
            <p className="text-sm text-text-muted leading-relaxed mb-4">
              Questions about a charge or invoice? Our team responds within 2
              business hours.
            </p>
            <div className="space-y-2">
              <a
                href={`mailto:${CLIENT.supportEmail}`}
                className="w-full py-2.5 bg-surface-secondary hover:bg-surface-hover rounded-lg text-sm font-semibold flex items-center justify-center gap-2 text-text-secondary transition"
              >
                <span className="material-symbols-outlined text-[16px]">
                  mail
                </span>
                {CLIENT.supportEmail}
              </a>
              <button
                type="button"
                className="w-full py-2.5 bg-surface-secondary hover:bg-surface-hover rounded-lg text-sm font-semibold flex items-center justify-center gap-2 text-text-secondary transition"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chat
                </span>
                Open chat with finance team
              </button>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
          <span>© 2026 AutoBillr Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary">
              Privacy
            </a>
            <a href="#" className="hover:text-primary">
              Terms
            </a>
            <a href="#" className="hover:text-primary">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}