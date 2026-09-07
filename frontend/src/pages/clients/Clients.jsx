import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createColumnHelper } from "@tanstack/react-table";

import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";

import ClientDrawer from "../../components/clients/ClientFormDrawer";
import FilterDrawer from "../../components/clients/FilterDrawer";
import ClientCard from "../../components/clients/ClientCard";
import ClientDetailDrawer from "../../components/clients/ClientDetailDrawer";
import SortDrawer from "../../components/clients/SortDrawer";

import { getClients } from "../../services/clientService";
import useCurrency from "../../hooks/useCurrency";

const DEFAULT_PAGE_SIZE = 9;
const PAGE_SIZES = [6, 9, 12, 18, 24, 50];

const EMPTY_FILTERS = {
  status: [],
  billing: [],
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
};

const DEFAULT_SORT = {
  field: "",
  direction: "asc",
};

const SORT_COLUMNS = [
  { id: "name", label: "Client Name", type: "string" },
  { id: "billing", label: "Billing", type: "string" },
  { id: "status", label: "Status", type: "string" },
  { id: "mrr", label: "MRR", type: "number" },
  { id: "nextInvoice", label: "Next Invoice", type: "date" },
];

const columnHelper = createColumnHelper();

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const getClientId = (client) => client?._id ?? client?.id;

const getClientInitials = (client) =>
  client?.initials ||
  String(client?.name ?? "")
    .trim()
    .slice(0, 2)
    .toUpperCase() ||
  "CL";

const getStatusBadge = (status) => {
  switch (normalize(status)) {
    case "active":
      return "bg-primary-soft text-primary-dark";
    case "pending":
      return "bg-warning-soft text-warning";
    case "inactive":
      return "bg-surface-secondary text-text-muted";
    default:
      return "bg-surface-secondary text-text-muted";
  }
};

const getBillingBadge = (billing) => {
  switch (normalize(billing)) {
    case "monthly":
      return "bg-primary-soft text-primary-dark";
    case "annual":
      return "bg-surface-secondary text-text-secondary";
    case "quarterly":
      return "bg-info-soft text-info";
    default:
      return "bg-surface-secondary text-text-secondary";
  }
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseDateBoundary = (value, endOfDay = false) => {
  if (!value) return null;
  const date = new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`
  );
  return Number.isNaN(date.getTime()) ? null : date;
};

const compareValues = (a, b, type, direction) => {
  const multiplier = direction === "desc" ? -1 : 1;

  if (type === "number") {
    return (Number(a ?? 0) - Number(b ?? 0)) * multiplier;
  }

  if (type === "date") {
    const aTime = parseDate(a)?.getTime() ?? 0;
    const bTime = parseDate(b)?.getTime() ?? 0;
    return (aTime - bTime) * multiplier;
  }

  return (
    String(a ?? "").localeCompare(String(b ?? ""), undefined, {
      sensitivity: "base",
      numeric: true,
    }) * multiplier
  );
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);

  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false);
  const [clientDetailDrawerOpen, setClientDetailDrawerOpen] =
    useState(false);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortConfig, setSortConfig] = useState(DEFAULT_SORT);
  const [view, setView] = useState("list");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const { format, selectedCurrency } = useCurrency();

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getClients();
      const clientList = Array.isArray(response?.clients)
        ? response.clients
        : [];
      setClients(clientList);
    } catch (error) {
      console.error("Failed to load clients:", error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await getClients();
        const clientList = Array.isArray(response?.clients)
          ? response.clients
          : [];
        if (isMounted) setClients(clientList);
      } catch (error) {
        console.error("Failed to load clients:", error);
        if (isMounted) setClients([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const handleClientUpdated = () => {
      void loadClients();
    };

    void load();
    window.addEventListener("client-updated", handleClientUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("client-updated", handleClientUpdated);
    };
  }, [loadClients]);

  const openCreate = useCallback(() => {
    setEditingClient(null);
    setFormDrawerOpen(true);
  }, []);

  const openEdit = useCallback((client) => {
    if (!client) return;
    setEditingClient(client);
    setFormDrawerOpen(true);
    setClientDetailDrawerOpen(false);
  }, []);

  const handleRowClick = useCallback((client) => {
    if (!client) return;
    setSelectedClient(client);
    setClientDetailDrawerOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormDrawerOpen(false);
    setEditingClient(null);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  const handleFilterOpen = useCallback(() => {
    setFilterDrawerOpen(true);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterDrawerOpen(false);
  }, []);

  const handleSortOpen = useCallback(() => {
    setSortDrawerOpen(true);
  }, []);

  const handleSortClose = useCallback(() => {
    setSortDrawerOpen(false);
  }, []);

  const handleDetailClose = useCallback(() => {
    setClientDetailDrawerOpen(false);
  }, []);

  const handleViewChange = useCallback((nextView) => {
    setView(nextView);
  }, []);

  const processedData = useMemo(() => {
    const searchTerm = normalize(search);
    const rate = Number(selectedCurrency?.rate) || 1;

    const filtered = clients.filter((client) => {
      if (searchTerm) {
        const searchableText = [client?.name, client?.email]
          .map(normalize)
          .join(" ");
        if (!searchableText.includes(searchTerm)) return false;
      }

      const matchesStatus =
        filters.status.length === 0 ||
        filters.status.includes(client?.status);

      const matchesBilling =
        filters.billing.length === 0 ||
        filters.billing.includes(client?.billing);

      const amount = Number(client?.mrr) || 0;
      const convertedAmount = amount * rate;

      const minAmount =
        filters.minAmount === "" ? null : Number(filters.minAmount);
      const maxAmount =
        filters.maxAmount === "" ? null : Number(filters.maxAmount);

      const matchesMinAmount =
        minAmount === null ||
        (Number.isFinite(minAmount) && convertedAmount >= minAmount);

      const matchesMaxAmount =
        maxAmount === null ||
        (Number.isFinite(maxAmount) && convertedAmount <= maxAmount);

      if (!matchesMinAmount || !matchesMaxAmount) return false;

      const invoiceDate = parseDate(client?.nextInvoice);

      if (filters.fromDate) {
        const fromDate = parseDateBoundary(filters.fromDate);
        if (!invoiceDate || !fromDate || invoiceDate < fromDate) return false;
      }

      if (filters.toDate) {
        const toDate = parseDateBoundary(filters.toDate, true);
        if (!invoiceDate || !toDate || invoiceDate > toDate) return false;
      }

      return matchesStatus && matchesBilling;
    });

    if (!sortConfig.field) return filtered;

    const sortType =
      SORT_COLUMNS.find((column) => column.id === sortConfig.field)?.type ||
      "string";

    return [...filtered].sort((a, b) =>
      compareValues(
        a?.[sortConfig.field],
        b?.[sortConfig.field],
        sortType,
        sortConfig.direction
      )
    );
  }, [clients, filters, search, selectedCurrency?.rate, sortConfig]);

  useEffect(() => {
    setPagination((previous) =>
      previous.pageIndex === 0
        ? previous
        : { ...previous, pageIndex: 0 }
    );
  }, [search, filters, sortConfig]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(processedData.length / pagination.pageSize)
    );

    setPagination((previous) => {
      const maxPageIndex = totalPages - 1;
      if (previous.pageIndex <= maxPageIndex) return previous;
      return { ...previous, pageIndex: maxPageIndex };
    });
  }, [processedData.length, pagination.pageSize]);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const totalMRR = clients.reduce(
      (sum, client) => sum + (Number(client?.mrr) || 0),
      0
    );
    const activeClients = clients.filter(
      (client) => normalize(client?.status) === "active"
    ).length;
    const pendingClients = clients.filter(
      (client) => normalize(client?.status) === "pending"
    ).length;
    const retentionRate =
      totalClients > 0
        ? ((activeClients / totalClients) * 100).toFixed(1)
        : "0.0";

    return [
      {
        title: "TOTAL CLIENTS",
        value: totalClients,
        change: `${activeClients} Active`,
        icon: "group",
        iconColor: "text-primary",
        changeColor: "text-primary-dark",
        type: "progress",
      },
      {
        title: "MONTHLY RECURRING",
        value: format(totalMRR),
        change: `${totalClients} Accounts`,
        icon: "payments",
        iconColor: "text-info",
        changeColor: "text-info",
        type: "bars",
      },
      {
        title: "RETENTION RATE",
        value: `${retentionRate}%`,
        change: `${activeClients}/${totalClients}`,
        icon: "recommend",
        iconColor: "text-warning",
        changeColor: "text-warning",
        type: "progress",
      },
      {
        title: "PENDING CLIENTS",
        value: pendingClients,
        change: pendingClients > 0 ? "Needs Review" : "All Clear",
        icon: "warning",
        iconColor: "text-danger",
        changeColor: "text-danger",
        type: "danger",
      },
    ];
  }, [clients, format]);

  const totalPages = Math.max(
    1,
    Math.ceil(processedData.length / pagination.pageSize)
  );
  const startIndex = pagination.pageIndex * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;

  const paginatedCards = useMemo(
    () => processedData.slice(startIndex, endIndex),
    [processedData, startIndex, endIndex]
  );

  const handlePageSizeChange = useCallback((event) => {
    const pageSize = Number(event.target.value);
    if (!PAGE_SIZES.includes(pageSize)) return;
    setPagination({ pageIndex: 0, pageSize });
  }, []);

  const goToPreviousPage = useCallback(() => {
    setPagination((previous) => ({
      ...previous,
      pageIndex: Math.max(previous.pageIndex - 1, 0),
    }));
  }, []);

  const goToNextPage = useCallback(() => {
    setPagination((previous) => ({
      ...previous,
      pageIndex: Math.min(previous.pageIndex + 1, totalPages - 1),
    }));
  }, [totalPages]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Client Name",
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className={`
                  grid h-10 w-10 shrink-0 place-items-center
                  rounded-full border border-border
                  text-xs font-bold
                  ${client?.color || "bg-surface-secondary text-text-muted"}
                `}
              >
                {getClientInitials(client)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-text">
                  {client?.name || "Unnamed Client"}
                </div>
                <div className="truncate text-xs text-text-muted">
                  {client?.email || "No email"}
                </div>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor("billing", {
        header: "Billing",
        cell: ({ getValue }) => {
          const billing = getValue();
          return (
            <span
              className={`
                inline-flex rounded-full px-2.5 py-1
                text-xs font-medium
                ${getBillingBadge(billing)}
              `}
            >
              {billing || "N/A"}
            </span>
          );
        },
      }),

      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <span
              className={`
                inline-flex items-center gap-1.5
                rounded-full px-2.5 py-1
                text-[11px] font-bold uppercase tracking-wider
                ${getStatusBadge(status)}
              `}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
              />
              {status || "Unknown"}
            </span>
          );
        },
      }),

      columnHelper.accessor("mrr", {
        header: "MRR",
        cell: ({ getValue }) => {
          const amount = Number(getValue()) || 0;
          return (
            <div className="text-right font-bold text-text">
              {format(amount)}
            </div>
          );
        },
      }),

      columnHelper.accessor("nextInvoice", {
        header: "Next Invoice",
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <div className="text-sm font-medium text-text-secondary">
              {value || "Pending setup"}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const client = row.original;

          const handleEdit = (event) => {
            event.stopPropagation();
            openEdit(client);
          };

          const handleViewDetails = (event) => {
            event.stopPropagation();
            handleRowClick(client);
          };

          return (
            <div className="text-right">
              <div className="inline-flex items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <button
                  type="button"
                  aria-label={`Edit ${client?.name || "client"}`}
                  className="
                    rounded-md p-1.5
                    text-text-light
                    transition-colors
                    hover:bg-surface-hover hover:text-primary
                    focus:outline-none focus:ring-2 focus:ring-primary/30
                  "
                  onClick={handleEdit}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>
                </button>

                <button
                  type="button"
                  className="
                    rounded-lg px-3 py-1.5
                    text-xs font-semibold text-primary
                    transition-colors hover:bg-primary-soft
                    focus:outline-none focus:ring-2 focus:ring-primary/30
                  "
                  onClick={handleViewDetails}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        },
      }),
    ],
    [format, handleRowClick, openEdit]
  );

  const activeClients = useMemo(
    () =>
      clients.filter((client) => normalize(client?.status) === "active")
        .length,
    [clients]
  );

  return (
    <main className="mx-auto w-full max-w-[1600px] flex-1 pt-2 pb-12">
      <SectionHeader
        title="Clients"
        description={`Manage ${activeClients} Active organizational relationships.`}
        secondaryAction={{
          label: "Filter",
          icon: "filter_list",
          onClick: handleFilterOpen,
        }}
        primaryAction={{
          label: "Add Client",
          icon: "person_add",
          onClick: openCreate,
        }}
      />

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} variant="dashboard" />
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <label htmlFor="client-search" className="sr-only">
              Search clients
            </label>
            <span
              aria-hidden="true"
              className="
                material-symbols-outlined
                absolute left-3 top-1/2 -translate-y-1/2
                text-[18px] text-text-light
              "
            >
              search
            </span>
            <input
              id="client-search"
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search clients..."
              autoComplete="off"
              className="
                w-64 rounded-lg border border-border
                bg-surface py-2 pl-10 pr-3 text-sm outline-none
                transition
                focus:border-primary
                focus:ring-2 focus:ring-primary/20
              "
            />
          </div>

          <button
            type="button"
            onClick={handleFilterOpen}
            aria-label="Open client filters"
            className="
              flex items-center gap-2 rounded-lg
              border border-border bg-surface
              px-3.5 py-2 text-sm font-medium text-text
              transition hover:bg-surface-hover
              focus:outline-none focus:ring-2 focus:ring-primary/30
            "
          >
            <span className="material-symbols-outlined text-[18px]">
              tune
            </span>
            Filter
          </button>

          <button
            type="button"
            onClick={handleSortOpen}
            aria-label="Open client sorting options"
            className="
              flex items-center gap-2 rounded-lg
              border border-border bg-surface
              px-3.5 py-2 text-sm font-medium text-text
              transition hover:bg-surface-hover
              focus:outline-none focus:ring-2 focus:ring-primary/30
            "
          >
            <span className="material-symbols-outlined text-[18px]">
              sort
            </span>
            Sort
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">View:</span>
          <div
            className="flex rounded-lg bg-surface-secondary p-1"
            role="group"
            aria-label="Client view"
          >
            <button
              type="button"
              onClick={() => handleViewChange("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
              className={`
                rounded-md p-1.5 transition
                focus:outline-none focus:ring-2 focus:ring-primary/30
                ${
                  view === "list"
                    ? "bg-surface text-primary shadow-sm"
                    : "text-text-light hover:text-text-muted"
                }
              `}
            >
              <span className="material-symbols-outlined text-[18px]">
                list
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleViewChange("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              className={`
                rounded-md p-1.5 transition
                focus:outline-none focus:ring-2 focus:ring-primary/30
                ${
                  view === "grid"
                    ? "bg-surface text-primary shadow-sm"
                    : "text-text-light hover:text-text-muted"
                }
              `}
            >
              <span className="material-symbols-outlined text-[18px]">
                grid_view
              </span>
            </button>
          </div>
        </div>
      </div>

      {view === "list" ? (
        <DataTable
          data={processedData}
          columns={columns}
          pagination={pagination}
          setPagination={setPagination}
          emptyMessage={
            isLoading ? "Loading clients..." : "No clients found"
          }
          pageSizes={PAGE_SIZES}
          onRowClick={handleRowClick}
        />
      ) : (
        <>
          {isLoading ? (
            <div
              className="rounded-xl border border-border bg-surface p-12 text-center"
              role="status"
              aria-live="polite"
            >
              <span className="material-symbols-outlined animate-spin text-4xl text-text-light">
                progress_activity
              </span>
              <p className="mt-2 text-sm text-text-muted">
                Loading clients...
              </p>
            </div>
          ) : processedData.length === 0 ? (
            <div
              className="rounded-xl border border-border bg-surface p-12 text-center"
              role="status"
            >
              <div aria-hidden="true" className="mb-2 text-text-light">
                <span className="material-symbols-outlined text-4xl">
                  group_off
                </span>
              </div>
              <h3 className="text-sm font-semibold text-text">
                No clients found
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {paginatedCards.map((client) => (
                <ClientCard
                  key={getClientId(client)}
                  client={client}
                  onClick={() => handleRowClick(client)}
                />
              ))}
            </div>
          )}

          {processedData.length > 0 && !isLoading && (
            <div
              className="
                mt-6 flex flex-col gap-4 rounded-xl
                border border-border bg-surface
                px-6 py-4 lg:flex-row
                lg:items-center lg:justify-between
              "
            >
              <p className="text-sm text-text-muted">
                Showing{" "}
                <span className="mx-1 font-semibold text-text">
                  {startIndex + 1}
                </span>
                -
                <span className="mx-1 font-semibold text-text">
                  {Math.min(endIndex, processedData.length)}
                </span>
                of
                <span className="mx-1 font-semibold text-text">
                  {processedData.length}
                </span>
                clients
              </p>

              <div className="flex items-center gap-3">
                <label htmlFor="client-page-size" className="sr-only">
                  Clients per page
                </label>
                <select
                  id="client-page-size"
                  value={pagination.pageSize}
                  onChange={handlePageSizeChange}
                  className="
                    h-9 rounded-lg border border-border
                    bg-surface px-3 text-sm text-text
                    focus:outline-none focus:ring-2 focus:ring-primary/30
                  "
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>

                <div
                  className="flex items-center rounded-xl bg-surface-secondary p-1"
                  aria-label="Pagination"
                >
                  <button
                    type="button"
                    onClick={goToPreviousPage}
                    disabled={pagination.pageIndex === 0}
                    aria-label="Previous page"
                    className="
                      grid h-9 w-9 place-items-center rounded-lg
                      text-text-muted
                      disabled:cursor-not-allowed disabled:opacity-40
                      focus:outline-none focus:ring-2 focus:ring-primary/30
                    "
                  >
                    <span className="material-symbols-outlined">
                      chevron_left
                    </span>
                  </button>

                  <span
                    className="min-w-[80px] px-4 text-center text-sm font-semibold text-text"
                    aria-current="page"
                  >
                    {pagination.pageIndex + 1} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={goToNextPage}
                    disabled={pagination.pageIndex >= totalPages - 1}
                    aria-label="Next page"
                    className="
                      grid h-9 w-9 place-items-center rounded-lg
                      text-text-muted
                      disabled:cursor-not-allowed disabled:opacity-40
                      focus:outline-none focus:ring-2 focus:ring-primary/30
                    "
                  >
                    <span className="material-symbols-outlined">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <ClientDrawer
        isOpen={formDrawerOpen}
        onClose={handleFormClose}
        client={editingClient}
      />

      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={handleFilterClose}
        filters={filters}
        setFilters={setFilters}
      />

      <SortDrawer
        isOpen={sortDrawerOpen}
        onClose={handleSortClose}
        columns={SORT_COLUMNS}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />

      <ClientDetailDrawer
        isOpen={clientDetailDrawerOpen}
        onClose={handleDetailClose}
        client={selectedClient}
        onEdit={openEdit}
      />
    </main>
  );
}