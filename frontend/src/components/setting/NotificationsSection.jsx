import Card from "../ui/Card";
import Toggle from "./Toggle";
import SectionActions from "./SectionActions";

const NOTIFICATION_ROWS = [
  {
    id: "paid",
    title: "Invoice paid",
    sub: "$10K+ invoices",
    email: true,
    push: true,
    slack: true,
  },
  {
    id: "overdue",
    title: "Invoice overdue",
    sub: "Any amount",
    email: true,
    push: false,
    slack: true,
  },
  {
    id: "errors",
    title: "Workflow errors",
    sub: "Immediate",
    email: true,
    push: true,
    slack: true,
  },
  {
    id: "mentions",
    title: "Team mentions",
    sub: "Real-time",
    email: true,
    push: true,
    slack: true,
  },
  {
    id: "weekly",
    title: "Weekly summary",
    sub: "Every Monday 9am",
    email: true,
    push: false,
    slack: false,
  },
];

export default function NotificationsSection({
  notif,
  setNotif,
  onDiscard,
  onSave,
}) {
  return (
    <>
      <Card padding="p-6">
        <div className="mb-5 pb-4 border-b border-border-light">
          <div className="text-base font-bold text-text">Notifications</div>
          <div className="text-xs text-text-muted mt-1">
            When and how to ping you
          </div>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-[2fr_repeat(3,_70px)] gap-3 text-[10px] font-bold text-text-light uppercase tracking-widest border-b border-border-light pb-2">
            <span />
            <span className="text-center">Email</span>
            <span className="text-center">Push</span>
            <span className="text-center">Slack</span>
          </div>

          {NOTIFICATION_ROWS.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[2fr_repeat(3,_70px)] gap-3 py-3 border-b border-border-light items-center"
            >
              <div>
                <div className="text-[13px] font-bold text-text">{row.title}</div>
                <div className="text-[11px] text-text-muted">{row.sub}</div>
              </div>
              {["email", "push", "slack"].map((channel) => (
                <div key={channel} className="grid place-items-center">
                  <Toggle
                    size="sm"
                    enabled={notif[row.id]?.[channel]}
                    onToggle={() =>
                      setNotif((p) => ({
                        ...p,
                        [row.id]: {
                          ...p[row.id],
                          [channel]: !p[row.id][channel],
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
      <SectionActions onDiscard={onDiscard} onSave={onSave} />
    </>
  );
}