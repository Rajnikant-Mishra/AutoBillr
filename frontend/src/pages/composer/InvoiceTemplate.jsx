// components/invoice/InvoiceTemplate.jsx

export default function InvoiceTemplate({
  invoice,
  selectedClient,
  selectedProject,
  subtotal,
  tax,
  total,
  format,
}) {
const formatCurrency = (value) => {
  return format
    ? format(Number(value || 0))
    : Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

  return (
    <div className="bg-white p-10 w-full">
      {/* Header */}
      <div className="flex justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded bg-teal-600 grid place-items-center">
              <span className="material-symbols-outlined text-white">
                bolt
              </span>
            </div>

            <h2 className="text-2xl font-black">
              AutoBillr
            </h2>
          </div>

          <p className="text-sm text-slate-500 leading-relaxed">
            1287 Financial District
            <br />
            San Francisco, CA 94105
            <br />
            United States
          </p>
        </div>

        <div className="text-right">
          <h1 className="text-4xl font-black uppercase">
            Invoice
          </h1>

          <p className="font-bold">
            #{invoice.invoiceNumber}
          </p>

          <p className="text-xs text-slate-400 uppercase mt-2">
            Issued · {invoice.invoiceDate}
          </p>
        </div>
      </div>

      {/* Client + Project */}
      <div className="grid grid-cols-2 gap-10 mb-8">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Bill To
          </div>

          <div className="text-slate-900 font-bold mb-1">
            {selectedClient?.name ||
              invoice.clientName ||
              "Client"}
          </div>

          <div className="text-[12.5px] text-slate-500 leading-relaxed">
            Sarah Jenkins
            <br />
            450 Market St, Suite 2100
            <br />
            San Francisco, CA 94103
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Project
          </div>

          <div className="text-slate-900 font-bold mb-1">
            {selectedProject?.title ||
              invoice.projectName ||
              "Project"}
          </div>

          <div className="text-[12.5px] text-slate-500">
            PO #89211-ACME
          </div>

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">
            Due · {invoice.dueDate}
          </div>
        </div>
      </div>

      {/* Items */}
      <table className="w-full mb-5">
        <thead>
          <tr className="border-b-2 border-slate-900">
            <th className="text-left py-2 text-[10px] font-black uppercase tracking-widest">
              Description
            </th>
            <th className="text-right py-2 text-[10px] font-black uppercase tracking-widest">
              Qty
            </th>
            <th className="text-right py-2 text-[10px] font-black uppercase tracking-widest">
              Rate
            </th>
            <th className="text-right py-2 text-[10px] font-black uppercase tracking-widest">
              Amount
            </th>
          </tr>
        </thead>

       <tbody className="divide-y divide-slate-100">
  {invoice.items.map((item) => (
    <tr key={item.id}>
              <td className="py-3 text-[13px] font-bold text-slate-900">
                {item.desc}
              </td>

              <td className="py-3 text-right text-[13px]">
                {Number(item.qty).toFixed(2)}
              </td>

              <td className="py-3 text-right text-[13px]">
                {formatCurrency(item.rate)}
              </td>

              <td className="py-3 text-right text-[13px] font-bold">
                  {formatCurrency(
    Number(item.qty) * Number(item.rate)
  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end pt-6 border-t border-slate-200">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-500">
              Subtotal
            </span>

          <span>
  {formatCurrency(subtotal)}
</span>
          </div>

          <div className="flex justify-between text-[13px]">
            <span className="text-slate-500">
              Tax (8.5%)
            </span>

            <span>
                {formatCurrency(tax)}
            </span>
          </div>

          <div className="flex justify-between pt-3 border-t">
            <span className="font-black uppercase text-xs">
              Amount Due
            </span>

            <span className="text-2xl font-bold text-teal-600">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-8 border-t border-slate-100 grid grid-cols-2 text-[10.5px]">
        <div className="text-slate-400 space-y-1">
          <p className="font-bold text-slate-600">
            PAYMENT TERMS
          </p>

          <p>
            Net 15 Days. Please make checks payable
            to AutoBillr Inc.
          </p>

          <p>
            Routing: 01211122 / Acc:
            888219001
          </p>
        </div>

        <div className="text-right flex justify-end">
          <div className="inline-flex items-center gap-2 text-teal-600">
            <span className="font-bold uppercase tracking-widest">
              Pay Online Secured
            </span>

            <span className="material-symbols-outlined text-sm">
              lock
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}