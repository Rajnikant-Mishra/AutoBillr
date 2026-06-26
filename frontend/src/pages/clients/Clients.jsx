import React, { useState, useEffect, useMemo,useCallback } from "react";
import SectionHeader from "../../components/ui/SectionHeader";
import ClientDrawer from "../../components/clients/ClientFormDrawer";
import FilterDrawer from "../../components/clients/FilterDrawer";
import ClientDetailDrawer from "../../components/clients/ClientDetailDrawer";
import { createClient, updateClient } from "../../services/clientService";
import StatCard from "../../components/ui/StatCard";
import { getClients } from "../../services/clientService";
import {
  createColumnHelper,
} from "@tanstack/react-table";
import SortDrawer from "../../components/clients/SortDrawer";
import ClientCard from "../../components/clients/ClientCard";
import DataTable from "../../components/ui/DataTable";
import useCurrency from "../../hooks/useCurrency";

const columnHelper = createColumnHelper();

export default function Clients() {
  // State
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
const [formDrawerOpen, setFormDrawerOpen] = useState(false);
const [editingClient, setEditingClient] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: [],
    billing: [],
    fromDate: "",
    toDate: "",
    minAmount: "",
    maxAmount: "",
  });

  const [sortConfig, setSortConfig] = useState({ field: "", direction: "asc" });
  
  const [view, setView] = useState("list");
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [sortDrawer, setSortDrawer] = useState(false);
  const [clientDetailDrawer, setClientDetailDrawer] = useState(false);
  const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: 9,
});
const {
  format,
  selectedCurrency,
} = useCurrency();
const sortColumns = [
  {
    id: "name",
    label: "Client Name",
    type: "string",
  },
  {
    id: "billing",
    label: "Billing",
    type: "string",
  },
  {
    id: "status",
    label: "Status",
    type: "string",
  },
  {
    id: "mrr",
    label: "MRR",
    type: "number",
  },
  {
    id: "nextInvoice",
    label: "Next Invoice",
    type: "date",
  },
];
// Open for create
const openCreate = () => {
  setEditingClient(null);
  setFormDrawerOpen(true);
};

// Open for edit
const openEdit = useCallback((client) => {
  setEditingClient(client);
  setFormDrawerOpen(true);
}, []);
  // Load Clients
const loadClients = async () => {
  try {
    const res = await getClients();


    setClients(res.data?.clients || []);
  } catch (err) {
    console.error("Failed to load clients:", err);
    setClients([]);
  }
};

useEffect(() => {
  loadClients();

  const handleClientUpdated = () => {
    loadClients();
  };

  window.addEventListener(
    "client-updated",
    handleClientUpdated
  );

  return () => {
    window.removeEventListener(
      "client-updated",
      handleClientUpdated
    );
  };
}, []);




  // Memoized Filtered & Sorted Data
  const processedData = useMemo(() => {
    let data = [...clients];

    // Search Filter
    if (search) {
      const term = search.toLowerCase();
      data = data.filter(
        (client) =>
          client.name?.toLowerCase().includes(term) ||
          client.email?.toLowerCase().includes(term)
      );
    }

    // Advanced Filters
    data = data.filter((client) => {
  const matchesStatus =
    filters.status.length === 0 ||
    filters.status.includes(client.status);

  const matchesBilling =
    filters.billing.length === 0 ||
    filters.billing.includes(client.billing);

  const amount =
    Number(client.mrr || 0) *
    (selectedCurrency?.rate || 1);

  const matchesMinAmount =
    !filters.minAmount ||
    amount >= Number(filters.minAmount);

  const matchesMaxAmount =
    !filters.maxAmount ||
    amount <= Number(filters.maxAmount);

  const invoiceDate = client.nextInvoice
    ? new Date(client.nextInvoice)
    : null;

  const matchesFromDate =
    !filters.fromDate ||
    (invoiceDate &&
      invoiceDate >= new Date(filters.fromDate));

  const matchesToDate =
    !filters.toDate ||
    (invoiceDate &&
      invoiceDate <= new Date(filters.toDate));

  return (
    matchesStatus &&
    matchesBilling &&
    matchesMinAmount &&
    matchesMaxAmount &&
    matchesFromDate &&
    matchesToDate
  );
});

    // Sorting
    if (sortConfig.field) {
      data.sort((a, b) => {
        let aVal = a[sortConfig.field];
        let bVal = b[sortConfig.field];

        if (typeof aVal === "number" || typeof bVal === "number") {
          return sortConfig.direction === "asc"
            ? Number(aVal || 0) - Number(bVal || 0)
            : Number(bVal || 0) - Number(aVal || 0);
        }

        if (aVal instanceof Date || bVal instanceof Date || !isNaN(Date.parse(aVal))) {
          return sortConfig.direction === "asc"
            ? new Date(aVal) - new Date(bVal)
            : new Date(bVal) - new Date(aVal);
        }

        return sortConfig.direction === "asc"
          ? String(aVal || "").localeCompare(String(bVal || ""))
          : String(bVal || "").localeCompare(String(aVal || ""));
      });
    }

    return data;
}, [
  clients,
  search,
  filters,
  sortConfig,
  selectedCurrency,
]);

  // Badge Helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case "active": return "bg-teal-50 text-teal-700";
      case "pending": return "bg-amber-50 text-amber-700";
      case "inactive": return "bg-slate-100 text-slate-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getBillingBadge = (billing) => {
    switch (billing) {
      case "Monthly": return "bg-teal-50 text-teal-700";
      case "Annual": return "bg-slate-100 text-slate-700";
      case "Quarterly": return "bg-indigo-50 text-indigo-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  // Columns Definition (Memoized)
  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Client Name",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full grid place-items-center font-bold text-xs border border-slate-200 ${client.color || 'bg-slate-100'}`}>
              {client.initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{client.name}</div>
              <div className="text-xs text-slate-500">{client.email}</div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("billing", {
      header: "Billing",
      cell: ({ getValue }) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getBillingBadge(getValue())}`}>
          {getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusBadge(getValue())}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
          {getValue()}
        </span>
      ),
    }),
   columnHelper.accessor("mrr", {
  header: "MRR",
  cell: ({ getValue }) => (
    <div className="text-right font-bold">
      {format(Number(getValue() || 0))}
    </div>
  ),
}),
    columnHelper.accessor("nextInvoice", {
      header: "Next Invoice",
      cell: ({ getValue }) => (
        <div className="text-sm font-medium text-slate-700">
          {getValue() || "Pending setup"}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="text-right">
          <div className="opacity-0 group-hover:opacity-100 transition inline-flex gap-1">
            <button className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-md"  onClick={(e) => {
          e.stopPropagation();
          openEdit(row.original);
        }}>
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-50 rounded-lg">
              View Details
            </button>
          </div>
        </div>
      ),
    }),
  ], [openEdit, format]);

 


const totalClients = clients.length;

const totalMRR = clients.reduce(
  (sum, client) =>
    sum + Number(client.mrr || 0),
  0
);

const activeClients = clients.filter(
  (client) => client.status?.toLowerCase() === "active"
).length;

const pendingClients = clients.filter(
  (client) => client.status?.toLowerCase() === "pending"
).length;

const retentionRate =
  totalClients > 0
    ? ((activeClients / totalClients) * 100).toFixed(1)
    : "0.0";


   const stats = [
  {
    title: "TOTAL CLIENTS",
    value: totalClients,
    change: `${activeClients} Active`,
    icon: "group",
    iconColor: "text-teal-600",
    changeColor: "text-teal-700",
    type: "progress",
  },

 {
  title: "MONTHLY RECURRING",
  value: format(totalMRR),
  change: `${totalClients} Accounts`,
  icon: "payments",
  iconColor: "text-indigo-600",
  changeColor: "text-indigo-600",
  type: "bars",
},

  {
    title: "RETENTION RATE",
    value: `${retentionRate}%`,
    change: `${activeClients}/${totalClients}`,
    icon: "recommend",
    iconColor: "text-amber-600",
    changeColor: "text-amber-600",
    type: "progress",
  },

  {
    title: "PENDING CLIENTS",
    value: pendingClients,
    change: pendingClients > 0 ? "Needs Review" : "All Clear",
    icon: "warning",
    iconColor: "text-rose-600",
    changeColor: "text-rose-600",
    type: "danger",
  },
];
const start = pagination.pageIndex * pagination.pageSize;
const end = start + pagination.pageSize;

const paginatedCards = processedData.slice(start, end);


useEffect(() => {
  setPagination((prev) => ({
    ...prev,
    pageIndex: 0,
  }));
}, [search, filters, sortConfig]);
  return (
    <main className="flex-1 pt-2 pb-12 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <SectionHeader
        title="Clients"
        description={`Manage ${activeClients} Active organizational relationships.`}
        secondaryAction={{ label: "Filter", icon: "filter_list", onClick: () => setFilterDrawer(true) }}
        primaryAction={{ label: "Add Client", icon: "person_add", onClick: openCreate }}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {stats.map((item, index) => (
          <StatCard key={index} {...item} variant="dashboard" />
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none w-64"
            />
          </div>

          <button
            onClick={() => setFilterDrawer(true)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filter
          </button>

          <button
            onClick={() => setSortDrawer(true)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">sort</span>
            Sort
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">View:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
  onClick={() => setView("list")}
  className={`p-1.5 rounded-md ${
    view === "list"
      ? "bg-white text-teal-600 shadow-sm"
      : "text-slate-400"
  }`}
>
  <span className="material-symbols-outlined text-[18px]">
    list
  </span>
</button>

<button
  onClick={() => setView("grid")}
  className={`p-1.5 rounded-md ${
    view === "grid"
      ? "bg-white text-teal-600 shadow-sm"
      : "text-slate-400"
  }`}
>
  <span className="material-symbols-outlined text-[18px]">
    grid_view
  </span>
</button>
          </div>
        </div>
      </div>

   {/* Table / Grid View */}
{view === "list" ? (
  <DataTable
    data={processedData}
    columns={columns}
    pagination={pagination}
    setPagination={setPagination}
    emptyMessage="No clients found"
    pageSizes={[6, 9, 12, 18, 24, 50]}
    onRowClick={(client) => {
      setSelectedClient(client);
      setClientDetailDrawer(true);
    }}
  />
) : (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {paginatedCards.map((client) => (
        <ClientCard
          key={client._id}
          client={client}
          onClick={() => {
            setSelectedClient(client);
            setClientDetailDrawer(true);
          }}
        />
      ))}
    </div>

    {/* Grid Footer */}
    <div className="mt-6 bg-white border border-slate-100 rounded-xl px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

      <p className="text-sm text-slate-500">
        Showing
        <span className="font-semibold text-slate-900 mx-1">
          {start + 1}
        </span>
        -
        <span className="font-semibold text-slate-900 mx-1">
          {Math.min(end, processedData.length)}
        </span>
        of
        <span className="font-semibold text-slate-900 mx-1">
          {processedData.length}
        </span>
        clients
      </p>

      <div className="flex items-center gap-3">

        <select
          value={pagination.pageSize}
          onChange={(e) =>
            setPagination({
              pageIndex: 0,
              pageSize: Number(e.target.value),
            })
          }
          className="h-9 px-3 rounded-lg border border-slate-200"
        >
          {[6, 9, 12, 18, 24, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <div className="flex items-center bg-slate-100 rounded-xl p-1">

          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: Math.max(prev.pageIndex - 1, 0),
              }))
            }
            disabled={pagination.pageIndex === 0}
            className="h-9 w-9 disabled:opacity-40"
          >
            <span className="material-symbols-outlined">
              chevron_left
            </span>
          </button>

          <span className="px-4 text-sm font-semibold">
            {pagination.pageIndex + 1}
          </span>

          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex + 1,
              }))
            }
            disabled={
              (pagination.pageIndex + 1) *
                pagination.pageSize >=
              processedData.length
            }
            className="h-9 w-9 disabled:opacity-40"
          >
            <span className="material-symbols-outlined">
              chevron_right
            </span>
          </button>

        </div>

      </div>
    </div>
  </>
)}

  
  





      {/* Drawers */}
      <ClientDrawer isOpen={formDrawerOpen}
  onClose={() => {
    setFormDrawerOpen(false);
    setEditingClient(null);   // important
  }}
  client={editingClient} />
      <FilterDrawer isOpen={filterDrawer} onClose={() => setFilterDrawer(false)} filters={filters} setFilters={setFilters} />
      <SortDrawer isOpen={sortDrawer} onClose={() => setSortDrawer(false)} columns={sortColumns} sortConfig={sortConfig} setSortConfig={setSortConfig} />
      <ClientDetailDrawer  isOpen={clientDetailDrawer}
  onClose={() => setClientDetailDrawer(false)}
  client={selectedClient}
  onEdit={openEdit} />
    </main>
  );
}











