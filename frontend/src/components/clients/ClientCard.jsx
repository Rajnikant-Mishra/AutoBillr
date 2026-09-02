import Card from "../ui/Card";
import Badge from "../ui/Badge";
import useCurrency from "../../hooks/useCurrency";

export default function ClientCard({ client, onClick }) {
  const { format } = useCurrency();

  if (!client) return null;

  const {
    name = "Unknown Client",
    email = "No email",
    initials = "—",
    status = "inactive",
    billing = "Monthly",
    mrr = 0,
    nextInvoice,
    color = "bg-primary-soft text-primary-dark",
  } = client;

  return (
    <Card
      hover
      className="cursor-pointer group"
      onClick={() => onClick?.(client)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`
            w-11 h-11 rounded-full
            grid place-items-center
            font-bold text-xs shrink-0
            ${color}
          `}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text truncate">{name}</h3>
          <p className="text-[11px] text-text-muted truncate">{email}</p>
        </div>

        <Badge label={status} variant={status} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 p-3 rounded-xl bg-surface-secondary mb-4">
        <div>
          <p className="text-[10px] font-bold text-text-light uppercase tracking-wider">
            MRR
          </p>
          <p className="text-sm font-bold text-text tabular-nums">
            {format(mrr)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold text-text-light uppercase tracking-wider">
            Billing
          </p>
          <p className="text-sm font-bold text-text">{billing}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold text-text-light uppercase tracking-wider">
            Health
          </p>
          <p className="text-sm font-bold text-text">76</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] gap-2">
        <span className="text-text-muted truncate">
          Next Invoice: {nextInvoice || "Pending"}
        </span>

        <span className="font-semibold text-primary shrink-0 group-hover:text-primary-hover transition-colors duration-fast">
          View Details →
        </span>
      </div>
    </Card>
  );
}