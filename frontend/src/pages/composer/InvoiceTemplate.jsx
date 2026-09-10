
import React from "react";

export default function InvoiceTemplate({
  invoice = {},
  selectedClient = null,
  selectedProject = null,
  subtotal = 0,
  tax = 0,
  total = 0,
  format,
  // These come from the separate Live Preview page
  clientName,
  projectName,
}) {
  const formatCurrency = (value) => {
    if (typeof format === "function") return format(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency || "USD",
    }).format(Number(value) || 0);
  };

  const formatDate = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return value;
    }
  };

  const displayClientName =
    clientName ||
    selectedClient?.name ||
    invoice.clientName ||
    invoice.client?.name ||
    "—";

  const displayProjectName =
    projectName ||
    selectedProject?.title ||
    invoice.projectName ||
    invoice.project?.title ||
    "—";

  const items = Array.isArray(invoice.items) ? invoice.items : [];

  return (
    <div className="p-8 bg-white text-text">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text">
            INVOICE
          </h1>
          <p className="text-sm text-text-muted mt-1">
            #{invoice.invoiceNumber || "—"}
          </p>
        </div>

        <div className="text-right text-sm">
          <p className="font-bold">AutoBillr Inc.</p>
          <p className="text-text-muted">hello@autobillr.com</p>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
        <div>
          <p className="text-[11px] font-bold uppercase text-text-muted mb-1">
            Bill To
          </p>
          <p className="font-semibold text-base">{displayClientName}</p>
          {displayProjectName !== "—" && (
            <p className="text-text-muted mt-0.5">
              Project: {displayProjectName}
            </p>
          )}
        </div>

        <div className="text-right space-y-1">
          <div className="flex justify-end gap-6">
            <span className="text-text-muted">Invoice Date</span>
            <span className="font-medium">
              {formatDate(invoice.invoiceDate || invoice.issueDate)}
            </span>
          </div>
          <div className="flex justify-end gap-6">
            <span className="text-text-muted">Due Date</span>
            <span className="font-medium">
              {formatDate(invoice.dueDate)}
            </span>
          </div>
          <div className="flex justify-end gap-6">
            <span className="text-text-muted">Status</span>
            <span className="font-medium capitalize">
              {invoice.status || "Draft"}
            </span>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase text-text-muted">
              <th className="pb-3 font-bold">Description</th>
              <th className="pb-3 font-bold text-right w-20">Qty</th>
              <th className="pb-3 font-bold text-right w-28">Rate</th>
              <th className="pb-3 font-bold text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-text-muted">
                  No line items
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const qty = Number(item.qty ?? item.quantity ?? 0);
                const rate = Number(item.rate ?? item.unitPrice ?? 0);
                const amount = qty * rate;

                return (
                  <tr
                    key={item.id || idx}
                    className="border-b border-border-light"
                  >
                    <td className="py-3 pr-4">
                      {item.desc || item.description || "—"}
                    </td>
                    <td className="py-3 text-right">{qty}</td>
                    <td className="py-3 text-right">
                      {formatCurrency(rate)}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-text-muted">Subtotal</span>
            <span className="text-text">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between text-[13px]">
            <span className="text-text-muted">Tax (8.5%)</span>
            <span className="text-text">{formatCurrency(tax)}</span>
          </div>

          <div className="flex justify-between pt-3 border-t border-border">
            <span className="font-black uppercase text-xs text-text">
              Amount Due
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 pt-8 border-t border-border-light grid grid-cols-2 text-[10.5px]">
        <div className="text-text-light space-y-1">
          <p className="font-bold text-text-secondary">PAYMENT TERMS</p>
          <p>Net 15 Days. Please make checks payable to AutoBillr Inc.</p>
          <p>Routing: 01211122 / Acc: 888219001</p>
        </div>

        <div className="text-right flex justify-end">
          <div className="inline-flex items-center gap-2 text-primary">
            <span className="font-bold uppercase tracking-widest">
              Pay Online Secured
            </span>
            <span className="material-symbols-outlined text-sm">lock</span>
          </div>
        </div>
      </div>
    </div>
  );
}