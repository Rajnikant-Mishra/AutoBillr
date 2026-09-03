import React, { useEffect, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import SectionHeader from "../../components/ui/SectionHeader";
import Badge from "../../components/ui/Badge";
import useCurrency from "../../hooks/useCurrency";
import DataTable from "../../components/ui/DataTable";
import ClientDetailDrawer from "../../components/clients/ClientDetailDrawer";
import ClientFormDrawer from "../../components/clients/ClientFormDrawer";
import { useNotificationStore } from "../../store/notificationStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { format } = useCurrency();

  const [dashboardData, setDashboardData] = useState({
    stats: {},
    revenueTrends: [],
    upcomingBilling: [],
    recentInvoices: [],
  });
  const [loading, setLoading] = useState(true);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [clientDetailDrawer, setClientDetailDrawer] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [rowSelection, setRowSelection] = useState({});

  // ==================== STATS ====================
  const stats = [
    {
      title: "TOTAL INVOICES",
      value: dashboardData?.stats?.totalInvoices ?? 0,
      change: `${dashboardData?.stats?.totalProjects ?? 0} Projects`,
      icon: "description",
      iconColor: "text-primary",
      changeColor: "text-primary-dark",
      type: "progress",
    },
    {
      title: "MONTHLY REVENUE",
      value: format(dashboardData?.stats?.monthlyRevenue ?? 0),
      change: `Projection: ${format(dashboardData?.stats?.projectedRevenue ?? 0)}`,
      icon: "payments",
      iconColor: "text-info",
      changeColor: "text-text-muted",
    },
    {
      title: "OVERDUE",
      value: format(dashboardData?.stats?.overdueAmount ?? 0),
      change: `Action Required (${dashboardData?.stats?.overdueCount ?? 0})`,
      icon: "warning",
      iconColor: "text-danger",
      changeColor: "text-danger",
    },
  ];

  // ==================== CLIENT DRAWER HANDLERS ====================
  const openCreateClient = () => {
    setEditingClient(null);
    setFormDrawerOpen(true);
  };

  const openClientDetail = (client) => {
    setSelectedClient(client);
    setClientDetailDrawer(true);
  };

  const closeClientDetail = () => {
    setClientDetailDrawer(false);
    setSelectedClient(null);
  };

  const openEdit = (client) => {
    setClientDetailDrawer(false);
    setEditingClient(client);
    setFormDrawerOpen(true);
  };

  // ==================== DATA ====================
  const refetchDashboard = useCallback(async () => {
    try {
      const token = localStorage.getItem("autobiller-auth");

      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to refresh dashboard");
      }

      setDashboardData(result);
    } catch (error) {
      console.error("Failed to refetch dashboard:", error);
    }
  }, []);

  useEffect(() => {
    const handleClientUpdated = () => refetchDashboard();
    window.addEventListener("client-updated", handleClientUpdated);
    return () => window.removeEventListener("client-updated", handleClientUpdated);
  }, [refetchDashboard]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("autobiller-auth");

        const response = await fetch(`${API_BASE_URL}/dashboard`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message || `Dashboard request failed (${response.status})`
          );
        }

        if (!result?.success) {
          throw new Error(result?.message || "Dashboard request was unsuccessful");
        }

        setDashboardData({
          stats: result.stats || {},
          revenueTrends: result.revenueTrends || [],
          upcomingBilling: result.upcomingBilling || [],
          recentInvoices: result.recentInvoices || [],
        });
      } catch (error) {
        console.error("DASHBOARD ERROR:", error);
        toast.error(error.message || "Failed to fetch dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ==================== TABLE COLUMNS ====================
  const invoiceColumns = useMemo(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "INVOICE ID",
        cell: ({ row }) => (
          <span className="font-bold text-text">
            #{row.original.invoiceNumber}
          </span>
        ),
      },
      {
        header: "CLIENT",
        cell: ({ row }) => {
          const clientName =
            row.original.clientName ||
            row.original.client?.name ||
            row.original.client ||
            "Unknown";

          const initials = clientName
            .split(" ")
            .map((word) => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

          return (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center text-[10px] font-bold">
                {initials}
              </div>
              <span className="font-medium text-text-secondary">{clientName}</span>
            </div>
          );
        },
      },
      {
        header: "DATE ISSUED",
        cell: ({ row }) => (
          <span className="text-text-muted">
            {new Date(
              row.original.date || row.original.invoiceDate
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        header: "AMOUNT",
        cell: ({ row }) => (
          <span className="font-bold text-text">{format(row.original.amount)}</span>
        ),
      },
      {
        header: "STATUS",
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase();

          const config = {
            paid: {
              bg: "bg-primary-soft",
              text: "text-primary-dark",
              dot: "bg-primary",
            },
            overdue: {
              bg: "bg-danger-soft",
              text: "text-danger",
              dot: "bg-danger",
            },
            draft: {
              bg: "bg-surface-secondary",
              text: "text-text-muted",
              dot: "bg-text-light",
            },
            scheduled: {
              bg: "bg-info-soft",
              text: "text-info",
              dot: "bg-info",
            },
            pending: {
              bg: "bg-warning-soft",
              text: "text-warning",
              dot: "bg-warning",
            },
          };

          const style = config[status] || config.draft;

          return (
            <span
              className={`
                inline-flex items-center gap-2
                px-3 py-1 rounded-full
                text-[11px] font-bold uppercase tracking-wide
                ${style.bg} ${style.text}
              `}
            >
              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
              {status}
            </span>
          );
        },
      },
      {
        id: "action",
        header: "ACTION",
        cell: ({ row }) => (
          <button
            onClick={() =>
              openClientDetail(
                row.original.client || { name: row.original.clientName }
              )
            }
            className="
              w-8 h-8 rounded-lg
              flex items-center justify-center
              text-text-light
              hover:bg-surface-hover hover:text-primary
              transition
            "
          >
            <span className="material-symbols-outlined text-[18px]">
              visibility
            </span>
          </button>
        ),
      },
    ],
    [format]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <main className="flex-1 pt-2 pb-12 w-full px-0">
      {/* Header */}
      <SectionHeader
        title="Revenue Overview"
        description={`You have ${
          dashboardData?.stats?.totalInvoices || 0
        } invoices and ${
          dashboardData?.stats?.totalClients || 0
        } clients in your system.`}
        secondaryAction={{
          label: "Last 30 Days",
          icon: "calendar_today",
          variant: "secondary",
        }}
        primaryAction={{
          label: "Export Report",
          icon: "download",
        }}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* LEFT */}
        <div className="xl:col-span-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-5">
            {stats.map((item, index) => (
              <StatCard
                key={index}
                title={item.title}
                value={item.value}
                change={item.change}
                icon={item.icon}
                iconColor={item.iconColor}
                changeColor={item.changeColor}
                variant="dashboard"
                dashboardCompact={true}
                showProgress={item.type === "progress"}
                progressValue={item.type === "progress" ? 82 : 0}
              />
            ))}
          </div>

          {/* Revenue Chart */}
          <Card className="p-7">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
              <div>
                <h3 className="text-xl font-bold text-text">Revenue Trends</h3>
                <p className="text-sm text-text-muted">
                  Automated vs Manual collection performance
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-xs font-semibold text-text-muted">
                    Automated
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-border-dark" />
                  <span className="text-xs font-semibold text-text-muted">
                    Manual
                  </span>
                </div>
              </div>
            </div>

            <div className="h-[280px] sm:h-[320px] lg:h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData?.revenueTrends || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                  />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value}%`,
                      name === "automated" ? "Automated" : "Manual",
                    ]}
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "var(--shadow-lg)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "13px",
                      color: "var(--color-text-muted)",
                    }}
                  />
                  <Bar
                    dataKey="automated"
                    name="Automated"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                  <Bar
                    dataKey="manual"
                    name="Manual"
                    fill="var(--color-border-dark)"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          {/* Quick Actions */}
          <Card
            bordered={false}
            className="
              bg-gradient-to-br from-primary to-primary-dark
              text-white p-7
              shadow-xl shadow-primary/20
              relative overflow-hidden
            "
          >
            <div className="absolute right-0 bottom-0 opacity-10 -mr-6 -mb-6">
              <span className="material-symbols-outlined text-[120px]">bolt</span>
            </div>

            <h3 className="text-2xl font-bold">Quick Actions</h3>
            <p className="text-primary-soft text-sm mt-1 mb-6 opacity-90">
              Instantly manage your workflow.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                icon="person_add"
                className="h-[88px] flex-col"
                fullWidth
                onClick={openCreateClient}
              >
                Add Client
              </Button>
              <Button
                variant="ghost"
                icon="sync"
                className="h-[88px] flex-col"
                fullWidth
                onClick={() => navigate("/automation")}
              >
                Automation
              </Button>
              <Button
                variant="ghost"
                icon="receipt_long"
                className="h-[88px] flex-col"
                fullWidth
              >
                Batch Bill
              </Button>
              <Button
                variant="ghost"
                icon="query_stats"
                className="h-[88px] flex-col"
                fullWidth
              >
                Analytics
              </Button>
            </div>
          </Card>

          {/* Upcoming Billing */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-text">Upcoming Billing</h3>
              <button className="text-primary text-xs font-bold hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {dashboardData?.upcomingBilling?.map((item) => {
                const initials = item.clientName
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .substring(0, 2);

                return (
                  <div key={item._id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full grid place-items-center text-xs font-bold bg-primary-soft text-primary-dark">
                      {initials}
                    </div>

                    <div className="flex-1">
                      <div className="text-sm font-bold text-text">
                        {item.clientName}
                      </div>
                      <div className="text-xs text-text-muted">
                        {item.dueDate
                          ? new Date(item.dueDate).toLocaleDateString()
                          : "No Due Date"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-text">
                        {format(item.amount)}
                      </div>
                      <div
                        className={`text-[10px] font-bold ${
                          item.auto ? "text-primary" : "text-text-muted"
                        }`}
                      >
                        {item.auto ? "AUTO" : "MANUAL"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RECENT INVOICES TABLE */}
        <div className="col-span-12">
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="h-[64px] px-6 flex items-center justify-between border-b border-border">
              <h3 className="text-[18px] font-bold text-text tracking-tight">
                Recent Invoices
              </h3>

              <div className="flex items-center gap-4">
                <button className="text-text-light hover:text-primary transition">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <button className="text-text-light hover:text-primary transition">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>

            <DataTable
              data={dashboardData?.recentInvoices || []}
              columns={invoiceColumns}
              loading={loading}
              pagination={pagination}
              setPagination={setPagination}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              emptyMessage="No invoices found"
              hidePagination
            />
          </div>
        </div>
      </div>

      {/* Drawers */}
      <ClientFormDrawer
        isOpen={formDrawerOpen}
        onClose={() => {
          setFormDrawerOpen(false);
          setEditingClient(null);
        }}
        client={editingClient}
        onSuccess={() => {
          refetchDashboard();
          toast.success(
            editingClient
              ? "Client updated successfully"
              : "Client created successfully"
          );
          setFormDrawerOpen(false);
          setEditingClient(null);
        }}
      />

      <ClientDetailDrawer
        isOpen={clientDetailDrawer}
        onClose={closeClientDetail}
        client={selectedClient}
        onEdit={openEdit}
      />
    </main>
  );
}