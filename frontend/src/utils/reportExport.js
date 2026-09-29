import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// PDF Safe Currency Formatter (Prevents the ¹ glitch and weird spacing)
const formatCurrencyPDF = (amount, symbol = "₹") => {
  const num = Number(amount || 0);
  const prefix = symbol === "₹" || symbol === "INR" ? "INR " : `${symbol} `;
  return `${prefix}${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ==========================================
// 1. DASHBOARD REVENUE REPORT EXPORT
// ==========================================
export const exportDashboardPDF = ({
  stats = {},
  recentInvoices = [],
  currencySymbol = "₹",
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [15, 157, 148]; // AutoBillr Emerald Theme
  const textColor = [30, 41, 59];
  const mutedColor = [100, 116, 139];

  // 1. BRANDING & HEADER
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text("AutoBillr", 14, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text("BILLING & REVENUE AUTOMATION REPORT", 14, 26);

  // Meta Info
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  doc.text(`Generated: ${today}`, 196, 20, { align: "right" });
  doc.text("Period: Last 30 Days", 196, 26, { align: "right" });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 31, 196, 31);

  // 2. EXECUTIVE SUMMARY (KPIs)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.text("Executive Summary", 14, 40);

  const statsData = [
    [
      "Total Invoices",
      `${stats.totalInvoices || 0}`,
      "Monthly Revenue",
      formatCurrencyPDF(stats.monthlyRevenue || 0, currencySymbol),
    ],
    [
      "Active Projects",
      `${stats.totalProjects || 0}`,
      "Projected Revenue",
      formatCurrencyPDF(stats.projectedRevenue || 0, currencySymbol),
    ],
    [
      "Overdue Count",
      `${stats.overdueCount || 0}`,
      "Overdue Amount",
      formatCurrencyPDF(stats.overdueAmount || 0, currencySymbol),
    ],
  ];

  autoTable(doc, {
    startY: 44,
    body: statsData,
    theme: "plain",
    styles: {
      fontSize: 9.5,
      cellPadding: 3,
      textColor: textColor,
    },
    columnStyles: {
      0: { fontStyle: "bold", textColor: mutedColor, cellWidth: 38 },
      1: { fontStyle: "bold", textColor: primaryColor, cellWidth: 46 },
      2: { fontStyle: "bold", textColor: mutedColor, cellWidth: 42 },
      3: { fontStyle: "bold", textColor: textColor, cellWidth: 56 },
    },
  });

  // 3. RECENT INVOICES OVERVIEW TABLE
  const startInvoicesY = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.text("Recent Invoices Overview", 14, startInvoicesY);

  const invoiceRows = recentInvoices.map((inv) => {
    const invId = inv.invoiceNumber || inv.number || "—";
    const client = inv.clientName || inv.client?.name || "Client";
    const date = inv.date || inv.createdAt
      ? new Date(inv.date || inv.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "—";
    const amount = formatCurrencyPDF(inv.amount || inv.total || 0, currencySymbol);
    const status = String(inv.status || "DRAFT").toUpperCase();

    return [invId, client, date, amount, status];
  });

  autoTable(doc, {
    startY: startInvoicesY + 4,
    head: [["Invoice ID", "Client", "Issue Date", "Amount", "Status"]],
    body:
      invoiceRows.length > 0
        ? invoiceRows
        : [["—", "No recent invoices found", "—", "—", "—"]],
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: textColor,
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // 4. FOOTER
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(
      `AutoBillr • Generated automatically • Page ${i} of ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }

  doc.save(`AutoBillr-Revenue-Report-${Date.now()}.pdf`);
};

// ==========================================
// 2. COMPREHENSIVE ANALYTICS REPORT EXPORT
// ==========================================
export const exportAnalyticsPDF = ({
  analyticsData = {},
  revenueByClient = [],
  agingReport = {},
  currencySymbol = "₹",
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [15, 157, 148];
  const textColor = [30, 41, 59];
  const mutedColor = [100, 116, 139];

  // 1. BRANDING & HEADER
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text("AutoBillr", 14, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text("COMPREHENSIVE ANALYTICS & REVENUE PERFORMANCE", 14, 26);

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  doc.text(`Generated: ${today}`, 196, 20, { align: "right" });
  doc.text("Period: All Time", 196, 26, { align: "right" });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 31, 196, 31);

  // 2. ANALYTICS HIGHLIGHTS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.text("Analytics Highlights", 14, 40);

  const summary = [
    [
      "Total Collected",
      formatCurrencyPDF(analyticsData.totalCollected || 0, currencySymbol),
      "Collection Rate",
      `${analyticsData.collectionRate || 0}%`,
    ],
    [
      "Outstanding Balance",
      formatCurrencyPDF(analyticsData.outstandingBalance || 0, currencySymbol),
      "Active Invoices",
      `${analyticsData.activeInvoicesCount || 0}`,
    ],
    [
      "Average Invoice Value",
      formatCurrencyPDF(analyticsData.avgInvoiceValue || 0, currencySymbol),
      "Payment Speed",
      `${analyticsData.avgPaymentDays || 14} Days`,
    ],
  ];

  autoTable(doc, {
    startY: 44,
    body: summary,
    theme: "plain",
    styles: {
      fontSize: 9.5,
      cellPadding: 3,
      textColor: textColor,
    },
    columnStyles: {
      0: { fontStyle: "bold", textColor: mutedColor, cellWidth: 42 },
      1: { fontStyle: "bold", textColor: primaryColor, cellWidth: 46 },
      2: { fontStyle: "bold", textColor: mutedColor, cellWidth: 38 },
      3: { fontStyle: "bold", textColor: textColor, cellWidth: 46 },
    },
  });

  // 3. TOP VALUABLE CLIENTS BREAKDOWN (Fills the page cleanly)
  const clientStartY = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.text("Top Valuable Clients Breakdown", 14, clientStartY);

  const clientRows =
    revenueByClient.length > 0
      ? revenueByClient.map((c) => [
          c.name || "Client",
          formatCurrencyPDF(c.amount || 0, currencySymbol),
          `${c.percentage || 0}%`,
          analyticsData.totalCollected > 0 ? "PAID" : "PENDING",
        ])
      : [["No client revenue records available", "—", "—", "—"]];

  autoTable(doc, {
    startY: clientStartY + 4,
    head: [["Client Name", "Invoiced Amount", "Revenue Share", "Status"]],
    body: clientRows,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: textColor,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // 4. AGING SUMMARY
  if (agingReport && Object.keys(agingReport).length > 0) {
    const agingStartY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...textColor);
    doc.text("Aging Balance Summary", 14, agingStartY);

    const agingRows = [
      ["Current (0-30 Days)", formatCurrencyPDF(agingReport.current || 0, currencySymbol)],
      ["Overdue (30-60 Days)", formatCurrencyPDF(agingReport.thirtyToSixty || 0, currencySymbol)],
      ["Overdue (60+ Days)", formatCurrencyPDF(agingReport.sixtyPlus || 0, currencySymbol)],
    ];

    autoTable(doc, {
      startY: agingStartY + 4,
      head: [["Aging Category", "Outstanding Amount"]],
      body: agingRows,
      theme: "striped",
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        textColor: textColor,
      },
    });
  }

  // 5. FOOTER
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(
      `AutoBillr • Comprehensive Analytics Report • Page ${i} of ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }

  doc.save(`AutoBillr-Analytics-Report-${Date.now()}.pdf`);
};