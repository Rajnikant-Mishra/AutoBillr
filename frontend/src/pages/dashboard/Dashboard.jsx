
// import { useEffect, useCallback, useMemo, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import Button from "../../components/ui/Button";
// import Card from "../../components/ui/Card";
// import StatCard from "../../components/ui/StatCard";
// import SectionHeader from "../../components/ui/SectionHeader";
// import DataTable from "../../components/ui/DataTable";
// import ClientDetailDrawer from "../../components/clients/ClientDetailDrawer";
// import ClientFormDrawer from "../../components/clients/ClientFormDrawer";
// import { useCurrencyStore } from "../../store/currencyStore";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// const API_BASE_URL = (
//   import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
// ).replace(/\/$/, "");

// // Safe Token Helper
// const getAuthToken = () => {
//   const plainToken = localStorage.getItem("token");
//   if (plainToken && plainToken.startsWith("ey")) return plainToken;

//   const authStorage = localStorage.getItem("autobiller-auth");
//   if (authStorage) {
//     if (authStorage.startsWith("ey")) return authStorage;
//     try {
//       const parsed = JSON.parse(authStorage);
//       const token = parsed?.state?.token || parsed?.token;
//       if (token) return token;
//     } catch {
//       // ignore json parse error
//     }
//   }
//   return plainToken || authStorage || "";
// };

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const { formatAmount, selectedCurrency } = useCurrencyStore();

//   const format = useCallback(
//     (val) => {
//       if (typeof formatAmount === "function") {
//         return formatAmount(val);
//       }
//       const sym = selectedCurrency?.symbol || "₹";
//       return `${sym}${Number(val || 0).toLocaleString()}`;
//     },
//     [formatAmount, selectedCurrency]
//   );

//   const [dashboardData, setDashboardData] = useState({
//     stats: {},
//     revenueTrends: [],
//     upcomingBilling: [],
//     recentInvoices: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [formDrawerOpen, setFormDrawerOpen] = useState(false);
//   const [clientDetailDrawer, setClientDetailDrawer] = useState(false);
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [editingClient, setEditingClient] = useState(null);
//   const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
//   const [rowSelection, setRowSelection] = useState({});

//   // Filter Popover State
//   const [filterModalOpen, setFilterModalOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortBy, setSortBy] = useState("newest");
//   const filterRef = useRef(null);

//   // Close filter popover on Escape key or outside click
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === "Escape" && filterModalOpen) {
//         setFilterModalOpen(false);
//       }
//     };

//     const handleClickOutside = (e) => {
//       if (filterRef.current && !filterRef.current.contains(e.target)) {
//         setFilterModalOpen(false);
//       }
//     };

//     if (filterModalOpen) {
//       window.addEventListener("keydown", handleKeyDown);
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [filterModalOpen]);

//   // Robust initials generator
//   const getInitials = (name = "") => {
//     if (!name || typeof name !== "string") return "CL";
//     const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, "");
//     if (!clean) return "CL";
//     const parts = clean.split(/\s+/).filter(Boolean);
//     if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
//     return (parts[0][0] + parts[1][0]).toUpperCase();
//   };

//   // ==================== STATS ====================
//   const stats = useMemo(
//     () => [
//       {
//         title: "TOTAL INVOICES",
//         value: dashboardData?.stats?.totalInvoices ?? 0,
//         change: `${dashboardData?.stats?.totalProjects ?? 0} Projects`,
//         icon: "description",
//         iconColor: "text-primary",
//         changeColor: "text-primary-dark",
//         type: "progress",
//       },
//       {
//         title: "MONTHLY REVENUE",
//         value: format(dashboardData?.stats?.monthlyRevenue ?? 0),
//         change: `Projection: ${format(
//           dashboardData?.stats?.projectedRevenue ?? 0
//         )}`,
//         icon: "payments",
//         iconColor: "text-info",
//         changeColor: "text-text-muted",
//       },
//       {
//         title: "OVERDUE",
//         value: format(dashboardData?.stats?.overdueAmount ?? 0),
//         change: `Action Required (${dashboardData?.stats?.overdueCount ?? 0})`,
//         icon: "warning",
//         iconColor: "text-danger",
//         changeColor: "text-danger",
//       },
//     ],
//     [dashboardData, format]
//   );

//   // ==================== CLIENT DRAWER HANDLERS ====================
//   const openCreateClient = () => {
//     setEditingClient(null);
//     setFormDrawerOpen(true);
//   };

//   const openClientDetail = useCallback((clientTarget, rawClientName = "") => {
//     let clientPayload = {};

//     if (clientTarget && typeof clientTarget === "object") {
//       clientPayload = {
//         ...clientTarget,
//         name: clientTarget.name || rawClientName || "Client Details",
//         email: clientTarget.email || "No Email Provided",
//         company: clientTarget.company || clientTarget.companyName || "—",
//         phone: clientTarget.phone || "—",
//       };
//     } else {
//       clientPayload = {
//         id: typeof clientTarget === "string" ? clientTarget : undefined,
//         name: rawClientName || "Client Details",
//         email: "No Email Provided",
//         company: "—",
//         phone: "—",
//       };
//     }

//     setSelectedClient(clientPayload);
//     setClientDetailDrawer(true);
//   }, []);

//   const closeClientDetail = () => {
//     setClientDetailDrawer(false);
//     setSelectedClient(null);
//   };

//   const openEdit = (client) => {
//     setClientDetailDrawer(false);
//     setEditingClient(client);
//     setFormDrawerOpen(true);
//   };

//   // ==================== REFETCH DATA ====================
//   const refetchDashboard = useCallback(async () => {
//     try {
//       const token = getAuthToken();

//       const response = await fetch(`${API_BASE_URL}/dashboard`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//       });

//       const text = await response.text();
//       let result = {};
//       try {
//         result = text ? JSON.parse(text) : {};
//       } catch {
//         throw new Error("Server returned an invalid / empty response");
//       }

//       if (!response.ok) {
//         throw new Error(result?.message || "Failed to refresh dashboard");
//       }

//       setDashboardData({
//         stats: result.stats || {},
//         revenueTrends: result.revenueTrends || [],
//         upcomingBilling: result.upcomingBilling || [],
//         recentInvoices: result.recentInvoices || [],
//       });
//     } catch (error) {
//       console.error("Failed to refetch dashboard:", error);
//     }
//   }, []);

//   // ==================== INITIAL FETCH ====================
//   useEffect(() => {
//     let isMounted = true;

//     const fetchDashboard = async () => {
//       try {
//         const token = getAuthToken();

//         const response = await fetch(`${API_BASE_URL}/dashboard`, {
//           method: "GET",
//           headers: {
//             Accept: "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//         });

//         const text = await response.text();
//         let result = {};
//         try {
//           result = text ? JSON.parse(text) : {};
//         } catch {
//           throw new Error(
//             `Server returned empty or invalid JSON (status ${response.status})`
//           );
//         }

//         if (!response.ok) {
//           throw new Error(
//             result?.message || `Dashboard request failed (${response.status})`
//           );
//         }

//         if (isMounted) {
//           setDashboardData({
//             stats: result.stats || {},
//             revenueTrends: result.revenueTrends || [],
//             upcomingBilling: result.upcomingBilling || [],
//             recentInvoices: result.recentInvoices || [],
//           });
//         }
//       } catch (error) {
//         console.error("DASHBOARD ERROR:", error);
//         if (isMounted) {
//           toast.error(error.message || "Failed to fetch dashboard");
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchDashboard();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     const handleClientUpdated = () => refetchDashboard();
//     window.addEventListener("client-updated", handleClientUpdated);
//     return () =>
//       window.removeEventListener("client-updated", handleClientUpdated);
//   }, [refetchDashboard]);

//   // ==================== FILTER & SORT RECENT INVOICES ====================
//   const filteredRecentInvoices = useMemo(() => {
//     let list = [...(dashboardData?.recentInvoices || [])];

//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase().trim();
//       list = list.filter((inv) => {
//         const invNum = (inv.invoiceNumber || inv.number || "").toLowerCase();
//         const client = (
//           inv.clientName ||
//           inv.client?.name ||
//           (typeof inv.client === "string" ? inv.client : "") ||
//           ""
//         ).toLowerCase();
//         return invNum.includes(q) || client.includes(q);
//       });
//     }

//     list.sort((a, b) => {
//       const dateA = new Date(
//         a.date || a.invoiceDate || a.issueDate || a.createdAt || 0
//       ).getTime();
//       const dateB = new Date(
//         b.date || b.invoiceDate || b.issueDate || b.createdAt || 0
//       ).getTime();
//       const amountA = Number(a.amount || a.total || 0);
//       const amountB = Number(b.amount || b.total || 0);

//       switch (sortBy) {
//         case "oldest":
//           return dateA - dateB;
//         case "amount-high":
//           return amountB - amountA;
//         case "amount-low":
//           return amountA - amountB;
//         case "newest":
//         default:
//           return dateB - dateA;
//       }
//     });

//     // Top 3 recent invoices limit
//     return list.slice(0, 3);
//   }, [dashboardData.recentInvoices, searchQuery, sortBy]);

//   // ==================== TABLE COLUMNS ====================
//   const invoiceColumns = useMemo(
//     () => [
//       {
//         accessorKey: "invoiceNumber",
//         header: "INVOICE ID",
//         cell: ({ row }) => (
//           <span className="font-bold text-text">
//             #{row.original.invoiceNumber || row.original.number || "—"}
//           </span>
//         ),
//       },
//       {
//         header: "CLIENT",
//         cell: ({ row }) => {
//           const clientName =
//             row.original.clientName ||
//             row.original.client?.name ||
//             (typeof row.original.client === "string" ? row.original.client : null) ||
//             "Unknown Client";

//           const initials = getInitials(clientName);

//           return (
//             <div className="flex items-center gap-3 sm:gap-4">
//               <div className="w-8 h-8 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center text-[10px] font-bold shrink-0">
//                 {initials}
//               </div>
//               <span className="font-medium text-text-secondary truncate">
//                 {clientName}
//               </span>
//             </div>
//           );
//         },
//       },
//       {
//         header: "DATE ISSUED",
//         cell: ({ row }) => {
//           const raw =
//             row.original.date ||
//             row.original.invoiceDate ||
//             row.original.issueDate ||
//             row.original.createdAt;
//           const d = raw ? new Date(raw) : null;
//           const isValid = d && !isNaN(d.getTime());

//           return (
//             <span className="text-text-muted">
//               {isValid
//                 ? d.toLocaleDateString("en-US", {
//                     month: "short",
//                     day: "2-digit",
//                     year: "numeric",
//                   })
//                 : "—"}
//             </span>
//           );
//         },
//       },
//       {
//         header: "AMOUNT",
//         cell: ({ row }) => (
//           <span className="font-bold text-text">
//             {format(row.original.amount || row.original.total || 0)}
//           </span>
//         ),
//       },
//       {
//         header: "STATUS",
//         cell: ({ row }) => {
//           const rawStatus = row.original.status || "draft";
//           const status = String(rawStatus).toLowerCase().trim();

//           const config = {
//             paid: {
//               bg: "bg-success-soft",
//               text: "text-success",
//               dot: "bg-success",
//             },
//             active: {
//               bg: "bg-primary-soft",
//               text: "text-primary-dark",
//               dot: "bg-primary",
//             },
//             pending: {
//               bg: "bg-warning-soft",
//               text: "text-warning",
//               dot: "bg-warning",
//             },
//             overdue: {
//               bg: "bg-danger-soft",
//               text: "text-danger",
//               dot: "bg-danger",
//             },
//             scheduled: {
//               bg: "bg-info-soft",
//               text: "text-info",
//               dot: "bg-info",
//             },
//             draft: {
//               bg: "bg-surface-secondary",
//               text: "text-text-muted",
//               dot: "bg-text-light",
//             },
//           };

//           const style = config[status] || config.draft;

//           return (
//             <span
//               className={`
//                 inline-flex items-center gap-1.5
//                 px-2.5 py-1 rounded-full
//                 text-[11px] font-bold uppercase tracking-wider
//                 ${style.bg} ${style.text}
//               `}
//             >
//               <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
//               {status}
//             </span>
//           );
//         },
//       },
//       {
//         id: "action",
//         header: "ACTION",
//         cell: ({ row }) => {
//           const inv = row.original;
//           const invoiceId = inv.id || inv._id;
//           const targetClient = inv.client;
//           const clientName =
//             inv.clientName ||
//             inv.client?.name ||
//             (typeof targetClient === "string" ? targetClient : "");

//           return (
//             <div className="flex items-center gap-1">
//               {/* Preview invoice button */}
//               <button
//                 type="button"
//                 title="Preview Invoice"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   if (invoiceId) {
//                     navigate(`/composer?invoiceId=${invoiceId}`);
//                   } else {
//                     toast.error("Invoice ID not found");
//                   }
//                 }}
//                 className="
//                   w-8 h-8 rounded-lg
//                   flex items-center justify-center
//                   text-text-light
//                   hover:bg-surface-hover hover:text-primary
//                   transition
//                 "
//               >
//                 <span className="material-symbols-outlined text-[18px]">
//                   visibility
//                 </span>
//               </button>

//               {/* View client details button */}
//               <button
//                 type="button"
//                 title="Client Details"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   openClientDetail(targetClient, clientName);
//                 }}
//                 className="
//                   w-8 h-8 rounded-lg
//                   flex items-center justify-center
//                   text-text-light
//                   hover:bg-surface-hover hover:text-primary
//                   transition
//                 "
//               >
//                 <span className="material-symbols-outlined text-[18px]">
//                   person
//                 </span>
//               </button>
//             </div>
//           );
//         },
//       },
//     ],
//     [format, navigate, openClientDetail]
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-[70vh]">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
//       </div>
//     );
//   }

//   return (
//     <main className="flex-1 pt-2 pb-12 w-full px-0">
//       {/* Header */}
//       <SectionHeader
//         title="Revenue Overview"
//         description={`You have ${
//           dashboardData?.stats?.totalInvoices || 0
//         } invoices and ${
//           dashboardData?.stats?.totalClients || 0
//         } clients in your system.`}
//         secondaryAction={{
//           label: "Last 30 Days",
//           icon: "calendar_today",
//           variant: "secondary",
//         }}
//         primaryAction={{
//           label: "Export Report",
//           icon: "download",
//         }}
//       />

//       {/* Main Grid */}
//       <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
//         {/* LEFT */}
//         <div className="xl:col-span-8 min-w-0">
//           {/* Stats */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-5">
//             {stats.map((item, index) => (
//               <StatCard
//                 key={index}
//                 title={item.title}
//                 value={item.value}
//                 change={item.change}
//                 icon={item.icon}
//                 iconColor={item.iconColor}
//                 changeColor={item.changeColor}
//                 variant="dashboard"
//                 dashboardCompact={true}
//                 showProgress={item.type === "progress"}
//                 progressValue={item.type === "progress" ? 82 : 0}
//               />
//             ))}
//           </div>

//           {/* Revenue Chart */}
//           <Card className="p-7">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
//               <div>
//                 <h3 className="text-xl font-bold text-text">Revenue Trends</h3>
//                 <p className="text-sm text-text-muted">
//                   Automated vs Manual collection performance
//                 </p>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2.5 h-2.5 rounded-full bg-primary" />
//                   <span className="text-xs font-semibold text-text-muted">
//                     Automated
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-2.5 h-2.5 rounded-full bg-border-dark" />
//                   <span className="text-xs font-semibold text-text-muted">
//                     Manual
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="h-[280px] sm:h-[320px] lg:h-[380px] w-full min-w-0">
//               <ResponsiveContainer
//                 width="100%"
//                 height="100%"
//                 minWidth={0}
//                 minHeight={280}
//               >
//                 <BarChart
//                   data={dashboardData?.revenueTrends || []}
//                   margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
//                 >
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     stroke="var(--color-border)"
//                   />
//                   <XAxis
//                     dataKey="month"
//                     tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
//                   />
//                   <YAxis
//                     tickFormatter={(value) => `${value}%`}
//                     tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
//                   />
//                   <Tooltip
//                     formatter={(value, name) => [
//                       `${value}%`,
//                       name === "automated" ? "Automated" : "Manual",
//                     ]}
//                     contentStyle={{
//                       backgroundColor: "var(--color-surface)",
//                       border: "none",
//                       borderRadius: "8px",
//                       boxShadow: "var(--shadow-lg)",
//                     }}
//                   />
//                   <Legend
//                     iconType="circle"
//                     wrapperStyle={{
//                       fontSize: "13px",
//                       color: "var(--color-text-muted)",
//                     }}
//                   />
//                   <Bar
//                     dataKey="automated"
//                     name="Automated"
//                     fill="var(--color-primary)"
//                     radius={[4, 4, 0, 0]}
//                     barSize={28}
//                   />
//                   <Bar
//                     dataKey="manual"
//                     name="Manual"
//                     fill="var(--color-border-dark)"
//                     radius={[4, 4, 0, 0]}
//                     barSize={28}
//                   />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </Card>
//         </div>

//         {/* RIGHT */}
//         <div className="xl:col-span-4 flex flex-col gap-5 min-w-0">
//           {/* Quick Actions */}
//           <Card
//             bordered={false}
//             className="
//               bg-gradient-to-br from-primary to-primary-dark
//               text-white p-7
//               shadow-xl shadow-primary/20
//               relative overflow-hidden
//             "
//           >
//             <div className="absolute right-0 bottom-0 opacity-10 -mr-6 -mb-6">
//               <span className="material-symbols-outlined text-[120px]">
//                 bolt
//               </span>
//             </div>

//             <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
//             <p className="text-primary-soft text-sm mt-1 mb-6 opacity-90">
//               Instantly manage your workflow.
//             </p>

//             <div className="grid grid-cols-2 gap-3">
//               <Button
//                 variant="ghost"
//                 icon="person_add"
//                 className="h-[88px] flex-col"
//                 fullWidth
//                 onClick={openCreateClient}
//               >
//                 Add Client
//               </Button>
//               <Button
//                 variant="ghost"
//                 icon="sync"
//                 className="h-[88px] flex-col"
//                 fullWidth
//                 onClick={() => navigate("/automation")}
//               >
//                 Automation
//               </Button>
//               <Button
//                 variant="ghost"
//                 icon="receipt_long"
//                 className="h-[88px] flex-col"
//                 fullWidth
//                 onClick={() => navigate("/composer")}
//               >
//                 Batch Bill
//               </Button>
//               <Button
//                 variant="ghost"
//                 icon="query_stats"
//                 className="h-[88px] flex-col"
//                 fullWidth
//                 onClick={() => navigate("/analytics")}
//               >
//                 Analytics
//               </Button>
//             </div>
//           </Card>

//           {/* Upcoming Billing */}
//           <Card className="p-6">
//             <div className="flex items-center justify-between mb-5">
//               <h3 className="font-bold text-text">Upcoming Billing</h3>
//               <button
//                 type="button"
//                 onClick={() => navigate("/invoices")}
//                 className="text-primary text-xs font-bold hover:underline"
//               >
//                 View All
//               </button>
//             </div>

//             <div className="space-y-4">
//               {dashboardData?.upcomingBilling?.length === 0 ? (
//                 <p className="text-xs text-text-muted text-center py-4">
//                   No upcoming billing
//                 </p>
//               ) : (
//                 dashboardData?.upcomingBilling?.map((item, idx) => {
//                   const clientName =
//                     item.clientName ||
//                     item.client?.name ||
//                     (typeof item.client === "string" ? item.client : null) ||
//                     "Client";
//                   const initials = getInitials(clientName);

//                   return (
//                     <div
//                       key={item.id || item._id || idx}
//                       className="flex items-center gap-4"
//                     >
//                       <div className="w-10 h-10 rounded-full grid place-items-center text-xs font-bold bg-primary-soft text-primary-dark shrink-0">
//                         {initials}
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <div className="text-sm font-bold text-text truncate">
//                           {clientName}
//                         </div>
//                         <div className="text-xs text-text-muted">
//                           {item.dueDate
//                             ? new Date(item.dueDate).toLocaleDateString()
//                             : "No Due Date"}
//                         </div>
//                       </div>

//                       <div className="text-right">
//                         <div className="text-sm font-bold text-text">
//                           {format(item.amount)}
//                         </div>
//                         <div
//                           className={`text-[10px] font-bold ${
//                             item.auto ? "text-primary" : "text-text-muted"
//                           }`}
//                         >
//                           {item.auto ? "AUTO" : "MANUAL"}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </Card>
//         </div>

//         {/* RECENT INVOICES TABLE */}
//         <div className="col-span-12">
//           <div className="bg-surface border border-border rounded-2xl overflow-hidden">
//             <div className="h-[64px] px-6 flex items-center justify-between border-b border-border relative">
//               <div className="flex items-center gap-2">
//                 <h3 className="text-[18px] font-bold text-text tracking-tight">
//                   Recent Invoices
//                 </h3>
//                 <span className="text-xs text-text-muted font-normal">
//                   (Showing latest {filteredRecentInvoices.length})
//                 </span>
//               </div>

//               {/* Filter Button & Compact Popup Modal */}
//               <div className="relative" ref={filterRef}>
//                 <button
//                   type="button"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setFilterModalOpen((prev) => !prev);
//                   }}
//                   className={`p-2 rounded-lg border transition flex items-center gap-1.5 text-xs font-semibold ${
//                     filterModalOpen
//                       ? "bg-primary-soft text-primary border-primary/30"
//                       : "bg-surface-secondary text-text-muted border-border hover:text-text hover:bg-surface-hover"
//                   }`}
//                   title="Filter & Sort"
//                 >
//                   <span className="material-symbols-outlined text-[18px]">
//                     filter_list
//                   </span>
//                   <span>Filter</span>
//                 </button>

//                 {/* Filter Modal / Popover */}
//                 {filterModalOpen && (
//                   <div
//                     onClick={(e) => e.stopPropagation()}
//                     className="absolute right-0 mt-2 w-72 bg-surface border border-border rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
//                   >
//                     <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
//                       <span className="text-xs font-bold text-text uppercase tracking-wider">
//                         Filter & Sort
//                       </span>
//                       <button
//                         type="button"
//                         onClick={() => setFilterModalOpen(false)}
//                         className="text-text-muted hover:text-text text-sm"
//                       >
//                         ✕
//                       </button>
//                     </div>

//                     {/* Search Field */}
//                     <div className="mb-3">
//                       <label className="text-[11px] font-semibold text-text-muted mb-1 block">
//                         Search
//                       </label>
//                       <div className="relative">
//                         <input
//                           type="text"
//                           placeholder="ID or Client name..."
//                           value={searchQuery}
//                           onChange={(e) => setSearchQuery(e.target.value)}
//                           className="w-full text-xs bg-surface-secondary border border-border rounded-lg px-2.5 py-1.5 text-text focus:outline-none focus:border-primary"
//                         />
//                         {searchQuery && (
//                           <button
//                             type="button"
//                             onClick={() => setSearchQuery("")}
//                             className="absolute right-2 top-1.5 text-xs text-text-muted hover:text-text"
//                           >
//                             ×
//                           </button>
//                         )}
//                       </div>
//                     </div>

//                     {/* Sort Field */}
//                     <div className="mb-4">
//                       <label className="text-[11px] font-semibold text-text-muted mb-1 block">
//                         Sort By
//                       </label>
//                       <select
//                         value={sortBy}
//                         onChange={(e) => setSortBy(e.target.value)}
//                         className="w-full text-xs bg-surface-secondary border border-border rounded-lg px-2.5 py-1.5 text-text focus:outline-none focus:border-primary cursor-pointer font-medium"
//                       >
//                         <option value="newest">Date: Newest First</option>
//                         <option value="oldest">Date: Oldest First</option>
//                         <option value="amount-high">Amount: High to Low</option>
//                         <option value="amount-low">Amount: Low to High</option>
//                       </select>
//                     </div>

//                     {/* Modal Footer Actions */}
//                     <div className="flex items-center justify-between pt-2 border-t border-border">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setSearchQuery("");
//                           setSortBy("newest");
//                         }}
//                         className="text-[11px] text-text-muted hover:text-primary transition font-medium"
//                       >
//                         Reset All
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => setFilterModalOpen(false)}
//                         className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition"
//                       >
//                         Apply
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <DataTable
//               data={filteredRecentInvoices}
//               columns={invoiceColumns}
//               loading={loading}
//               pagination={pagination}
//               setPagination={setPagination}
//               rowSelection={rowSelection}
//               setRowSelection={setRowSelection}
//               emptyMessage="No matching invoices found"
//               hidePagination
//             />
//           </div>
//         </div>
//       </div>

//       {/* Drawers */}
//       <ClientFormDrawer
//         isOpen={formDrawerOpen}
//         onClose={() => {
//           setFormDrawerOpen(false);
//           setEditingClient(null);
//         }}
//         client={editingClient}
//         onSuccess={() => {
//           refetchDashboard();
//           toast.success(
//             editingClient
//               ? "Client updated successfully"
//               : "Client created successfully"
//           );
//           setFormDrawerOpen(false);
//           setEditingClient(null);
//         }}
//       />

//       <ClientDetailDrawer
//         isOpen={clientDetailDrawer}
//         onClose={closeClientDetail}
//         client={selectedClient}
//         onEdit={openEdit}
//       />
//     </main>
//   );
// }

import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import SectionHeader from "../../components/ui/SectionHeader";
import DataTable from "../../components/ui/DataTable";
import ClientDetailDrawer from "../../components/clients/ClientDetailDrawer";
import ClientFormDrawer from "../../components/clients/ClientFormDrawer";
import { useCurrencyStore } from "../../store/currencyStore";
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

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

// Safe Token Helper
const getAuthToken = () => {
  const plainToken = localStorage.getItem("token");
  if (plainToken && plainToken.startsWith("ey")) return plainToken;

  const authStorage = localStorage.getItem("autobiller-auth");
  if (authStorage) {
    if (authStorage.startsWith("ey")) return authStorage;
    try {
      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token || parsed?.token;
      if (token) return token;
    } catch {
      // ignore json parse error
    }
  }
  return plainToken || authStorage || "";
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { formatAmount, selectedCurrency } = useCurrencyStore();

  const format = useCallback(
    (val) => {
      if (typeof formatAmount === "function") {
        return formatAmount(val);
      }
      const sym = selectedCurrency?.symbol || "₹";
      return `${sym}${Number(val || 0).toLocaleString()}`;
    },
    [formatAmount, selectedCurrency]
  );

  const [dashboardData, setDashboardData] = useState({
    stats: {},
    revenueTrends: [],
    recentInvoices: [],
  });
  const [loading, setLoading] = useState(true);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [clientDetailDrawer, setClientDetailDrawer] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [rowSelection, setRowSelection] = useState({});

  // Filter Popover State
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const filterRef = useRef(null);

  // Close filter popover on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && filterModalOpen) {
        setFilterModalOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterModalOpen(false);
      }
    };

    if (filterModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterModalOpen]);

  // Robust initials generator
  const getInitials = (name = "") => {
    if (!name || typeof name !== "string") return "CL";
    const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, "");
    if (!clean) return "CL";
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // ==================== STATS ====================
  const stats = useMemo(
    () => [
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
        change: `Projection: ${format(
          dashboardData?.stats?.projectedRevenue ?? 0
        )}`,
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
    ],
    [dashboardData, format]
  );

  // ==================== CLIENT DRAWER HANDLERS ====================
  const openCreateClient = () => {
    setEditingClient(null);
    setFormDrawerOpen(true);
  };

  const openClientDetail = useCallback((clientTarget, rawClientName = "") => {
    let clientPayload = {};

    if (clientTarget && typeof clientTarget === "object") {
      clientPayload = {
        ...clientTarget,
        name: clientTarget.name || rawClientName || "Client Details",
        email: clientTarget.email || "No Email Provided",
        company: clientTarget.company || clientTarget.companyName || "—",
        phone: clientTarget.phone || "—",
      };
    } else {
      clientPayload = {
        id: typeof clientTarget === "string" ? clientTarget : undefined,
        name: rawClientName || "Client Details",
        email: "No Email Provided",
        company: "—",
        phone: "—",
      };
    }

    setSelectedClient(clientPayload);
    setClientDetailDrawer(true);
  }, []);

  const closeClientDetail = () => {
    setClientDetailDrawer(false);
    setSelectedClient(null);
  };

  const openEdit = (client) => {
    setClientDetailDrawer(false);
    setEditingClient(client);
    setFormDrawerOpen(true);
  };

  // ==================== REFETCH DATA ====================
  const refetchDashboard = useCallback(async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const text = await response.text();
      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Server returned an invalid / empty response");
      }

      if (!response.ok) {
        throw new Error(result?.message || "Failed to refresh dashboard");
      }

      setDashboardData({
        stats: result.stats || {},
        revenueTrends: result.revenueTrends || [],
        recentInvoices: result.recentInvoices || [],
      });
    } catch (error) {
      console.error("Failed to refetch dashboard:", error);
    }
  }, []);

  // ==================== INITIAL FETCH ====================
  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/dashboard`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const text = await response.text();
        let result = {};
        try {
          result = text ? JSON.parse(text) : {};
        } catch {
          throw new Error(
            `Server returned empty or invalid JSON (status ${response.status})`
          );
        }

        if (!response.ok) {
          throw new Error(
            result?.message || `Dashboard request failed (${response.status})`
          );
        }

        if (isMounted) {
          setDashboardData({
            stats: result.stats || {},
            revenueTrends: result.revenueTrends || [],
            recentInvoices: result.recentInvoices || [],
          });
        }
      } catch (error) {
        console.error("DASHBOARD ERROR:", error);
        if (isMounted) {
          toast.error(error.message || "Failed to fetch dashboard");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClientUpdated = () => refetchDashboard();
    window.addEventListener("client-updated", handleClientUpdated);
    return () =>
      window.removeEventListener("client-updated", handleClientUpdated);
  }, [refetchDashboard]);

  // ==================== FILTER & SORT RECENT INVOICES ====================
  const filteredRecentInvoices = useMemo(() => {
    let list = [...(dashboardData?.recentInvoices || [])];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((inv) => {
        const invNum = (inv.invoiceNumber || inv.number || "").toLowerCase();
        const client = (
          inv.clientName ||
          inv.client?.name ||
          (typeof inv.client === "string" ? inv.client : "") ||
          ""
        ).toLowerCase();
        return invNum.includes(q) || client.includes(q);
      });
    }

    list.sort((a, b) => {
      const dateA = new Date(
        a.date || a.invoiceDate || a.issueDate || a.createdAt || 0
      ).getTime();
      const dateB = new Date(
        b.date || b.invoiceDate || b.issueDate || b.createdAt || 0
      ).getTime();
      const amountA = Number(a.amount || a.total || 0);
      const amountB = Number(b.amount || b.total || 0);

      switch (sortBy) {
        case "oldest":
          return dateA - dateB;
        case "amount-high":
          return amountB - amountA;
        case "amount-low":
          return amountA - amountB;
        case "newest":
        default:
          return dateB - dateA;
      }
    });

    return list.slice(0, 5);
  }, [dashboardData.recentInvoices, searchQuery, sortBy]);

  // ==================== TABLE COLUMNS ====================
  const invoiceColumns = useMemo(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "INVOICE ID",
        cell: ({ row }) => (
          <span className="font-bold text-text">
            #{row.original.invoiceNumber || row.original.number || "—"}
          </span>
        ),
      },
      {
        header: "CLIENT",
        cell: ({ row }) => {
          const clientName =
            row.original.clientName ||
            row.original.client?.name ||
            (typeof row.original.client === "string" ? row.original.client : null) ||
            "Unknown Client";

          const initials = getInitials(clientName);

          return (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center text-[10px] font-bold shrink-0">
                {initials}
              </div>
              <span className="font-medium text-text-secondary truncate">
                {clientName}
              </span>
            </div>
          );
        },
      },
      {
        header: "DATE ISSUED",
        cell: ({ row }) => {
          const raw =
            row.original.date ||
            row.original.invoiceDate ||
            row.original.issueDate ||
            row.original.createdAt;
          const d = raw ? new Date(raw) : null;
          const isValid = d && !isNaN(d.getTime());

          return (
            <span className="text-text-muted">
              {isValid
                ? d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "—"}
            </span>
          );
        },
      },
      {
        header: "AMOUNT",
        cell: ({ row }) => (
          <span className="font-bold text-text">
            {format(row.original.amount || row.original.total || 0)}
          </span>
        ),
      },
      {
        header: "STATUS",
        cell: ({ row }) => {
          const rawStatus = row.original.status || "draft";
          const status = String(rawStatus).toLowerCase().trim();

          const config = {
            paid: {
              bg: "bg-success-soft",
              text: "text-success",
              dot: "bg-success",
            },
            active: {
              bg: "bg-primary-soft",
              text: "text-primary-dark",
              dot: "bg-primary",
            },
            pending: {
              bg: "bg-warning-soft",
              text: "text-warning",
              dot: "bg-warning",
            },
            overdue: {
              bg: "bg-danger-soft",
              text: "text-danger",
              dot: "bg-danger",
            },
            scheduled: {
              bg: "bg-info-soft",
              text: "text-info",
              dot: "bg-info",
            },
            draft: {
              bg: "bg-surface-secondary",
              text: "text-text-muted",
              dot: "bg-text-light",
            },
          };

          const style = config[status] || config.draft;

          return (
            <span
              className={`
                inline-flex items-center gap-1.5
                px-2.5 py-1 rounded-full
                text-[11px] font-bold uppercase tracking-wider
                ${style.bg} ${style.text}
              `}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {status}
            </span>
          );
        },
      },
      {
        id: "action",
        header: "ACTION",
        cell: ({ row }) => {
          const inv = row.original;
          const invoiceId = inv.id || inv._id;
          const targetClient = inv.client;
          const clientName =
            inv.clientName ||
            inv.client?.name ||
            (typeof targetClient === "string" ? targetClient : "");

          return (
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Preview Invoice"
                onClick={(e) => {
                  e.stopPropagation();
                  if (invoiceId) {
                    navigate(`/composer?invoiceId=${invoiceId}`);
                  } else {
                    toast.error("Invoice ID not found");
                  }
                }}
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

              <button
                type="button"
                title="Client Details"
                onClick={(e) => {
                  e.stopPropagation();
                  openClientDetail(targetClient, clientName);
                }}
                className="
                  w-8 h-8 rounded-lg
                  flex items-center justify-center
                  text-text-light
                  hover:bg-surface-hover hover:text-primary
                  transition
                "
              >
                <span className="material-symbols-outlined text-[18px]">
                  person
                </span>
              </button>
            </div>
          );
        },
      },
    ],
    [format, navigate, openClientDetail]
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
        <div className="xl:col-span-8 min-w-0">
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

            <div className="h-[280px] sm:h-[320px] lg:h-[380px] w-full min-w-0">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={280}
              >
                <BarChart
                  data={dashboardData?.revenueTrends || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
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
        <div className="xl:col-span-4 flex flex-col gap-5 min-w-0">
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
              <span className="material-symbols-outlined text-[120px]">
                bolt
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
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
                onClick={() => navigate("/composer")}
              >
                Batch Bill
              </Button>
              <Button
                variant="ghost"
                icon="query_stats"
                className="h-[88px] flex-col"
                fullWidth
                onClick={() => navigate("/analytics")}
              >
                Analytics
              </Button>
            </div>
          </Card>
        </div>

        {/* RECENT INVOICES TABLE (Fixed: overflow-hidden removed & min-height container added) */}
        <div className="col-span-12">
          <div className="bg-surface border border-border rounded-2xl relative shadow-sm">
            <div className="h-[64px] px-6 flex items-center justify-between border-b border-border relative">
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-bold text-text tracking-tight">
                  Recent Invoices
                </h3>
                <span className="text-xs text-text-muted font-normal">
                  (Showing latest {filteredRecentInvoices.length})
                </span>
              </div>

              {/* Filter Button & Compact Popup Modal */}
              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterModalOpen((prev) => !prev);
                  }}
                  className={`p-2 rounded-lg border transition flex items-center gap-1.5 text-xs font-semibold ${
                    filterModalOpen
                      ? "bg-primary-soft text-primary border-primary/30"
                      : "bg-surface-secondary text-text-muted border-border hover:text-text hover:bg-surface-hover"
                  }`}
                  title="Filter & Sort"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    filter_list
                  </span>
                  <span>Filter</span>
                </button>

                {/* Filter Modal / Popover (High z-index to float freely outside container) */}
                {filterModalOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                      <span className="text-xs font-bold text-text uppercase tracking-wider">
                        Filter & Sort
                      </span>
                      <button
                        type="button"
                        onClick={() => setFilterModalOpen(false)}
                        className="text-text-muted hover:text-text text-sm"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Search Field */}
                    <div className="mb-3">
                      <label className="text-[11px] font-semibold text-text-muted mb-1 block">
                        Search
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="ID or Client name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full text-xs bg-surface-secondary border border-border rounded-lg px-2.5 py-1.5 text-text focus:outline-none focus:border-primary"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1.5 text-xs text-text-muted hover:text-text"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sort Field */}
                    <div className="mb-4">
                      <label className="text-[11px] font-semibold text-text-muted mb-1 block">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full text-xs bg-surface-secondary border border-border rounded-lg px-2.5 py-1.5 text-text focus:outline-none focus:border-primary cursor-pointer font-medium"
                      >
                        <option value="newest">Date: Newest First</option>
                        <option value="oldest">Date: Oldest First</option>
                        <option value="amount-high">Amount: High to Low</option>
                        <option value="amount-low">Amount: Low to High</option>
                      </select>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSortBy("newest");
                        }}
                        className="text-[11px] text-text-muted hover:text-primary transition font-medium"
                      >
                        Reset All
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterModalOpen(false)}
                        className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stable min-height prevents the container from shrinking and clipping the popover */}
            <div className="min-h-[220px]">
              <DataTable
                data={filteredRecentInvoices}
                columns={invoiceColumns}
                loading={loading}
                pagination={pagination}
                setPagination={setPagination}
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                emptyMessage="No matching invoices found"
                hidePagination
              />
            </div>
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