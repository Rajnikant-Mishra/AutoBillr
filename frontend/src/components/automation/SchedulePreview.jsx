import Card from "../ui/Card";
import Badge from "../ui/Badge";
import ScheduleItem from "./ScheduleItem";
import useCurrency from "../../hooks/useCurrency";

export default function SchedulePreview({ previewData }) {
  const { frequency, amount, clientName, projectName, active } = previewData;
  const { format } = useCurrency();

  const generateSchedules = () => {
    const schedules = [];
    // Start from a fixed “next” date so the preview looks like the design
    const base = new Date();
    // Snap to first of next quarter-ish for nicer demo dates
    base.setDate(1);
    if (base.getMonth() % 3 !== 0) {
      base.setMonth(base.getMonth() + (3 - (base.getMonth() % 3)));
    }

    for (let i = 0; i < 4; i++) {
      const nextDate = new Date(base);

      switch (frequency) {
        case "Monthly":
          nextDate.setMonth(base.getMonth() + i);
          break;
        case "Quarterly":
          nextDate.setMonth(base.getMonth() + i * 3);
          break;
        case "Annual":
          nextDate.setFullYear(base.getFullYear() + i);
          break;
        default:
          nextDate.setMonth(base.getMonth() + i);
      }

      const quarterLabel =
        frequency === "Quarterly"
          ? `Q${Math.floor(nextDate.getMonth() / 3) + 1} ${nextDate.getFullYear()} Retainer`
          : projectName || "Recurring Invoice";

      schedules.push({
        date: nextDate.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        invoice:
          i === 0
            ? `INV-${8829 + i}-RECUR`
            : quarterLabel,
        amount: amount || 12450,
        upcoming: i === 0,
      });
    }

    return schedules;
  };

  const schedules = generateSchedules();

  const downloadSchedulePDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
      <head>
        <title>Recurring Billing Schedule</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #0f172a; }
          h1 { margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
          th { background: #f8fafc; }
        </style>
      </head>
      <body>
        <h1>Recurring Billing Schedule</h1>
        <p><strong>Client:</strong> ${clientName || "Not Selected"}</p>
        <p><strong>Project:</strong> ${projectName || "Not Selected"}</p>
        <p><strong>Frequency:</strong> ${frequency}</p>
        <p><strong>Amount:</strong> ${format(amount || 0)}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${schedules
              .map(
                (item) => `
              <tr>
                <td>${item.date}</td>
                <td>${item.invoice}</td>
                <td>${format(Number(item.amount || 0))}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <script>window.print();</script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Card padding="p-0" className="h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-border-light flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary grid place-items-center shrink-0">
            <span className="material-symbols-outlined">calendar_month</span>
          </div>

          <div className="min-w-0">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Next Invoice Dates
            </h3>
            <p className="text-[11px] text-text-muted truncate">
              {clientName || "Preview schedule"}
            </p>
          </div>
        </div>

        <Badge
          label={active ? frequency : "Preview"}
          variant="scheduled"
        />
      </div>

      {/* Body — ALWAYS show the dummy / live invoice flow */}
      <div className="flex-1 p-6">
        <div className="relative">
          <div className="absolute left-[35px] top-8 bottom-8 w-px bg-border-light" />

          <div className="space-y-6">
            {schedules.map((item, index) => (
              <ScheduleItem key={`${item.date}-${index}`} {...item} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-surface-secondary border-t border-border-light">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary text-[16px]">
            info
          </span>
          <span className="text-[11px] font-medium text-text-secondary">
            Automatic adjustments for weekends & holidays enabled.
          </span>
        </div>

        <button
          type="button"
          onClick={downloadSchedulePDF}
          className="
            w-full py-2 text-xs font-bold rounded-lg
            flex items-center justify-center gap-1.5
            transition-colors duration-fast
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25
            text-primary hover:bg-primary-soft
          "
        >
          Download Schedule PDF
          <span className="material-symbols-outlined text-[14px]">
            download
          </span>
        </button>
      </div>
    </Card>
  );
}