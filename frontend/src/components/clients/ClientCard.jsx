import Card from "../ui/Card";
import Badge from "../ui/Badge";
import useCurrency from "../../hooks/useCurrency";
export default function ClientCard({ client, onClick }) {
  if (!client) return null;
  const { format } = useCurrency();
  const {
    name = "Unknown Client",
    email = "No email",
    initials = "--",
    status = "inactive",
    billing = "Monthly",
    mrr = 0,
    nextInvoice,
    color = "bg-teal-100 text-teal-700",
  } = client;

  const formattedMRR = format(mrr);

  return (
    <Card
      hover
      className="cursor-pointer"
      onClick={() => onClick?.(client)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-11 h-11 rounded-full grid place-items-center font-bold text-xs ${color}`}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 truncate">
            {name}
          </h3>

          <p className="text-[11px] text-slate-500 truncate">
            {email}
          </p>
        </div>

        <Badge
          label={status}
          variant={status}
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 p-3 rounded-xl  mb-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            MRR
          </p>

          <p className="text-sm font-bold text-slate-900">
            {formattedMRR}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            LTV
          </p>

          <p className="text-sm font-bold text-slate-900">
            {billing}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Health
          </p>

          <p className="text-sm font-bold text-slate-900">
            {'76'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500 truncate">
          Next Invoice: {nextInvoice || "Pending"}
        </span>

        <span className="font-semibold text-teal-600">
          View Details →
        </span>
      </div>
    </Card>
  );
}