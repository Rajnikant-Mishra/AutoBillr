import React from "react";
import RightDrawer from "../layout/RightDrawer";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import useCurrency from "../../hooks/useCurrency";

const ACTIVITIES = [
  {
    icon: "payments",
    color: "bg-success-soft text-success",
    title: "Paid INV-8821 · $2,450",
    date: "2 days ago",
  },
  {
    icon: "send",
    color: "bg-info-soft text-info",
    title: "Reminder email sent",
    date: "5 days ago",
  },
  {
    icon: "edit",
    color: "bg-surface-secondary text-text-secondary",
    title: "Contact info updated",
    date: "Last week",
  },
  {
    icon: "person_add",
    color: "bg-warning-soft text-warning",
    title: "Onboarded by Admin",
    date: "Mar 14, 2024",
  },
];

const BillingRow = ({ label, value, valueClass = "text-text" }) => (
  <div className="flex justify-between items-center text-[13px]">
    <span className="text-text-muted">{label}</span>
    <span className={`font-bold tabular-nums ${valueClass}`}>{value}</span>
  </div>
);

const MiniStat = ({ label, value, valueClass = "text-text" }) => (
  <div className="bg-surface-secondary rounded-xl p-3">
    <div className="text-[10px] font-bold uppercase tracking-wider text-text-light">
      {label}
    </div>
    <div className={`mt-1 text-lg font-bold ${valueClass}`}>{value}</div>
  </div>
);

function ActivityItem({ activity }) {
  return (
    <div className="flex gap-3 items-start">
      <div
        className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${activity.color}`}
      >
        <span className="material-symbols-outlined text-[16px]">
          {activity.icon}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-text">
          {activity.title}
        </div>
        <div className="text-[11px] text-text-light">{activity.date}</div>
      </div>
    </div>
  );
}

export default function ClientDetailDrawer({
  isOpen,
  onClose,
  client,
  onEdit,
}) {
  const { format } = useCurrency();

  if (!client) return null;

  const initials = client.initials || "—";

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Client Details"
      width="max-w-lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              onClose();
              onEdit?.(client);
            }}
          >
            Edit
          </Button>

          <Button
            icon={
              <span className="material-symbols-outlined text-[16px]">
                add
              </span>
            }
          >
            New Invoice
          </Button>
        </div>
      }
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-border-light bg-gradient-to-br from-primary-soft to-surface -mx-6 -mt-6 mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`
              w-14 h-14 rounded-2xl grid place-items-center
              font-bold text-text-inverse shrink-0
              ${client?.color || "bg-warning-soft text-warning"}
            `}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-text truncate">
              {client.name}
            </h2>
            <p className="text-sm text-text-muted truncate">{client.email}</p>
            <Badge
              label={client.status}
              variant={client.status}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="MRR" value={format(client?.mrr || 0)} />
          <MiniStat label="LTV" value={format(client?.ltv || 38000)} />
          <MiniStat
            label="Health"
            value={client?.health || "72"}
            valueClass="text-primary"
          />
        </div>

        {/* Billing */}
        <div>
          <h4 className="text-[11.5px] font-bold text-text-secondary uppercase tracking-widest mb-3">
            Billing
          </h4>

          <div className="bg-surface-secondary rounded-xl p-4 space-y-2">
            <BillingRow
              label="Frequency"
              value={client?.billing || "Monthly"}
            />
            <BillingRow
              label="Next Invoice"
              value={client?.nextInvoice || "—"}
            />
            <BillingRow
              label="Payment Terms"
              value={client?.paymentTerms || "Net 15"}
            />
            <BillingRow
              label="Auto Charge"
              value={
                client?.automation?.autoCharge ? "Enabled" : "Disabled"
              }
              valueClass="text-primary"
            />
          </div>
        </div>

        {/* Activity */}
        <div>
          <h4 className="text-[11.5px] font-bold text-text-secondary uppercase tracking-widest mb-3">
            Recent Activity
          </h4>

          <div className="space-y-3">
            {ACTIVITIES.map((activity) => (
              <ActivityItem
                key={`${activity.title}-${activity.date}`}
                activity={activity}
              />
            ))}
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}