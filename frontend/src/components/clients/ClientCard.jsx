// import Card from "../ui/Card";
// import Badge from "../ui/Badge";
// import useCurrency from "../../hooks/useCurrency";

// export default function ClientCard({ client, onClick }) {
//   const { format } = useCurrency();

//   if (!client) return null;

//   const {
//     name = "Unknown Client",
//     email = "No email",
//     initials = "—",
//     status = "inactive",
//     billing = "Monthly",
//     mrr = 0,
//     nextInvoice,
//     color = "bg-primary-soft text-primary-dark",
//   } = client;

//   return (
//     <Card
//       hover
//       className="cursor-pointer group"
//       onClick={() => onClick?.(client)}
//     >
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-4">
//         <div
//           className={`
//             w-11 h-11 rounded-full
//             grid place-items-center
//             font-bold text-xs shrink-0
//             ${color}
//           `}
//         >
//           {initials}
//         </div>

//         <div className="flex-1 min-w-0">
//           <h3 className="text-sm font-bold text-text truncate">{name}</h3>
//           <p className="text-[11px] text-text-muted truncate">{email}</p>
//         </div>

//         <Badge label={status} variant={status} />
//       </div>

//       {/* Metrics */}
//       <div className="grid grid-cols-3 gap-4 p-3 rounded-xl bg-surface-secondary mb-4">
//         <div>
//           <p className="text-[10px] font-bold text-text-light uppercase tracking-wider">
//             MRR
//           </p>
//           <p className="text-sm font-bold text-text tabular-nums">
//             {format(mrr)}
//           </p>
//         </div>

//         <div>
//           <p className="text-[10px] font-bold text-text-light uppercase tracking-wider">
//             Billing
//           </p>
//           <p className="text-sm font-bold text-text">{billing}</p>
//         </div>

//         <div>
//           <p className="text-[10px] font-bold text-text-light uppercase tracking-wider">
//             Health
//           </p>
//           <p className="text-sm font-bold text-text">76</p>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="flex items-center justify-between text-[11px] gap-2">
//         <span className="text-text-muted truncate">
//           Next Invoice: {nextInvoice || "Pending"}
//         </span>

//         <span className="font-semibold text-primary shrink-0 group-hover:text-primary-hover transition-colors duration-fast">
//           View Details →
//         </span>
//       </div>
//     </Card>
//   );
// }

import Card from "../ui/Card";
import useCurrency from "../../hooks/useCurrency";

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const getClientInitials = (client) =>
  client?.initials ||
  String(client?.name ?? "")
    .trim()
    .slice(0, 2)
    .toUpperCase() ||
  "CL";

const getStatusBadge = (status) => {
  switch (normalize(status)) {
    case "active":
      return "bg-primary-soft text-primary-dark border-primary/20";
    case "pending":
      return "bg-warning-soft text-warning border-warning/20";
    case "inactive":
      return "bg-surface-secondary text-text-muted border-border";
    default:
      return "bg-surface-secondary text-text-muted border-border";
  }
};

const getBillingBadge = (billing) => {
  switch (normalize(billing)) {
    case "monthly":
      return "bg-primary-soft text-primary-dark";
    case "annual":
      return "bg-surface-secondary text-text-secondary";
    case "quarterly":
      return "bg-info-soft text-info";
    default:
      return "bg-surface-secondary text-text-secondary";
  }
};

export default function ClientCard({ client, onClick }) {
  const { format } = useCurrency();

  if (!client) return null;

  const name = client?.name || "Unknown Client";
  const email = client?.email || "No email";
  const initials = getClientInitials(client);
  const status = client?.status || "inactive";
  const billing = client?.billing || "Monthly";
  const mrr = Number(client?.mrr) || 0;
  const nextInvoice = client?.nextInvoice;
  const color = client?.color || "bg-primary-soft text-primary-dark";

  return (
    <Card
      hover
      className="cursor-pointer group transition-all duration-200"
      onClick={() => onClick?.(client)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`
            w-11 h-11 rounded-full
            grid place-items-center
            font-bold text-xs shrink-0 border border-border
            ${color}
          `}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text truncate">{name}</h3>
          <p className="text-[11px] text-text-muted truncate">{email}</p>
        </div>

        <span
          className={`
            inline-flex items-center gap-1.5
            rounded-full px-2.5 py-1 border
            text-[10px] font-bold uppercase tracking-wider
            ${getStatusBadge(status)}
          `}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
          />
          {status}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-surface-secondary mb-4">
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
          <span
            className={`
              inline-block mt-0.5 rounded px-1.5 py-0.5
              text-xs font-semibold
              ${getBillingBadge(billing)}
            `}
          >
            {billing}
          </span>
        </div>

        <div>
          <p className="text-[10px] font-bold text-text-light uppercase tracking-wider">
            Health
          </p>
          <p className="text-sm font-bold text-text">
            {client?.health || 76}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] gap-2 pt-1 border-t border-border-light">
        <span className="text-text-muted truncate">
          Next: {nextInvoice || "Pending setup"}
        </span>

        <span className="font-semibold text-primary shrink-0 group-hover:text-primary-hover transition-colors">
          View Details →
        </span>
      </div>
    </Card>
  );
}