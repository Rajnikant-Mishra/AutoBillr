import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import SectionActions from "./SectionActions";

const labelClass =
  "block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5";

export default function ApiWebhooksSection({ onDiscard, onSave }) {
  return (
    <>
      <Card padding="p-6">
        <div className="mb-5 pb-4 border-b border-border-light">
          <div className="text-base font-bold text-text">
            API keys & webhooks
          </div>
          <div className="text-xs text-text-muted mt-1">
            Programmatic access to your AutoBillr workspace
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Live API key</label>
            <div className="flex gap-2">
              <input
                readOnly
                value="sk_live_4f8a••••••••••••2c1e"
                className="flex-1 h-11 px-3 border border-border rounded-lg text-sm font-mono bg-surface-secondary text-text"
              />
              <Button variant="secondary" size="sm">
                Copy
              </Button>
              <Button variant="secondary" size="sm" className="text-danger">
                Rotate
              </Button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Test API key</label>
            <div className="flex gap-2">
              <input
                readOnly
                value="sk_test_a1b2••••••••••••5e8d"
                className="flex-1 h-11 px-3 border border-border rounded-lg text-sm font-mono bg-surface-secondary text-text"
              />
              <Button variant="secondary" size="sm">
                Copy
              </Button>
            </div>
          </div>

          <div className="border-t border-border-light pt-5">
            <div className="text-[11.5px] font-semibold text-text-secondary mb-3 flex items-center justify-between">
              <span>Webhook endpoints</span>
              <button
                type="button"
                className="text-primary hover:bg-primary-soft px-2 py-1 rounded text-xs flex items-center gap-1 font-bold"
              >
                <span className="material-symbols-outlined text-[12px]">add</span>
                Add endpoint
              </button>
            </div>

            <div className="space-y-2">
              {[
                {
                  url: "https://api.autobillr.io/webhooks/payments",
                  events: "payment.* · 4 events",
                },
                {
                  url: "https://hooks.slack.com/services/T0/B0",
                  events: "invoice.overdue",
                },
              ].map((wh) => (
                <div key={wh.url} className="p-3 border border-border rounded-lg">
                  <div className="text-[12px] font-mono text-text-secondary">
                    {wh.url}
                  </div>
                  <div className="flex justify-between mt-2 text-[11px]">
                    <span className="text-text-muted">{wh.events}</span>
                    <Badge label="active" variant="paid" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      <SectionActions onDiscard={onDiscard} onSave={onSave} />
    </>
  );
}