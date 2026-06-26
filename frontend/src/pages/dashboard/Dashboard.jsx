import React, { useEffect, useCallback , useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

export default function Dashboard() {
  const location = useLocation();
const navigate = useNavigate();
const { addNotification } = useNotificationStore();
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    revenueTrends: [],
    upcomingBilling: [],
    recentInvoices: [],
  });
  const [loading, setLoading] = useState(true);
  const { format } = useCurrency();
const [formDrawerOpen, setFormDrawerOpen] = useState(false);
const [clientDetailDrawer, setClientDetailDrawer] = useState(false);

const [selectedClient, setSelectedClient] = useState(null);
const [editingClient, setEditingClient] = useState(null);
  const stats = [
    {
      title: "TOTAL INVOICES",
      value: dashboardData?.stats?.totalInvoices ?? 0,
      change: `${dashboardData?.stats?.totalProjects ?? 0} Projects`,
      icon: "description",
      iconColor: "text-teal-600",
      changeColor: "text-teal-700",
      type: "progress",
    },

    {
      title: "MONTHLY REVENUE",
      value: format(dashboardData?.stats?.monthlyRevenue ?? 0),
      change: `Projection: ${format(
        dashboardData?.stats?.projectedRevenue ?? 0,
      )}`,
      icon: "payments",
      iconColor: "text-indigo-600",
      changeColor: "text-slate-500",
    },

    {
      title: "OVERDUE",
      value: format(dashboardData?.stats?.overdueAmount ?? 0),
      change: `Action Required (${dashboardData?.stats?.overdueCount ?? 0})`,
      icon: "warning",
      iconColor: "text-rose-600",
      changeColor: "text-rose-600",
    },
  ];
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const [rowSelection, setRowSelection] = useState({});
  // ==================== CLIENT DRAWER HANDLERS ====================

 // Open Create Client Drawer
const openCreateClient = () => {
  setEditingClient(null);
  setFormDrawerOpen(true);
};

// Open Client Details Drawer
const openClientDetail = (client) => {
  setSelectedClient(client);
  setClientDetailDrawer(true);
};

// Close Client Details Drawer
const closeClientDetail = () => {
  setClientDetailDrawer(false);
  setSelectedClient(null);
};

// Edit Client from Detail Drawer
const openEdit = (client) => {
  setClientDetailDrawer(false);
  setEditingClient(client);
  setFormDrawerOpen(true);
};




  // Refetch dashboard when a new client is created
  const refetchDashboard = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard`);
      if (response.ok) {
        const result = await response.json();
        setDashboardData(result);
      }
    } catch (error) {
      console.error("Failed to refetch dashboard", error);
    }
  }, []);

  // Listen for client updates (same pattern as Clients page)
useEffect(() => {
    const handleClientUpdated = (e) => {
      refetchDashboard();

    };

    window.addEventListener("client-updated", handleClientUpdated);
    return () => window.removeEventListener("client-updated", handleClientUpdated);
  }, [refetchDashboard, addNotification]);
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-teal-50 text-teal-700";
      case "overdue":
        return "bg-rose-50 text-rose-700";
      case "draft":
        return "bg-slate-100 text-slate-600";
      case "scheduled":
        return "bg-indigo-50 text-indigo-700";
      case "pending":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getDotStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-teal-500";
      case "overdue":
        return "bg-rose-500";
      case "draft":
        return "bg-slate-400";
      case "scheduled":
        return "bg-indigo-500";
      case "pending":
        return "bg-amber-500";
      default:
        return "bg-slate-400";
    }
  };
  const invoiceColumns = useMemo(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "INVOICE ID",
        cell: ({ row }) => (
          <span className="font-bold text-slate-900">
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
              <div
                className="
                w-8 h-8 rounded-full
                bg-teal-100 text-teal-700
                flex items-center justify-center
                text-[10px] font-bold
              "
              >
                {initials}
              </div>

              <span className="font-medium text-slate-700">{clientName}</span>
            </div>
          );
        },
      },

      {
        header: "DATE ISSUED",
        cell: ({ row }) => (
          <span className="text-slate-500">
            {new Date(
              row.original.date || row.original.invoiceDate,
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
          <span className="font-bold text-slate-900">
            {format(row.original.amount)}
          </span>
        ),
      },

      {
        header: "STATUS",
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase();

          const config = {
            paid: {
              bg: "bg-teal-50",
              text: "text-teal-700",
              dot: "bg-teal-500",
            },
            overdue: {
              bg: "bg-rose-50",
              text: "text-rose-700",
              dot: "bg-rose-500",
            },
            draft: {
              bg: "bg-slate-100",
              text: "text-slate-600",
              dot: "bg-slate-400",
            },
            scheduled: {
              bg: "bg-indigo-50",
              text: "text-indigo-700",
              dot: "bg-indigo-500",
            },
            pending: {
              bg: "bg-amber-50",
              text: "text-amber-700",
              dot: "bg-amber-500",
            },
          };

          const style = config[status] || config.draft;

          return (
            <span
              className={`
              inline-flex items-center gap-2
              px-3 py-1
              rounded-full
              text-[11px]
              font-bold
              uppercase
              tracking-wide
              ${style.bg}
              ${style.text}
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
          row.original.client || {
            name: row.original.clientName,
          }
        )
      }
      className="
        w-8 h-8
        rounded-lg
        flex items-center justify-center
        text-slate-400
        hover:bg-slate-100
        hover:text-teal-600
        transition
      "
    >
      <span className="material-symbols-outlined text-[18px]">
        visibility
      </span>
    </button>
  ),
}
    ],
    [format],
  );
  useEffect(() => {
    if (location?.state?.fromLogin) {
      toast.success("Welcome back!");
    }
  }, [location]);
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard");
        }

        const result = await response.json();

        setDashboardData(result);
      } catch (error) {
        console.error(error);

        toast.error(error.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const billingColumns = [
    { key: "invoice", label: "Invoice ID" },
    { key: "client", label: "Client" },
    { key: "date", label: "Date Issued" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "action", label: "Action" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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
                <h3 className="text-xl font-bold text-slate-900">
                  Revenue Trends
                </h3>

                <p className="text-sm text-slate-500">
                  Automated vs Manual collection performance
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>

                  <span className="text-xs font-semibold text-slate-500">
                    Automated
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>

                  <span className="text-xs font-semibold text-slate-500">
                    Manual
                  </span>
                </div>
              </div>
            </div>

            {/* Fake Chart */}
           <div className="h-[280px] sm:h-[320px] lg:h-[380px]">
           
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData?.revenueTrends || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name === 'automated' ? 'Automated' : 'Manual']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '13px', color: '#64748b' }}
                  />
                  <Bar 
                    dataKey="automated" 
                    name="Automated" 
                    fill="#14b8a6" 
                    radius={[4, 4, 0, 0]} 
                    barSize={28}
                  />
                  <Bar 
                    dataKey="manual" 
                    name="Manual" 
                    fill="#cbd5e1" 
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
              bg-gradient-to-br
              from-teal-600
              to-teal-700
              text-white
              p-7
              shadow-xl shadow-teal-600/20
              relative overflow-hidden
            "
          >
            <div className="absolute right-0 bottom-0 opacity-10 -mr-6 -mb-6">
              <span className="material-symbols-outlined text-[120px]">
                bolt
              </span>
            </div>

            <h3 className="text-2xl font-bold">Quick Actions</h3>

            <p className="text-teal-100 text-sm mt-1 mb-6">
              Instantly manage your workflow.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
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
              <h3 className="font-bold text-slate-900">Upcoming Billing</h3>

              <button className="text-teal-600 text-xs font-bold hover:underline">
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
                    <div
                      className="
          w-10 h-10 rounded-full
          grid place-items-center
          text-xs font-bold
          bg-teal-100 text-teal-700
        "
                    >
                      {initials}
                    </div>

                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">
                        {item.clientName}
                      </div>

                      <div className="text-xs text-slate-500">
                        {item.dueDate
                          ? new Date(item.dueDate).toLocaleDateString()
                          : "No Due Date"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">
                        {format(item.amount)}
                      </div>

                      <div
                        className={`text-[10px] font-bold ${
                          item.auto ? "text-teal-600" : "text-slate-500"
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

        {/* TABLE */}
        {/* RECENT INVOICES */}
<div className="col-span-12">
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
    {/* Header */}
    <div className="h-[64px] px-6 flex items-center justify-between border-b border-slate-200">
      <h3 className="text-[18px] font-bold text-slate-900 tracking-tight">
        Recent Invoices
      </h3>

      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-teal-600 transition">
          <span className="material-symbols-outlined">
            filter_list
          </span>
        </button>

        <button className="text-slate-400 hover:text-teal-600 transition">
          <span className="material-symbols-outlined">
            more_vert
          </span>
        </button>
      </div>
    </div>

    {/* Table */}
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
