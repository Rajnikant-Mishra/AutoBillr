
import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import InvoiceTemplate from "./InvoiceTemplate"; // adjust path if needed
import useCurrency from "../../hooks/useCurrency"; // adjust path if needed

export default function InvoicePreview() {
  const [searchParams] = useSearchParams();
  const { format } = useCurrency();

  const previewData = useMemo(() => {
    try {
      const raw = searchParams.get("data");
      if (!raw) return null;
      return JSON.parse(decodeURIComponent(raw));
    } catch (err) {
      console.error("Failed to parse preview data:", err);
      return null;
    }
  }, [searchParams]);

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-text-muted">No invoice data found.</p>
      </div>
    );
  }

  const {
    clientName,
    projectName,
    subtotal = 0,
    tax = 0,
    total = 0,
    ...invoice
  } = previewData;

  return (
    <div className="min-h-screen bg-surface py-10 px-4">
      <div className="max-w-[800px] mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        <InvoiceTemplate
          invoice={invoice}
          clientName={clientName}
          projectName={projectName}
          subtotal={subtotal}
          tax={tax}
          total={total}
          format={format}
        />
      </div>
    </div>
  );
}
