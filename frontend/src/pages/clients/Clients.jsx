import {
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

import {
  showErrorToast,
} from "../../components/ui/CustomToast";

import {
  getClients,
} from "../../services/clientService";

/* =========================================================
   PAGINATION
========================================================= */

const DEFAULT_PAGE_SIZE = 9;

const PAGE_SIZES = [
  5,
  10,
  30,
  50,
];

/* =========================================================
   FILTERS
========================================================= */

const EMPTY_FILTERS = {
  status: [],
  fromDate: "",
  toDate: "",
};

/* =========================================================
   SORT
========================================================= */

const DEFAULT_SORT = {
  field: "",
  direction: "asc",
};

/* =========================================================
   SORT COLUMNS

   Billing / MRR / Next Invoice intentionally removed.
   Billing information belongs to Project.
========================================================= */

const SORT_COLUMNS = [
  {
    id: "name",
    label: "Client Name",
    type: "string",
  },
  {
    id: "country",
    label: "Country",
    type: "string",
  },
  {
    id: "stateRegion",
    label: "State",
    type: "string",
  },
  {
    id: "city",
    label: "City",
    type: "string",
  },
  {
    id: "postalCode",
    label: "Pincode",
    type: "string",
  },
  {
    id: "phone",
    label: "Phone Number",
    type: "string",
  },
  {
    id: "status",
    label: "Status",
    type: "string",
  },
];

const columnHelper = createColumnHelper();

/* =========================================================
   HELPERS
========================================================= */

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getClientId = (client) =>
  client?._id ??
  client?.id ??
  null;

const getClientInitials = (client) =>
  client?.initials ||
  String(client?.name ?? "")
    .trim()
    .slice(0, 2)
    .toUpperCase() ||
  "CL";

/* =========================================================
   STATUS BADGE
========================================================= */

const getStatusBadge = (status) => {
  switch (normalize(status)) {
    case "active":
      return [
        "bg-[var(--color-primary-soft)]",
        "text-[var(--color-primary-dark)]",
      ].join(" ");

    case "pending":
      return [
        "bg-[var(--color-warning-soft)]",
        "text-[var(--color-warning-hover)]",
      ].join(" ");

    case "inactive":
      return [
        "bg-[var(--color-surface-secondary)]",
        "text-[var(--color-text-muted)]",
      ].join(" ");

    case "archived":
      return [
        "bg-[var(--color-surface-secondary)]",
        "text-[var(--color-text-light)]",
      ].join(" ");

    default:
      return [
        "bg-[var(--color-surface-secondary)]",
        "text-[var(--color-text-muted)]",
      ].join(" ");
  }
};

/* =========================================================
   DATE HELPERS
========================================================= */

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

const parseDateBoundary = (
  value,
  endOfDay = false
) => {
  if (!value) {
    return null;
  }

  const date = new Date(
    `${value}T${
      endOfDay
        ? "23:59:59.999"
        : "00:00:00"
    }`
  );

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

/* =========================================================
   SORT COMPARISON
========================================================= */

const compareValues = (
  a,
  b,
  type,
  direction
) => {
  const multiplier =
    direction === "desc"
      ? -1
      : 1;

  if (type === "date") {
    const aTime =
      parseDate(a)?.getTime() ?? 0;

    const bTime =
      parseDate(b)?.getTime() ?? 0;

    return (
      (aTime - bTime) *
      multiplier
    );
  }

  return (
    String(a ?? "").localeCompare(
      String(b ?? ""),
      undefined,
      {
        sensitivity: "base",
        numeric: true,
      }
    ) * multiplier
  );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function Clients() {
  /* =======================================================
     CLIENT STATE
  ======================================================= */

  const [clients, setClients] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  /* =======================================================
     SELECTED / EDITING CLIENT
  ======================================================= */

  const [
    selectedClient,
    setSelectedClient,
  ] = useState(null);

  const [
    editingClient,
    setEditingClient,
  ] = useState(null);

  /* =======================================================
     DRAWERS
  ======================================================= */

  const [
    formDrawerOpen,
    setFormDrawerOpen,
  ] = useState(false);

  const [
    filterDrawerOpen,
    setFilterDrawerOpen,
  ] = useState(false);

  const [
    sortDrawerOpen,
    setSortDrawerOpen,
  ] = useState(false);

  const [
    clientDetailDrawerOpen,
    setClientDetailDrawerOpen,
  ] = useState(false);

  /* =======================================================
     SEARCH / FILTER / SORT
  ======================================================= */

  const [search, setSearch] =
    useState("");

  const [filters, setFilters] =
    useState(EMPTY_FILTERS);

  const [sortConfig, setSortConfig] =
    useState(DEFAULT_SORT);

  /* =======================================================
     VIEW
  ======================================================= */

  const [view, setView] =
    useState("list");

  /* =======================================================
     PAGINATION
  ======================================================= */

  const [pagination, setPagination] =
    useState({
      pageIndex: 0,
      pageSize: DEFAULT_PAGE_SIZE,
    });

  /* =========================================================
     LOAD CLIENTS
  ========================================================= */

  const loadClients = useCallback(
    async () => {
      setIsLoading(true);

      try {
        const response =
          await getClients();

        /*
         * Supports:
         *
         * { clients: [...] }
         *
         * and:
         *
         * { data: { clients: [...] } }
         */

        const clientList =
          Array.isArray(
            response?.clients
          )
            ? response.clients
            : Array.isArray(
                response?.data?.clients
              )
            ? response.data.clients
            : [];

        setClients(clientList);
      } catch (error) {
        console.error(
          "Failed to load clients:",
          error
        );

        setClients([]);

        showErrorToast(
          "Failed to load clients."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /* =========================================================
     INITIAL LOAD + CLIENT UPDATE EVENT
  ========================================================= */

  useEffect(() => {
    void loadClients();

    const handleClientUpdated =
      () => {
        void loadClients();
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
  }, [loadClients]);

  /* =========================================================
     CREATE CLIENT
  ========================================================= */

  const openCreate =
    useCallback(() => {
      setEditingClient(null);
      setFormDrawerOpen(true);
    }, []);

  /* =========================================================
     EDIT CLIENT
  ========================================================= */

  const openEdit =
    useCallback((client) => {
      if (!client) {
        return;
      }

      setEditingClient(client);
      setFormDrawerOpen(true);

      setClientDetailDrawerOpen(
        false
      );
    }, []);

  /* =========================================================
     VIEW CLIENT
  ========================================================= */

  const handleRowClick =
    useCallback((client) => {
      if (!client) {
        return;
      }

      setSelectedClient(client);

      setClientDetailDrawerOpen(
        true
      );
    }, []);

  /* =========================================================
     DELETE CLIENT

     Delete API is not connected yet.
========================================================= */

  const handleDeleteClient =
    useCallback((client) => {
      if (!client) {
        return;
      }

      console.warn(
        "Delete client requested:",
        getClientId(client)
      );

      showErrorToast(
        "Delete client API is not connected yet."
      );
    }, []);

  /* =========================================================
     FORM CLOSE
  ========================================================= */

  const handleFormClose =
    useCallback(() => {
      setFormDrawerOpen(false);
      setEditingClient(null);
    }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearchChange =
    useCallback((event) => {
      setSearch(
        event.target.value
      );
    }, []);

  /* =========================================================
     FILTER
  ========================================================= */

  const handleFilterOpen =
    useCallback(() => {
      setFilterDrawerOpen(true);
    }, []);

  const handleFilterClose =
    useCallback(() => {
      setFilterDrawerOpen(false);
    }, []);

  /* =========================================================
     SORT
  ========================================================= */

  const handleSortOpen =
    useCallback(() => {
      setSortDrawerOpen(true);
    }, []);

  const handleSortClose =
    useCallback(() => {
      setSortDrawerOpen(false);
    }, []);

  /* =========================================================
     DETAIL DRAWER
  ========================================================= */

  const handleDetailClose =
    useCallback(() => {
      setClientDetailDrawerOpen(
        false
      );

      setSelectedClient(null);
    }, []);

  /* =========================================================
     VIEW CHANGE
  ========================================================= */

  const handleViewChange =
    useCallback((nextView) => {
      setView(nextView);
    }, []);

  /* =========================================================
     PROCESSED DATA
  ========================================================= */

  const processedData =
    useMemo(() => {
      const searchTerm =
        normalize(search);

      const filtered =
        clients.filter(
          (client) => {
            /* ---------------------------------------------
               Hide archived clients
            --------------------------------------------- */

            if (
              normalize(
                client?.status
              ) === "archived"
            ) {
              return false;
            }

            /* ---------------------------------------------
               SEARCH
            --------------------------------------------- */

            if (searchTerm) {
              const searchableText =
                [
                  client?.name,
                  client?.email,
                  client?.contactName,
                  client?.phone,
                  client?.city,
                  client?.stateRegion,
                  client?.postalCode,
                  client?.country,
                ]
                  .map(normalize)
                  .join(" ");

              if (
                !searchableText.includes(
                  searchTerm
                )
              ) {
                return false;
              }
            }

            /* ---------------------------------------------
               STATUS FILTER
            --------------------------------------------- */

            const normalizedClientStatus =
              normalize(
                client?.status
              );

            const normalizedFilterStatus =
              filters.status.map(
                normalize
              );

            const matchesStatus =
              filters.status.length ===
                0 ||
              normalizedFilterStatus.includes(
                normalizedClientStatus
              );

            if (!matchesStatus) {
              return false;
            }

            /* ---------------------------------------------
               CREATED DATE FILTER
            --------------------------------------------- */

            const clientDate =
              parseDate(
                client?.createdAt
              );

            if (filters.fromDate) {
              const fromDate =
                parseDateBoundary(
                  filters.fromDate
                );

              if (
                !clientDate ||
                !fromDate ||
                clientDate < fromDate
              ) {
                return false;
              }
            }

            if (filters.toDate) {
              const toDate =
                parseDateBoundary(
                  filters.toDate,
                  true
                );

              if (
                !clientDate ||
                !toDate ||
                clientDate > toDate
              ) {
                return false;
              }
            }

            return true;
          }
        );

      /* -----------------------------------------------
         SORT
      ----------------------------------------------- */

      if (!sortConfig.field) {
        return filtered;
      }

      const sortType =
        SORT_COLUMNS.find(
          (column) =>
            column.id ===
            sortConfig.field
        )?.type || "string";

      return [...filtered].sort(
        (a, b) =>
          compareValues(
            a?.[sortConfig.field],
            b?.[sortConfig.field],
            sortType,
            sortConfig.direction
          )
      );
    }, [
      clients,
      filters,
      search,
      sortConfig,
    ]);

  /* =========================================================
     RESET PAGE WHEN SEARCH/FILTER/SORT CHANGES
  ========================================================= */

  useEffect(() => {
    setPagination(
      (previous) =>
        previous.pageIndex === 0
          ? previous
          : {
              ...previous,
              pageIndex: 0,
            }
    );
  }, [
    search,
    filters,
    sortConfig,
  ]);

  /* =========================================================
     KEEP PAGE INDEX VALID
  ========================================================= */

  useEffect(() => {
    const totalPages =
      Math.max(
        1,
        Math.ceil(
          processedData.length /
            pagination.pageSize
        )
      );

    setPagination(
      (previous) => {
        const maxPageIndex =
          totalPages - 1;

        if (
          previous.pageIndex <=
          maxPageIndex
        ) {
          return previous;
        }

        return {
          ...previous,
          pageIndex:
            maxPageIndex,
        };
      }
    );
  }, [
    processedData.length,
    pagination.pageSize,
  ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const totalClients =
      clients.filter(
        (client) =>
          normalize(
            client?.status
          ) !== "archived"
      ).length;

    const activeClients =
      clients.filter(
        (client) =>
          normalize(
            client?.status
          ) === "active"
      ).length;

    const pendingClients =
      clients.filter(
        (client) =>
          normalize(
            client?.status
          ) === "pending"
      ).length;

    const retentionRate =
      totalClients > 0
        ? (
            (activeClients /
              totalClients) *
            100
          ).toFixed(1)
        : "0.0";

    return [
      {
        title: "TOTAL CLIENTS",
        value: totalClients,
        change: `${activeClients} Active`,
        icon: "group",
        iconColor:
          "text-[var(--color-primary)]",
        changeColor:
          "text-[var(--color-primary-dark)]",
        type: "progress",
      },

      {
        title: "RETENTION RATE",
        value: `${retentionRate}%`,
        change: `${activeClients}/${totalClients}`,
        icon: "recommend",
        iconColor:
          "text-[var(--color-warning)]",
        changeColor:
          "text-[var(--color-warning-hover)]",
        type: "progress",
      },

      {
        title: "PENDING CLIENTS",
        value: pendingClients,
        change:
          pendingClients > 0
            ? "Needs Review"
            : "All Clear",
        icon: "warning",
        iconColor:
          "text-[var(--color-danger)]",
        changeColor:
          "text-[var(--color-danger-hover)]",
        type: "danger",
      },
    ];
  }, [clients]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        processedData.length /
          pagination.pageSize
      )
    );

  const startIndex =
    pagination.pageIndex *
    pagination.pageSize;

  const endIndex =
    startIndex +
    pagination.pageSize;

  const paginatedCards =
    useMemo(
      () =>
        processedData.slice(
          startIndex,
          endIndex
        ),
      [
        processedData,
        startIndex,
        endIndex,
      ]
    );

  const handlePageSizeChange =
    useCallback((event) => {
      const pageSize =
        Number(
          event.target.value
        );

      if (
        !PAGE_SIZES.includes(
          pageSize
        )
      ) {
        return;
      }

      setPagination({
        pageIndex: 0,
        pageSize,
      });
    }, []);

  const goToPreviousPage =
    useCallback(() => {
      setPagination(
        (previous) => ({
          ...previous,
          pageIndex: Math.max(
            previous.pageIndex - 1,
            0
          ),
        })
      );
    }, []);

  const goToNextPage =
    useCallback(() => {
      setPagination(
        (previous) => ({
          ...previous,
          pageIndex: Math.min(
            previous.pageIndex + 1,
            totalPages - 1
          ),
        })
      );
    }, [totalPages]);

  /* =========================================================
     TABLE ACTION BUTTON CLASS
  ========================================================= */

  const actionButtonClass = `
    inline-flex
    h-9
    w-9
    items-center
    justify-center
    rounded-[var(--radius-md)]
    border
    border-transparent
    bg-transparent
    p-0
    text-[var(--color-text)]
    transition-all
    duration-150
    ease-in-out
    hover:border-[var(--color-primary-light)]
    hover:bg-[var(--color-primary-soft)]
    hover:text-[var(--color-primary)]
    active:scale-95
    focus:outline-none
    focus-visible:border-[var(--color-primary)]
    focus-visible:ring-2
    focus-visible:ring-[rgba(15,157,148,0.15)]
  `;

  const deleteButtonClass = `
    inline-flex
    h-9
    w-9
    items-center
    justify-center
    rounded-[var(--radius-md)]
    border
    border-transparent
    bg-transparent
    p-0
    text-[var(--color-text)]
    transition-all
    duration-150
    ease-in-out
    hover:border-[var(--color-danger-light)]
    hover:bg-[var(--color-danger-soft)]
    hover:text-[var(--color-danger)]
    active:scale-95
    focus:outline-none
    focus-visible:border-[var(--color-danger)]
    focus-visible:ring-2
    focus-visible:ring-[var(--color-danger-light)]
  `;

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */

  const columns = useMemo(
    () => [
      /* -----------------------------------------------
         CLIENT NAME
      ----------------------------------------------- */

      columnHelper.accessor(
        "name",
        {
          id: "name",

          header: "Client Name",

          cell: ({
            row,
            getValue,
          }) => {
            const client =
              row.original;

            return (
              <div className="flex min-w-[220px] items-center gap-3">
                <div
                  className="
                    grid
                    h-9
                    w-9
                    shrink-0
                    place-items-center
                    rounded-[var(--radius-md)]
                    bg-[var(--color-primary-soft)]
                    text-xs
                    font-bold
                    text-[var(--color-primary)]
                  "
                >
                  {getClientInitials(
                    client
                  )}
                </div>

                <div className="min-w-0">
                  <div
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-[var(--color-text)]
                    "
                  >
                    {getValue() ||
                      "Unnamed Client"}
                  </div>

                  {client?.email && (
                    <div
                      className="
                        truncate
                        text-xs
                        text-[var(--color-text-muted)]
                      "
                    >
                      {client.email}
                    </div>
                  )}
                </div>
              </div>
            );
          },
        }
      ),

      /* -----------------------------------------------
         COUNTRY
      ----------------------------------------------- */

      columnHelper.accessor(
        "country",
        {
          id: "country",

          header: "Country",

          cell: ({
            getValue,
          }) => (
            <div
              className="
                whitespace-nowrap
                text-sm
                text-[var(--color-text-secondary)]
              "
            >
              {getValue() || "—"}
            </div>
          ),
        }
      ),

      /* -----------------------------------------------
         STATE
      ----------------------------------------------- */

      columnHelper.accessor(
        "stateRegion",
        {
          id: "stateRegion",

          header: "State",

          cell: ({
            getValue,
          }) => (
            <div
              className="
                whitespace-nowrap
                text-sm
                text-[var(--color-text-secondary)]
              "
            >
              {getValue() || "—"}
            </div>
          ),
        }
      ),

      /* -----------------------------------------------
         CITY
      ----------------------------------------------- */

      columnHelper.accessor(
        "city",
        {
          id: "city",

          header: "City",

          cell: ({
            getValue,
          }) => (
            <div
              className="
                whitespace-nowrap
                text-sm
                text-[var(--color-text-secondary)]
              "
            >
              {getValue() || "—"}
            </div>
          ),
        }
      ),

      /* -----------------------------------------------
         PINCODE
      ----------------------------------------------- */

      columnHelper.accessor(
        "postalCode",
        {
          id: "postalCode",

          header: "Pincode",

          cell: ({
            getValue,
          }) => (
            <div
              className="
                whitespace-nowrap
                text-sm
                text-[var(--color-text-secondary)]
              "
            >
              {getValue() || "—"}
            </div>
          ),
        }
      ),

      /* -----------------------------------------------
         PHONE
      ----------------------------------------------- */

      columnHelper.accessor(
        "phone",
        {
          id: "phone",

          header: "Phone Number",

          cell: ({
            getValue,
          }) => (
            <div
              className="
                whitespace-nowrap
                text-sm
                text-[var(--color-text-secondary)]
              "
            >
              {getValue() || "—"}
            </div>
          ),
        }
      ),

      /* -----------------------------------------------
         STATUS
      ----------------------------------------------- */

      columnHelper.accessor(
        "status",
        {
          id: "status",

          header: "Status",

          cell: ({
            getValue,
          }) => {
            const status =
              getValue();

            return (
              <span
                className={`
                  inline-flex
                  items-center
                  rounded-full
                  px-2.5
                  py-1
                  text-xs
                  font-semibold
                  capitalize
                  ${getStatusBadge(
                    status
                  )}
                `}
              >
                {status ||
                  "Unknown"}
              </span>
            );
          },
        }
      ),

      /* -----------------------------------------------
         ACTION
      ----------------------------------------------- */

      columnHelper.display({
        id: "actions",

        header: "Action",

        cell: ({
          row,
        }) => {
          const client =
            row.original;

          return (
            <div
              className="
                flex
                items-center
                gap-1
                whitespace-nowrap
              "
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* VIEW */}

              <button
                type="button"
                className={
                  actionButtonClass
                }
                onClick={() =>
                  handleRowClick(
                    client
                  )
                }
                title="View Client"
                aria-label={`View ${
                  client?.name ||
                  "client"
                }`}
              >
                <span
                  className="
                    material-symbols-outlined
                    text-[18px]
                  "
                >
                  visibility
                </span>
              </button>

              {/* EDIT */}

              <button
                type="button"
                className={
                  actionButtonClass
                }
                onClick={() =>
                  openEdit(client)
                }
                title="Edit Client"
                aria-label={`Edit ${
                  client?.name ||
                  "client"
                }`}
              >
                <span
                  className="
                    material-symbols-outlined
                    text-[18px]
                  "
                >
                  edit
                </span>
              </button>

              {/* DELETE */}

              <button
                type="button"
                className={
                  deleteButtonClass
                }
                onClick={() =>
                  handleDeleteClient(
                    client
                  )
                }
                title="Delete Client"
                aria-label={`Delete ${
                  client?.name ||
                  "client"
                }`}
              >
                <span
                  className="
                    material-symbols-outlined
                    text-[18px]
                  "
                >
                  delete
                </span>
              </button>
            </div>
          );
        },
      }),
    ],
    [
      handleRowClick,
      openEdit,
      handleDeleteClient,
    ]
  );

  /* =========================================================
     ACTIVE CLIENTS
  ========================================================= */

  const activeClients =
    useMemo(
      () =>
        clients.filter(
          (client) =>
            normalize(
              client?.status
            ) === "active"
        ).length,
      [clients]
    );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main
      className="
        mx-auto
        flex
        w-full
        max-w-[1600px]
        flex-1
        bg-[var(--color-background)]
        pt-2
        pb-12
      "
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="w-full">
        <SectionHeader
          title="Clients"
          description={`Manage ${activeClients} Active organizational relationships.`}
          secondaryAction={{
            label: "Filter",
            icon: "filter_list",
            onClick:
              handleFilterOpen,
          }}
          primaryAction={{
            label: "Add Client",
            icon: "person_add",
            onClick:
              openCreate,
          }}
        />

        {/* =================================================
            STATS
        ================================================= */}

        <div
          className="
            mb-6
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {stats.map(
            (item) => (
              <StatCard
                key={
                  item.title
                }
                {...item}
                variant="dashboard"
              />
            )
          )}
        </div>

        {/* =================================================
            SEARCH / FILTER / SORT / VIEW
        ================================================= */}

        <div
          className="
            mb-5
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
          "
        >
          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            {/* SEARCH */}

            <div className="relative">
              <label
                htmlFor="client-search"
                className="sr-only"
              >
                Search clients
              </label>

              <span
                aria-hidden="true"
                className="
                  material-symbols-outlined
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-[18px]
                  text-[var(--color-text-light)]
                "
              >
                search
              </span>

              <input
                id="client-search"
                type="search"
                value={search}
                onChange={
                  handleSearchChange
                }
                placeholder="Search clients..."
                autoComplete="off"
                className="
                  h-10
                  w-64
                  rounded-[var(--radius-lg)]
                  border
                  border-[var(--color-border)]
                  bg-[var(--color-surface)]
                  py-2
                  pl-10
                  pr-3
                  text-sm
                  text-[var(--color-text)]
                  outline-none
                  transition-all
                  duration-150
                  placeholder:text-[var(--color-text-light)]
                  hover:border-[var(--color-border-dark)]
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[rgba(15,157,148,0.15)]
                "
              />
            </div>

            {/* FILTER */}

            <button
              type="button"
              onClick={
                handleFilterOpen
              }
              aria-label="Open client filters"
              className="
                flex
                h-10
                items-center
                gap-2
                rounded-[var(--radius-lg)]
                border
                border-[var(--color-border)]
                bg-[var(--color-surface)]
                px-3.5
                text-sm
                font-medium
                text-[var(--color-text)]
                transition-all
                duration-150
                hover:border-[var(--color-border-dark)]
                hover:bg-[var(--color-surface-hover)]
                focus:outline-none
                focus:ring-2
                focus:ring-[rgba(15,157,148,0.15)]
              "
            >
              <span
                className="
                  material-symbols-outlined
                  text-[18px]
                "
              >
                tune
              </span>

              Filter
            </button>

            {/* SORT */}

            <button
              type="button"
              onClick={
                handleSortOpen
              }
              aria-label="Open client sorting options"
              className="
                flex
                h-10
                items-center
                gap-2
                rounded-[var(--radius-lg)]
                border
                border-[var(--color-border)]
                bg-[var(--color-surface)]
                px-3.5
                text-sm
                font-medium
                text-[var(--color-text)]
                transition-all
                duration-150
                hover:border-[var(--color-border-dark)]
                hover:bg-[var(--color-surface-hover)]
                focus:outline-none
                focus:ring-2
                focus:ring-[rgba(15,157,148,0.15)]
              "
            >
              <span
                className="
                  material-symbols-outlined
                  text-[18px]
                "
              >
                sort
              </span>

              Sort
            </button>
          </div>

          {/* VIEW */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <span
              className="
                text-sm
                text-[var(--color-text-muted)]
              "
            >
              View:
            </span>

            <div
              className="
                flex
                rounded-[var(--radius-lg)]
                bg-[var(--color-surface-secondary)]
                p-1
              "
              role="group"
              aria-label="Client view"
            >
              {/* LIST */}

              <button
                type="button"
                onClick={() =>
                  handleViewChange(
                    "list"
                  )
                }
                aria-label="List view"
                aria-pressed={
                  view === "list"
                }
                className={`
                  rounded-[var(--radius-md)]
                  p-1.5
                  transition-all
                  duration-150
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[rgba(15,157,148,0.15)]
                  ${
                    view ===
                    "list"
                      ? `
                        bg-[var(--color-surface)]
                        text-[var(--color-primary)]
                        shadow-[var(--shadow-xs)]
                      `
                      : `
                        text-[var(--color-text-light)]
                        hover:text-[var(--color-text-muted)]
                      `
                  }
                `}
              >
                <span
                  className="
                    material-symbols-outlined
                    text-[18px]
                  "
                >
                  list
                </span>
              </button>

              {/* GRID */}

              <button
                type="button"
                onClick={() =>
                  handleViewChange(
                    "grid"
                  )
                }
                aria-label="Grid view"
                aria-pressed={
                  view === "grid"
                }
                className={`
                  rounded-[var(--radius-md)]
                  p-1.5
                  transition-all
                  duration-150
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[rgba(15,157,148,0.15)]
                  ${
                    view ===
                    "grid"
                      ? `
                        bg-[var(--color-surface)]
                        text-[var(--color-primary)]
                        shadow-[var(--shadow-xs)]
                      `
                      : `
                        text-[var(--color-text-light)]
                        hover:text-[var(--color-text-muted)]
                      `
                  }
                `}
              >
                <span
                  className="
                    material-symbols-outlined
                    text-[18px]
                  "
                >
                  grid_view
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            LIST VIEW
        ================================================= */}

        {view === "list" ? (
          <DataTable
            data={processedData}
            columns={columns}
            pagination={
              pagination
            }
            setPagination={
              setPagination
            }
            emptyMessage={
              isLoading
                ? "Loading clients..."
                : "No clients found"
            }
            pageSizes={
              PAGE_SIZES
            }
            onRowClick={
              handleRowClick
            }
          />
        ) : (
          <>
            {/* =============================================
                GRID LOADING
            ============================================= */}

            {isLoading ? (
              <div
                className="
                  rounded-[var(--radius-xl)]
                  border
                  border-[var(--color-border)]
                  bg-[var(--color-surface)]
                  p-12
                  text-center
                  shadow-[var(--shadow-sm)]
                "
                role="status"
                aria-live="polite"
              >
                <span
                  className="
                    material-symbols-outlined
                    animate-spin
                    text-4xl
                    text-[var(--color-text-light)]
                  "
                >
                  progress_activity
                </span>

                <p
                  className="
                    mt-2
                    text-sm
                    text-[var(--color-text-muted)]
                  "
                >
                  Loading clients...
                </p>
              </div>
            ) : processedData.length ===
              0 ? (
              <div
                className="
                  rounded-[var(--radius-xl)]
                  border
                  border-[var(--color-border)]
                  bg-[var(--color-surface)]
                  p-12
                  text-center
                  shadow-[var(--shadow-sm)]
                "
                role="status"
              >
                <div
                  aria-hidden="true"
                  className="
                    mb-2
                    text-[var(--color-text-light)]
                  "
                >
                  <span
                    className="
                      material-symbols-outlined
                      text-4xl
                    "
                  >
                    group_off
                  </span>
                </div>

                <h3
                  className="
                    text-sm
                    font-semibold
                    text-[var(--color-text)]
                  "
                >
                  No clients found
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[var(--color-text-muted)]
                  "
                >
                  Try changing your
                  search or filters.
                </p>
              </div>
            ) : (
              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {paginatedCards.map(
                  (client) => (
                    <ClientCard
                      key={getClientId(
                        client
                      )}
                      client={
                        client
                      }
                      onClick={() =>
                        handleRowClick(
                          client
                        )
                      }
                    />
                  )
                )}
              </div>
            )}

            {/* =============================================
                GRID PAGINATION
            ============================================= */}

            {processedData.length >
              0 &&
              !isLoading && (
                <div
                  className="
                    mt-6
                    flex
                    flex-col
                    gap-4
                    rounded-[var(--radius-xl)]
                    border
                    border-[var(--color-border)]
                    bg-[var(--color-surface)]
                    px-6
                    py-4
                    shadow-[var(--shadow-sm)]
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                  "
                >
                  <p
                    className="
                      text-sm
                      text-[var(--color-text-muted)]
                    "
                  >
                    Showing{" "}
                    <span
                      className="
                        mx-1
                        font-semibold
                        text-[var(--color-text)]
                      "
                    >
                      {startIndex + 1}
                    </span>
                    -
                    <span
                      className="
                        mx-1
                        font-semibold
                        text-[var(--color-text)]
                      "
                    >
                      {Math.min(
                        endIndex,
                        processedData.length
                      )}
                    </span>
                    {" "}of{" "}
                    <span
                      className="
                        mx-1
                        font-semibold
                        text-[var(--color-text)]
                      "
                    >
                      {
                        processedData.length
                      }
                    </span>
                    {" "}clients
                  </p>

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    {/* PAGE SIZE */}

                    <label
                      htmlFor="client-page-size"
                      className="sr-only"
                    >
                      Clients per page
                    </label>

                    <select
                      id="client-page-size"
                      value={
                        pagination.pageSize
                      }
                      onChange={
                        handlePageSizeChange
                      }
                      className="
                        h-9
                        rounded-[var(--radius-lg)]
                        border
                        border-[var(--color-border)]
                        bg-[var(--color-surface)]
                        px-3
                        text-sm
                        text-[var(--color-text)]
                        outline-none
                        transition-all
                        focus:border-[var(--color-primary)]
                        focus:ring-2
                        focus:ring-[rgba(15,157,148,0.15)]
                      "
                    >
                      {PAGE_SIZES.map(
                        (size) => (
                          <option
                            key={size}
                            value={size}
                          >
                            {size}
                          </option>
                        )
                      )}
                    </select>

                    {/* PAGINATION */}

                    <div
                      className="
                        flex
                        items-center
                        rounded-[var(--radius-xl)]
                        bg-[var(--color-surface-secondary)]
                        p-1
                      "
                      aria-label="Pagination"
                    >
                      <button
                        type="button"
                        onClick={
                          goToPreviousPage
                        }
                        disabled={
                          pagination.pageIndex ===
                          0
                        }
                        aria-label="Previous page"
                        className="
                          grid
                          h-9
                          w-9
                          place-items-center
                          rounded-[var(--radius-lg)]
                          text-[var(--color-text-muted)]
                          transition-all
                          hover:bg-[var(--color-surface)]
                          hover:text-[var(--color-text)]
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[rgba(15,157,148,0.15)]
                        "
                      >
                        <span className="material-symbols-outlined">
                          chevron_left
                        </span>
                      </button>

                      <span
                        className="
                          min-w-[80px]
                          px-4
                          text-center
                          text-sm
                          font-semibold
                          text-[var(--color-text)]
                        "
                        aria-current="page"
                      >
                        {pagination.pageIndex +
                          1}{" "}
                        /{" "}
                        {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={
                          goToNextPage
                        }
                        disabled={
                          pagination.pageIndex >=
                          totalPages - 1
                        }
                        aria-label="Next page"
                        className="
                          grid
                          h-9
                          w-9
                          place-items-center
                          rounded-[var(--radius-lg)]
                          text-[var(--color-text-muted)]
                          transition-all
                          hover:bg-[var(--color-surface)]
                          hover:text-[var(--color-text)]
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[rgba(15,157,148,0.15)]
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

        {/* =================================================
            CLIENT FORM DRAWER
        ================================================= */}

        <ClientDrawer
          isOpen={
            formDrawerOpen
          }
          onClose={
            handleFormClose
          }
          client={
            editingClient
          }
        />

        {/* =================================================
            FILTER DRAWER
        ================================================= */}

        <FilterDrawer
          isOpen={
            filterDrawerOpen
          }
          onClose={
            handleFilterClose
          }
          filters={filters}
          setFilters={
            setFilters
          }
        />

        {/* =================================================
            SORT DRAWER
        ================================================= */}

       <SortDrawer
  isOpen={sortDrawerOpen}
  onClose={handleSortClose}
  columns={SORT_COLUMNS}
  sortConfig={sortConfig}
  setSortConfig={setSortConfig}
/>

        {/* =================================================
            CLIENT DETAIL DRAWER
        ================================================= */}

        <ClientDetailDrawer
          isOpen={
            clientDetailDrawerOpen
          }
          onClose={
            handleDetailClose
          }
          client={
            selectedClient
          }
          onEdit={
            openEdit
          }
        />
      </div>
    </main>
  );
}

