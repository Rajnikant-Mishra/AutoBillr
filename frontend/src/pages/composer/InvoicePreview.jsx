import { useLocation } from "react-router-dom";
import InvoiceTemplate from "./InvoiceTemplate";
import useCurrency from "../../hooks/useCurrency";

export default function InvoicePreview() {
  const location = useLocation();
  const { format } = useCurrency();

  const params = new URLSearchParams(location.search);

  const invoice = JSON.parse(
    decodeURIComponent(
      params.get("data") || "{}"
    )
  );

  return (
    <div className="min-h-screen bg-slate-100 py-4 px-4">
      <button
        onClick={() => window.print()}
        className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-teal-600 text-white font-semibold shadow-lg print:hidden"
      >
        Print
      </button>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <InvoiceTemplate
          invoice={invoice}
          subtotal={invoice.subtotal || 0}
          tax={invoice.tax || 0}
          total={invoice.total || 0}
          format={format}
        />
      </div>
    </div>
  );
}