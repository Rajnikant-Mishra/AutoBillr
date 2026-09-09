// pages/Analytics.jsx

import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

export default function Analytics() {
  const months = [
    { label: "Jan", projected: 60, actual: 55 },
    { label: "Feb", projected: 70, actual: 75 },
    { label: "Mar", projected: 80, actual: 82 },
    { label: "Apr", projected: 65, actual: 62 },
    { label: "May", projected: 90, actual: 94 },
    { label: "Jun", projected: 85, actual: 80 },
    { label: "Jul", projected: 78, actual: 84 },
    { label: "Aug", projected: 92, actual: 96 },
  ];

  const clientRevenue = [
    { name: "Enterprise A", amount: "$240k", color: "var(--color-primary)" },
    { name: "Global Tech", amount: "$185k", color: "var(--color-info)" },
    { name: "Health Plus", amount: "$120k", color: "var(--color-warning)" },
    { name: "Others", amount: "$112k", color: "var(--color-border-dark)" },
  ];

  const aging = [
    {
      label: "Overdue 30 Days",
      amount: "$45,200",
      width: "65%",
      bar: "var(--color-primary)",
    },
    {
      label: "Overdue 60 Days",
      amount: "$12,800",
      width: "20%",
      bar: "var(--color-warning)",
    },
    {
      label: "Overdue 90+ Days",
      amount: "$4,200",
      width: "8%",
      bar: "var(--color-danger)",
    },
  ];

  const topClients = [
    {
      initials: "NL",
      name: "Nexus Labs",
      bg: "var(--color-primary-soft)",
      text: "var(--color-primary)",
      invoiced: "$84,200",
      paid: "$84,200",
      status: "paid",
    },
    {
      initials: "SV",
      name: "Sky Vista Co.",
      bg: "var(--color-info-soft)",
      text: "var(--color-info)",
      invoiced: "$62,150",
      paid: "$58,000",
      status: "pending",
    },
    {
      initials: "FM",
      name: "Flux Media",
      bg: "var(--color-danger-soft)",
      text: "var(--color-danger)",
      invoiced: "$55,000",
      paid: "$55,000",
      status: "paid",
    },
    {
      initials: "AR",
      name: "Apex Robotics",
      bg: "var(--color-warning-soft)",
      text: "var(--color-warning)",
      invoiced: "$42,100",
      paid: "$42,100",
      status: "paid",
    },
    {
      initials: "UE",
      name: "Urban Edge",
      bg: "var(--color-primary-soft)",
      text: "var(--color-primary)",
      invoiced: "$38,500",
      paid: "$28,500",
      status: "pending",
    },
  ];

  return (
<main className="flex-1 pt-2 pb-12 max-w-[1600px] mx-auto w-full scroll-host">
      <div className="page-in">
        {/* ========== HEADER ========== */}
        <SectionHeader
          title="Advanced Analytics"
          description="Real-time billing performance and revenue forecasts."
          secondaryAction={{
            label: "Last 90 Days",
            variant: "secondary",
            icon: "calendar_today",
            onClick: () => {},
          }}
          primaryAction={{
            label: "Export Report",
            variant: "primary",
            icon: "download",
            onClick: () => {},
          }}
        />

        {/* Filters row (extra controls) */}
        <div className="flex items-center gap-2 flex-wrap -mt-4 mb-8">
          <div className="bg-surface px-3.5 py-2 rounded-lg border border-border flex items-center gap-2 text-sm">
            <span
              className="material-symbols-outlined text-text-light"
              style={{ fontSize: 16 }}
            >
              filter_alt
            </span>
            <select className="border-0 bg-transparent font-semibold text-text focus:ring-0 outline-none cursor-pointer">
              <option>All Clients</option>
              <option>Enterprise</option>
              <option>SME Segment</option>
            </select>
          </div>
        </div>

        {/* ========== KPI CARDS ========== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Invoiced"
            value="$1,284,500"
            icon="payments"
            iconColor="text-primary"
            badge="+12.4%"
            badgeColor="bg-primary-soft text-primary"
            variant="dashboard"
          />

          <StatCard
            title="Collection Rate"
            value="94.8%"
            icon="analytics"
            iconColor="text-info"
            badge="98.2%"
            badgeColor="bg-primary-soft text-primary"
            variant="dashboard"
          />

          <StatCard
            title="Avg. Days to Pay"
            value="18 days"
            icon="schedule"
            iconColor="text-warning"
            change="+2 days"
            changeColor="text-danger"
            variant="dashboard"
          />

          <StatCard
            title="Churn Rate"
            value="2.1%"
            icon="trending_down"
            iconColor="text-danger"
            badge="−0.4%"
            badgeColor="bg-primary-soft text-primary"
            variant="dashboard"
          />
        </div>

        {/* ========== CHARTS ROW ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Revenue vs Projections */}
          <Card
            title="Revenue vs. Projections"
            className="lg:col-span-2"
            action={
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  />
                  <span className="text-[11.5px] font-semibold text-text-muted">
                    Actual
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: "var(--color-border)" }}
                  />
                  <span className="text-[11.5px] font-semibold text-text-muted">
                    Projected
                  </span>
                </div>
              </div>
            }
          >
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {months.map((m) => (
                <div
                  key={m.label}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div
                      className="w-full rounded-t-sm transition"
                      style={{
                        height: `${m.projected}%`,
                        backgroundColor: "var(--color-surface-secondary)",
                      }}
                    />
                    <div
                      className="w-full rounded-t-sm transition group-hover:opacity-90"
                      style={{
                        height: `${m.actual}%`,
                        backgroundColor: "var(--color-primary)",
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-text-light uppercase">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Revenue by Client */}
          <Card title="Revenue by Client">
            <div className="flex-1 flex items-center justify-center relative min-h-[180px]">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle
                  cx="90"
                  cy="90"
                  r="74"
                  stroke="var(--color-border)"
                  strokeWidth="18"
                  fill="none"
                />
                <circle
                  cx="90"
                  cy="90"
                  r="74"
                  stroke="var(--color-primary)"
                  strokeWidth="18"
                  fill="none"
                  strokeDasharray="195.28 464.96"
                  strokeLinecap="round"
                  transform="rotate(-90 90 90)"
                />
                <circle
                  cx="90"
                  cy="90"
                  r="74"
                  stroke="var(--color-info)"
                  strokeWidth="18"
                  fill="none"
                  strokeDasharray="130.19 464.96"
                  strokeDashoffset="-195.28"
                  strokeLinecap="round"
                  transform="rotate(-90 90 90)"
                />
                <circle
                  cx="90"
                  cy="90"
                  r="74"
                  stroke="var(--color-warning)"
                  strokeWidth="18"
                  fill="none"
                  strokeDasharray="83.69 464.96"
                  strokeDashoffset="-325.47"
                  strokeLinecap="round"
                  transform="rotate(-90 90 90)"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-[11px] text-text-muted font-medium">
                  Top 5
                </div>
                <div className="text-2xl font-bold text-text tabular-nums">
                  62%
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-2.5 text-sm">
              {clientRevenue.map((c) => (
                <div key={c.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-text-muted">{c.name}</span>
                  </div>
                  <span className="font-bold text-text tabular-nums">
                    {c.amount}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ========== AGING + TOP CLIENTS ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Aging Report */}
          <Card
            title="Aging Report"
            action={
              <span
                className="material-symbols-outlined text-text-light"
                style={{ fontSize: 18 }}
              >
                info
              </span>
            }
          >
            <div className="space-y-5">
              {aging.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-[11px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">
                    <span>{item.label}</span>
                    <span className="text-text tabular-nums">{item.amount}</span>
                  </div>
                  <div
                    className="h-2 w-full rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--color-surface-secondary)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: item.width,
                        backgroundColor: item.bar,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              className="mt-10 rounded-xl p-4 flex items-start gap-3"
              style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
              <div
                className="w-9 h-9 rounded-full grid place-items-center shadow-sm flex-none"
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-primary)",
                }}
              >
                <span
                  className="material-symbols-outlined mi-fill"
                  style={{ fontSize: 18 }}
                >
                  auto_awesome
                </span>
              </div>
              <p className="text-[11.5px] text-text-muted leading-relaxed">
                <b className="text-text block mb-0.5">AI Suggestion</b>
                Send follow-up reminders to 12 clients in the 30-day bracket.
                Average response rate:{" "}
                <b style={{ color: "var(--color-primary)" }}>68%</b>.
              </p>
            </div>
          </Card>

          {/* Top Valuable Clients */}
          <Card
            className="lg:col-span-2 !p-0 overflow-hidden"
            padding="p-0"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h4 className="text-lg font-bold text-text">
                Top Valuable Clients{" "}
                <span className="text-text-light font-normal ml-2 text-sm">
                  Q3 Performance
                </span>
              </h4>
              <button
                type="button"
                className="text-primary font-semibold text-xs hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  style={{ backgroundColor: "var(--color-surface-secondary)" }}
                >
                  <tr>
                    <th className="px-6 py-3 text-[10.5px] font-bold text-text-muted uppercase tracking-widest text-left">
                      Client
                    </th>
                    <th className="px-6 py-3 text-[10.5px] font-bold text-text-muted uppercase tracking-widest text-right">
                      Invoiced
                    </th>
                    <th className="px-6 py-3 text-[10.5px] font-bold text-text-muted uppercase tracking-widest text-right">
                      Paid
                    </th>
                    <th className="px-6 py-3 text-[10.5px] font-bold text-text-muted uppercase tracking-widest">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topClients.map((client) => (
                    <tr
                      key={client.name}
                      className="hover:bg-surface-hover transition"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded grid place-items-center font-bold text-[10px]"
                            style={{
                              backgroundColor: client.bg,
                              color: client.text,
                            }}
                          >
                            {client.initials}
                          </div>
                          <span className="text-sm font-medium text-text">
                            {client.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm font-medium text-text tabular-nums">
                        {client.invoiced}
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm font-medium text-text tabular-nums">
                        {client.paid}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge
                          label={client.status}
                          variant={
                            client.status === "paid" ? "paid" : "pending"
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}