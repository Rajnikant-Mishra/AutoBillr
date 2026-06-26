import Card from "../ui/Card";
import Badge from "../ui/Badge";
import ScheduleItem from "./ScheduleItem";
import useCurrency from "../../hooks/useCurrency";
export default function SchedulePreview({
  previewData,
}) {
  const {
    frequency,
    amount,
    clientName,
    projectName,
    active,
  } = previewData;
const { format, currencySymbol } = useCurrency();
  const generateSchedules = () => {
    const schedules = [];

    const currentDate = new Date();

    for (let i = 0; i < 4; i++) {
      const nextDate = new Date(
        currentDate
      );

      switch (frequency) {
        case "Monthly":
          nextDate.setMonth(
            currentDate.getMonth() + i
          );
          break;

        case "Quarterly":
          nextDate.setMonth(
            currentDate.getMonth() +
              i * 3
          );
          break;

        case "Annual":
          nextDate.setFullYear(
            currentDate.getFullYear() +
              i
          );
          break;

        default:
          nextDate.setMonth(
            currentDate.getMonth() + i
          );
      }

      schedules.push({
  date: nextDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
  invoice: projectName || "Recurring Invoice",
  amount: amount || 0,
  upcoming: i === 0,
});
    }

    return schedules;
  };

  const dummySchedules = [
    {
      date: "01 Jul 2026",
      invoice:
        "Enterprise Retainer",
      amount: format(12450),
      upcoming: true,
    },
    {
      date: "01 Oct 2026",
      invoice:
        "Enterprise Retainer",
      amount: format(12450),
    },
    {
      date: "01 Jan 2027",
      invoice:
        "Enterprise Retainer",
      amount: format(12450),
    },
    {
      date: "01 Apr 2027",
      invoice:
        "Enterprise Retainer",
     amount: format(12450),
    },
  ];

  const schedules = generateSchedules();

  const downloadSchedulePDF = () => {
    const printWindow =
      window.open("", "_blank");

    printWindow.document.write(`
      <html>
      <head>
      <title>Recurring Billing Schedule</title>

      <style>
      body{
        font-family:Arial;
        padding:40px;
      }

      h1{
        margin-bottom:10px;
      }

      table{
        width:100%;
        border-collapse:collapse;
        margin-top:20px;
      }

      th,td{
        border:1px solid #ddd;
        padding:12px;
        text-align:left;
      }

      th{
        background:#f8fafc;
      }
      </style>
      </head>

      <body>

      <h1>Recurring Billing Schedule</h1>

      <p>
      <strong>Client:</strong>
      ${
        clientName ||
        "Not Selected"
      }
      </p>

      <p>
      <strong>Project:</strong>
      ${
        projectName ||
        "Not Selected"
      }
      </p>

      <p>
      <strong>Frequency:</strong>
      ${frequency}
      </p>

      <p>
      <strong>Amount:</strong>
      ${format(amount || 0)}
      </p>

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
            <td>${item.amount}</td>
          </tr>
        `
        )
        .join("")}

      </tbody>
      </table>

      <script>
      window.print();
      </script>

      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Card
      padding="p-0"
      className="h-full flex flex-col"
    >
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 grid place-items-center">
            <span className="material-symbols-outlined">
              calendar_month
            </span>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Next Invoice Dates
            </h3>

            <p className="text-[11px] text-slate-500">
              {active
                ? clientName
                : "Activate automation to generate live schedule"}
            </p>
          </div>
        </div>

        <Badge
          label={
            active
              ? frequency
              : "Preview"
          }
          variant="scheduled"
        />
      </div>

      <div className="flex-1 p-6">
  {!active ? (
    <div className="h-full flex items-center justify-center">
      <div className="max-w-sm text-center border border-dashed border-slate-300 rounded-2xl p-8 bg-slate-50">
        <div className="w-16 h-16 mx-auto rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">
            sync
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2">
          No Recurring Billing Created
        </h3>

        <p className="text-sm text-slate-500">
          Configure client, project,
          frequency and amount, then
          click
          <strong>
            {" "}
            Activate Automation Engine
          </strong>
          .
        </p>
      </div>
    </div>
  ) : (
    <div className="relative">
      <div className="absolute left-[35px] top-8 bottom-8 w-px bg-slate-100" />

      <div className="space-y-6">
        {schedules.map(
          (item, index) => (
            <ScheduleItem
              key={index}
              {...item}
            />
          )
        )}
      </div>
    </div>
  )}
</div>

      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-teal-600 text-[16px]">
            info
          </span>

          <span className="text-[11px] font-medium text-slate-600">
            Automatic adjustments for weekends &
            holidays enabled.
          </span>
        </div>

     <button
  disabled={!active}
  onClick={downloadSchedulePDF}
  className={`w-full py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${
    active
      ? "text-teal-600 hover:bg-teal-50"
      : "text-slate-400 cursor-not-allowed"
  }`}
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