import Card from "../ui/Card";
import Badge from "../ui/Badge";
import SectionActions from "./SectionActions";

const INTEGRATIONS = [
  {
    id: "qb",
    initials: "QB",
    initialsBg: "bg-green-100 text-green-700",
    name: "QuickBooks Online",
    sub: "Two-way sync of invoices & payments",
    connected: true,
  },
  {
    id: "xero",
    initials: "Xe",
    initialsBg: "bg-sky-100 text-sky-700",
    name: "Xero",
    sub: "Cloud accounting integration",
    connected: false,
  },
  {
    id: "ns",
    initials: "NS",
    initialsBg: "bg-orange-100 text-orange-700",
    name: "NetSuite",
    sub: "Enterprise ERP — full bidirectional",
    connected: false,
  },
  {
    id: "sf",
    initials: "SF",
    initialsBg: "bg-blue-100 text-blue-700",
    name: "Salesforce",
    sub: "Sync clients & opportunities",
    connected: true,
  },
  {
    id: "hs",
    initials: "Hb",
    initialsBg: "bg-orange-100 text-orange-700",
    name: "HubSpot",
    sub: "Marketing + sales sync",
    connected: false,
  },
  {
    id: "slack",
    initials: "Sl",
    initialsBg: "bg-purple-100 text-purple-700",
    name: "Slack",
    sub: "Real-time alerts & notifications",
    connected: true,
  },
  {
    id: "zapier",
    initials: "Za",
    initialsBg: "bg-orange-100 text-orange-700",
    name: "Zapier",
    sub: "Connect to 5,000+ apps",
    connected: false,
  },
  {
    id: "snow",
    initials: "Sn",
    initialsBg: "bg-cyan-100 text-cyan-700",
    name: "Snowflake",
    sub: "Stream billing data to warehouse",
    connected: true,
  },
];

export default function IntegrationsSection({ onDiscard, onSave }) {
  return (
    <>
      <Card padding="p-6">
        <div className="mb-5 pb-4 border-b border-border-light">
          <div className="text-base font-bold text-text">Integrations</div>
          <div className="text-xs text-text-muted mt-1">
            Connect AutoBillr to your existing financial stack
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INTEGRATIONS.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border ${
                item.connected
                  ? "border-primary/30 bg-primary-soft/30"
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className={`w-10 h-10 rounded-lg grid place-items-center font-bold text-xs ${item.initialsBg}`}
                >
                  {item.initials}
                </div>
                <Badge
                  label={item.connected ? "Connected" : "Not connected"}
                  variant={item.connected ? "paid" : "default"}
                />
              </div>
              <div className="text-sm font-bold text-text mb-1">{item.name}</div>
              <div className="text-[11.5px] text-text-muted mb-3">{item.sub}</div>
              <button
                type="button"
                className={`w-full py-1.5 rounded-lg text-xs font-bold transition ${
                  item.connected
                    ? "bg-surface border border-border text-text-secondary hover:bg-surface-hover"
                    : "bg-primary text-white hover:bg-primary-hover"
                }`}
              >
                {item.connected ? "Manage" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </Card>
      <SectionActions onDiscard={onDiscard} onSave={onSave} />
    </>
  );
}