import React, { useMemo } from "react";
import RightDrawer from "../layout/RightDrawer";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import StatCard from "../ui/StatCard";

const activities = [
  {
    icon: "payments",
    color: "bg-teal-50 text-teal-600",
    title: "Paid INV-8821 · $2,450",
    date: "2 days ago",
  },
  {
    icon: "send",
    color: "bg-indigo-50 text-indigo-600",
    title: "Reminder email sent",
    date: "5 days ago",
  },
  {
    icon: "edit",
    color: "bg-slate-100 text-slate-600",
    title: "Contact info updated",
    date: "Last week",
  },
  {
    icon: "person_add",
    color: "bg-amber-50 text-amber-600",
    title: "Onboarded by Admin",
    date: "Mar 14, 2024",
  },
];

const BillingRow = ({ label, value, valueClass = "text-slate-900" }) => (
  <div className="flex justify-between items-center text-[13px]">
    <span className="text-slate-500">{label}</span>
    <span className={`font-bold tabular ${valueClass}`}>{value}</span>
  </div>
);

const MiniStat = ({ label, value, valueClass = "text-slate-900" }) => (
  <div className="bg-slate-50 rounded-xl p-3">
    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
      {label}
    </div>

    <div className={`mt-1 text-lg font-bold ${valueClass}`}>{value}</div>
  </div>
);

function ActivityItem({ activity }) {
  return (
    <div className="flex gap-3 items-start">
      <div
        className={`w-8 h-8 rounded-full grid place-items-center ${activity.color}`}
      >
        <span className="material-symbols-outlined text-[16px]">
          {activity.icon}
        </span>
      </div>

      <div className="flex-1">
        <div className="text-[13px] font-semibold text-slate-900">
          {activity.title}
        </div>

        <div className="text-[11px] text-slate-400">{activity.date}</div>
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
  if (!client) return null;
  const initials = client.initials || "--";
  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Client Details"
      width="max-w-lg"
    >
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-br from-teal-50 to-white">
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl grid place-items-center font-bold ${
              client?.color || "bg-amber-100 text-amber-700"
            }`}
          >
            {initials}
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">{client.name}</h2>

            <p className="text-sm text-slate-500">{client.email}</p>

            <Badge
              label={client.status}
              variant={client.status}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* STATS */}
        <div className="grid grid-cols-3 gap-3">
          <MiniStat
    label="MRR"
    value={format(client?.mrr || 0)}
  />

          <MiniStat label="LTV" value={format(client?.ltv || 38000)} />

          <MiniStat
            label="Health"
            value={client?.health || "72"}
            valueClass="text-teal-600"
          />
        </div>

        {/* BILLING */}
        <div>
          <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3">
            Billing
          </h4>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
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
              value={client?.automation?.autoCharge ? "Enabled" : "Disabled"}
              valueClass="text-teal-600"
            />
          </div>
        </div>

        {/* ACTIVITY */}
        <div>
          <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3">
            Recent Activity
          </h4>

          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityItem
                key={`${activity.title}-${activity.date}`}
                activity={activity}
              />
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            onClose();
            onEdit(client);
          }}
        >
          Edit
        </Button>

        <Button
          icon={
            <span className="material-symbols-outlined text-[16px]">add</span>
          }
        >
          New Invoice
        </Button>
      </div>
    </RightDrawer>
  );
}
