import Card from "../ui/Card";
import Badge from "../ui/Badge";
import SectionActions from "./SectionActions";

const PAYMENT_METHODS = [
  {
    id: "stripe",
    name: "Stripe (Cards + ACH)",
    sub: "$390K processed this year",
    icon: "credit_card",
    iconBg: "bg-indigo-100 text-indigo-600",
    status: "Connected",
    statusVariant: "paid",
  },
  {
    id: "plaid",
    name: "Plaid Bank Transfers",
    sub: "12 bank accounts linked",
    icon: "account_balance",
    iconBg: "bg-primary-soft text-primary",
    status: "Connected",
    statusVariant: "paid",
  },
  {
    id: "paypal",
    name: "PayPal",
    sub: "$18K processed this year",
    icon: "payments",
    iconBg: "bg-warning-soft text-warning",
    status: "Connected",
    statusVariant: "paid",
  },
  {
    id: "apple",
    name: "Apple Pay & Google Pay",
    sub: "Enable to allow mobile payment",
    icon: "phone_iphone",
    iconBg: "bg-surface-secondary text-text-muted",
    status: "Disabled",
    statusVariant: "default",
  },
  {
    id: "wire",
    name: "Wire Transfer",
    sub: "Account details printed on invoice",
    icon: "swap_horiz",
    iconBg: "bg-info-soft text-info",
    status: "Manual",
    statusVariant: "scheduled",
  },
];

export default function PaymentMethodsSection({ onDiscard, onSave }) {
  return (
    <>
      <Card padding="p-6">
        <div className="mb-5 pb-4 border-b border-border-light">
          <div className="text-base font-bold text-text">Payment methods</div>
          <div className="text-xs text-text-muted mt-1">
            Configure how you accept payments from clients
          </div>
        </div>

        <div className="space-y-3">
          {PAYMENT_METHODS.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-4 p-4 bg-surface-secondary rounded-xl"
            >
              <div
                className={`w-10 h-10 rounded-lg grid place-items-center ${m.iconBg}`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {m.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-text">{m.name}</div>
                <div className="text-[11.5px] text-text-muted">{m.sub}</div>
              </div>
              <Badge label={m.status} variant={m.statusVariant} />
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-bold text-primary hover:bg-surface rounded-lg"
              >
                Configure
              </button>
            </div>
          ))}
        </div>
      </Card>
      <SectionActions onDiscard={onDiscard} onSave={onSave} />
    </>
  );
}