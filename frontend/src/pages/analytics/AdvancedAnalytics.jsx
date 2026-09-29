import { useState, useEffect } from "react";
import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import useCurrency from "../../hooks/useCurrency";

export default function Analytics() {
  const { formatCurrency, currencySymbol = "₹" } = useCurrency?.() || {};

  const formatMoney = (amount) => {
    const num = Number(amount) || 0;
    return formatCurrency
      ? formatCurrency(num)
      : `${currencySymbol}${num.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
  };

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    stats: {
      totalInvoiced: 0,
      totalCollected: 0,
      totalPending: 0,
      totalOverdue: 0,
      collectionRate: 0,
      totalMRR: 0,
      totalInvoicesCount: 0,
      totalClientsCount: 0,
    },
    revenueByClient: [],
    agingReport: {
      current: 0,
      thirtyToSixty: 0,
      sixtyPlus: 0,
    },
  });

  // Fetch real analytics data on mount
  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const apiBase =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

        const res = await fetch(
          `${apiBase.replace(/\/$/, "")}/analytics/overview`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        if (isMounted && data.success) {
          setAnalytics({
            stats: data.stats || {},
            revenueByClient: data.revenueByClient || [],
            agingReport: data.agingReport || {
              current: 0,
              thirtyToSixty: 0,
              sixtyPlus: 0,
            },
          });
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const { stats, revenueByClient, agingReport } = analytics;

  // Monthly trends dummy projection vs actual
  const months = [
    { label: "Jan", projected: 50, actual: 40 },
    { label: "Feb", projected: 65, actual: 60 },
    { label: "Mar", projected: 75, actual: 70 },
    { label: "Apr", projected: 60, actual: 55 },
    { label: "May", projected: 85, actual: 90 },
    { label: "Jun", projected: 80, actual: 78 },
    { label: "Jul", projected: 70, actual: 82 },
    { label: "Aug", projected: 90, actual: 95 },
  ];

  // Dynamic Palette for Client Breakdown
  const colors = [
    "var(--color-primary)",
    "var(--color-info)",
    "var(--color-warning)",
    "var(--color-danger)",
    "var(--color-border-dark)",
  ];

  // Aging calculations
  const totalAging =
    (agingReport.current || 0) +
    (agingReport.thirtyToSixty || 0) +
    (agingReport.sixtyPlus || 0);

  const getAgingPercent = (val) => {
    if (!totalAging || totalAging === 0) return "0%";
    const pct = Math.round(((Number(val) || 0) / totalAging) * 100);
    return `${Math.max(5, pct)}%`;
  };

  const aging = [
    {
      label: "Current (0-30 Days)",
      amount: formatMoney(agingReport.current),
      width: getAgingPercent(agingReport.current),
      bar: "var(--color-primary)",
    },
    {
      label: "Overdue 30-60 Days",
      amount: formatMoney(agingReport.thirtyToSixty),
      width: getAgingPercent(agingReport.thirtyToSixty),
      bar: "var(--color-warning)",
    },
    {
      label: "Overdue 60+ Days",
      amount: formatMoney(agingReport.sixtyPlus),
      width: getAgingPercent(agingReport.sixtyPlus),
      bar: "var(--color-danger)",
    },
  ];

  const getInitials = (name = "") =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "CL";

  return (
    <main className="flex-1 pt-2 pb-12 max-w-[1600px] mx-auto w-full scroll-host">
      <div className="page-in">
        {/* ========== HEADER ========== */}
        <SectionHeader
          title="Advanced Analytics"
          description="Real-time billing performance and revenue forecasts."
          secondaryAction={{
            label: "All Time",
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

        {/* ========== KPI CARDS ========== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Invoiced"
            value={loading ? "..." : formatMoney(stats.totalInvoiced)}
            icon="payments"
            iconColor="text-primary"
            badge={`${stats.totalInvoicesCount || 0} Invoices`}
            badgeColor="bg-primary-soft text-primary"
            variant="dashboard"
          />

          <StatCard
            title="Collection Rate"
            value={loading ? "..." : `${stats.collectionRate || 0}%`}
            icon="analytics"
            iconColor="text-info"
            badge={stats.collectionRate > 80 ? "Healthy" : "Attention"}
            badgeColor={
              stats.collectionRate > 80
                ? "bg-primary-soft text-primary"
                : "bg-warning-soft text-warning"
            }
            variant="dashboard"
          />

          <StatCard
            title="Pending Dues"
            value={loading ? "..." : formatMoney(stats.totalPending)}
            icon="schedule"
            iconColor="text-warning"
            change={
              stats.totalOverdue > 0
                ? `${formatMoney(stats.totalOverdue)} Overdue`
                : "No Overdues"
            }
            changeColor={
              stats.totalOverdue > 0 ? "text-danger" : "text-primary"
            }
            variant="dashboard"
          />

          <StatCard
            title="Monthly Recurring (MRR)"
            value={loading ? "..." : formatMoney(stats.totalMRR)}
            icon="trending_up"
            iconColor="text-primary"
            badge={`${stats.totalClientsCount || 0} Clients`}
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
                  strokeDasharray="464.96"
                  strokeDashoffset={
                    stats.totalInvoiced > 0 ? "0" : "464.96"
                  }
                  strokeLinecap="round"
                  transform="rotate(-90 90 90)"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-[11px] text-text-muted font-medium">
                  {revenueByClient[0]?.name?.slice(0, 12) || "Top Share"}
                </div>
                <div className="text-2xl font-bold text-text tabular-nums">
                  {revenueByClient[0]?.percentage || 100}%
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-2.5 text-sm">
              {revenueByClient.length === 0 ? (
                <div className="text-xs text-text-muted text-center py-2">
                  No revenue data yet
                </div>
              ) : (
                revenueByClient.map((c, idx) => (
                  <div
                    key={c.name}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: colors[idx % colors.length],
                        }}
                      />
                      <span className="text-text-muted text-xs truncate max-w-[130px]">
                        {c.name}
                      </span>
                    </div>
                    <span className="font-bold text-text text-xs tabular-nums">
                      {formatMoney(c.amount)} ({c.percentage}%)
                    </span>
                  </div>
                ))
              )}
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
                    <span className="text-text tabular-nums">
                      {item.amount}
                    </span>
                  </div>
                  <div
                    className="h-2 w-full rounded-full overflow-hidden"
                    style={{
                      backgroundColor: "var(--color-surface-secondary)",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
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
                {stats.totalPending > 0
                  ? `You have ${formatMoney(
                      stats.totalPending
                    )} awaiting collection. Set automatic reminders to improve cash flow.`
                  : "All current invoices are cleared. Financial pipeline is healthy!"}
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
                Top Valuable Clients
                <span className="text-text-light font-normal ml-2 text-sm">
                  Live Breakdown
                </span>
              </h4>
              <span className="text-text-light text-xs">
                {revenueByClient.length} Active Accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  style={{
                    backgroundColor: "var(--color-surface-secondary)",
                  }}
                >
                  <tr>
                    <th className="px-6 py-3 text-[10.5px] font-bold text-text-muted uppercase tracking-widest text-left">
                      Client
                    </th>
                    <th className="px-6 py-3 text-[10.5px] font-bold text-text-muted uppercase tracking-widest text-right">
                      Invoiced
                    </th>
                    <th className="px-6 py-3 text-[10.5px] font-bold text-text-muted uppercase tracking-widest text-right">
                      Share
                    </th>
                    <th className="px-6 py-3 text-[10.5px] font-bold text-text-muted uppercase tracking-widest text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {revenueByClient.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-xs text-text-muted"
                      >
                        No invoice records found in database.
                      </td>
                    </tr>
                  ) : (
                    revenueByClient.map((client) => (
                      <tr
                        key={client.name}
                        className="hover:bg-surface-hover transition"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded grid place-items-center font-bold text-[10px] bg-primary-soft text-primary"
                            >
                              {getInitials(client.name)}
                            </div>
                            <span className="text-sm font-medium text-text">
                              {client.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right text-sm font-medium text-text tabular-nums">
                          {formatMoney(client.amount)}
                        </td>
                        <td className="px-6 py-3.5 text-right text-sm font-medium text-text tabular-nums">
                          {client.percentage}%
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <Badge
                            label={stats.totalCollected > 0 ? "paid" : "pending"}
                            variant={
                              stats.totalCollected > 0 ? "paid" : "pending"
                            }
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}