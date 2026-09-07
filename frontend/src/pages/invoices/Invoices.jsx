import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StatCard";
import FormInput from "../../components/ui/FormInput";
import InvoiceTemplate from "../composer/InvoiceTemplate";
import Modal from "../../components/ui/Modal";
import useCurrency from "../../hooks/useCurrency";
import { useNotificationStore } from "../../store/notificationStore";
import {
  showSuccessToast,
  showErrorToast,
  showReminderToast,
} from "../../components/ui/CustomToast";
import DataTable from "../../components/ui/DataTable";
import InvoiceFilterDrawer from "../../components/invoice/InvoiceFilterDrawer";

// ==================== HELPERS ====================

const normalizeStatus = (status) => {
  if (!status) return "draft";
  return status.toString().trim().toLowerCase();
};

const getDisplayStatus = (status) => {
  if (!status) return "Draft";
  return (
    status.toString().trim().charAt(0).toUpperCase() +
    status.toString().trim().slice(1).toLowerCase()
  );
};

const getInvoiceAmount = (invoice) => {
  const raw =
    invoice.total ??
    invoice.totalAmount ??
    invoice.grandTotal ??
    invoice.amount ??
    0;
  return typeof raw === "number"
    ? raw
    : parseFloat(String(raw).replace(/,/g, "").replace(/[^\d.-]/g, "")) || 0;
};

const getClientName = (client) => {
  if (!client) return "Unknown Client";
  if (typeof client === "string") return `Client ID: ${client.slice(-6)}`;
  return client.name || "Unknown Client";
};

const getClientEmail = (client) => {
  if (!client) return "No Email";
  if (typeof client === "object") return client.email || "No Email";
  return "No Email";
};

const getProjectTitle = (project) => {
  if (!project) return "—";
  if (typeof project === "string") return `Project ID: ${project.slice(-6)}`;
  return project.title || "—";
};

// ==================== COMPONENT ====================

export default function Invoices() {
  const navigate = useNavigate();
  const { format } = useCurrency();
  const { addNotification } = useNotificationStore();

  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [invoiceFilters, setInvoiceFilters] = useState({
    status: [],
    fromDate: "",
    toDate: "",
    minAmount: "",
    maxAmount: "",
    currency: "All",
  });
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Counts
  const counts = useMemo(() => {
    const normalizedInvoices = invoices.map((inv) => ({
      ...inv,
      normStatus: normalizeStatus(inv.status),
    }));

    return {
      all: invoices.length,
      paid: normalizedInvoices.filter((i) => i.normStatus === "paid").length,
      pending: normalizedInvoices.filter((i) => i.normStatus === "pending").length,
      overdue: normalizedInvoices.filter((i) => i.normStatus === "overdue").length,
      scheduled: normalizedInvoices.filter((i) => i.normStatus === "scheduled").length,
      draft: normalizedInvoices.filter((i) => i.normStatus === "draft").length,
    };
  }, [invoices]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    const handleInvoiceCreated = (e) => {
      fetchInvoices();

      const invoice = e.detail?.invoice;
      addNotification({
        type: "invoice",
        icon: "receipt_long",
        iconColor: "text-primary",
        bgColor: "bg-primary-soft",
        title: `New Invoice Created #${invoice?.invoiceNumber || ""}`,
        description: `${getClientName(invoice?.client)} • ${format(
          getInvoiceAmount(invoice)
        )}`,
        borderColor: "border-l-primary",
      });
    };

    window.addEventListener("invoice-created", handleInvoiceCreated);
    return () => window.removeEventListener("invoice-created", handleInvoiceCreated);
  }, [addNotification, format]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("autobiller-auth") ||
        localStorage.getItem("token");

      if (!token) {
        showErrorToast("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const base = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
      ).replace(/\/$/, "");

      const res = await axios.get(`${base}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.invoices)
        ? res.data.invoices
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setInvoices(list);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);

      if (error.response?.status === 401) {
        showErrorToast("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      showErrorToast(
        error.response?.data?.message || "Failed to load invoices"
      );
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return invoices.filter((invoice) => {
      const normStatus = normalizeStatus(invoice.status);

      const matchesTab =
        activeFilter === "all" || normStatus === activeFilter;

      const searchTerm = search.toLowerCase();
      const matchesSearch =
        getClientName(invoice.client).toLowerCase().includes(searchTerm) ||
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm);

      const matchesStatus =
        invoiceFilters.status.length === 0 ||
        invoiceFilters.status.includes(normStatus);

      let invoiceDate;
      try {
        invoiceDate = new Date(invoice.invoiceDate);
      } catch {
        invoiceDate = new Date();
      }

      const matchesFromDate =
        !invoiceFilters.fromDate ||
        invoiceDate >= new Date(invoiceFilters.fromDate);

      const endDate = invoiceFilters.toDate
        ? new Date(invoiceFilters.toDate)
        : null;
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const matchesToDate = !endDate || invoiceDate <= endDate;

      const amount = Number(getInvoiceAmount(invoice));

      const minAmount =
        invoiceFilters.minAmount !== ""
          ? Number(invoiceFilters.minAmount)
          : null;

      const maxAmount =
        invoiceFilters.maxAmount !== ""
          ? Number(invoiceFilters.maxAmount)
          : null;

      const matchesMinAmount =
        minAmount === null || amount >= minAmount;

      const matchesMaxAmount =
        maxAmount === null || amount <= maxAmount;

      const matchesCurrency =
        invoiceFilters.currency === "All" ||
        (invoice.currency || "USD") === invoiceFilters.currency;

      return (
        matchesTab &&
        matchesSearch &&
        matchesStatus &&
        matchesFromDate &&
        matchesToDate &&
        matchesMinAmount &&
        matchesMaxAmount &&
        matchesCurrency
      );
    });
  }, [invoices, search, activeFilter, invoiceFilters]);

  const openInvoiceModal = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search, activeFilter, invoiceFilters]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleReminder = React.useCallback(
    (invoice) => {
      showReminderToast(getClientName(invoice.client));

      addNotification({
        type: "reminder",
        icon: "notifications_active",
        iconColor: "text-warning",
        bgColor: "bg-warning-soft",
        title: "Payment Reminder Sent",
        description: `Invoice #${invoice.invoiceNumber} to ${getClientName(
          invoice.client
        )}`,
        borderColor: "border-l-warning",
      });
    },
    [addNotification]
  );

  const updateInvoiceStatus = async (invoiceId, newStatus) => {
    try {
      // ... your API call to update status

      addNotification({
        type: "status",
        icon: "task_alt",
        iconColor: "text-success",
        bgColor: "bg-success-soft",
        title: "Invoice Status Updated",
        description: `#${invoiceId} → ${newStatus.toUpperCase()}`,
        borderColor: "border-l-success",
      });

      fetchInvoices();
    } catch (error) {
      showErrorToast("Failed to update status");
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },

      {
        accessorKey: "invoiceNumber",
        header: "Invoice",
        cell: ({ row }) => (
          <span className="font-semibold text-text">
            #{row.original.invoiceNumber}
          </span>
        ),
      },

      {
        accessorKey: "client",
        header: "Client",
        cell: ({ row }) => {
          const client = row.original.client;
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center font-semibold">
                {getClientName(client).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-text">
                  {getClientName(client)}
                </p>
                <p className="text-xs text-text-muted">
                  {getClientEmail(client)}
                </p>
              </div>
            </div>
          );
        },
      },

      {
        accessorKey: "project",
        header: "Project",
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {getProjectTitle(row.original.project)}
          </span>
        ),
      },

      {
        accessorKey: "invoiceDate",
        header: "Date",
        cell: ({ row }) => {
          const date = new Date(row.original.invoiceDate);
          return (
            <span className="text-text-secondary">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          );
        },
      },

      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-bold text-text">
            {format(getInvoiceAmount(row.original))}
          </span>
        ),
      },

      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const displayStatus = getDisplayStatus(row.original.status);

          const styles = {
            Paid: "bg-success-soft text-success",
            Overdue: "bg-danger-soft text-danger",
            Draft: "bg-surface-secondary text-text-muted",
            Scheduled: "bg-info-soft text-info",
            Pending: "bg-warning-soft text-warning",
            Sent: "bg-info-soft text-info",
          };

          const dotStyles = {
            Paid: "bg-success",
            Overdue: "bg-danger",
            Draft: "bg-text-light",
            Scheduled: "bg-info",
            Pending: "bg-warning",
            Sent: "bg-info",
          };

          return (
            <span
              className={`
                inline-flex items-center gap-2
                px-3 py-1 rounded-full
                text-[11px] font-bold uppercase tracking-wide
                ${styles[displayStatus] || "bg-surface-secondary text-text-muted"}
              `}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  dotStyles[displayStatus] || "bg-text-light"
                }`}
              />
              {displayStatus}
            </span>
          );
        },
      },

      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              title="Edit"
              onClick={() => navigate(`/composer/${row.original.id}`)}
              className="p-2 rounded-lg text-text-light hover:bg-surface-hover hover:text-primary transition"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>

            <button
              title="View"
              onClick={() => openInvoiceModal(row.original)}
              className="p-2 rounded-lg text-text-light hover:bg-surface-hover hover:text-primary transition"
            >
              <span className="material-symbols-outlined text-[18px]">
                visibility
              </span>
            </button>

            <button
              title="Send"
              className="p-2 rounded-lg text-text-light hover:bg-surface-hover hover:text-primary transition"
              onClick={() => handleReminder(row.original)}
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        ),
      },
    ],
    [navigate, handleReminder, format]
  );

  const selectedCount = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]).length,
    [rowSelection]
  );

  const stats = useMemo(() => {
    const getAmount = (invoice) => getInvoiceAmount(invoice);

    const paidInvoices = invoices.filter(
      (inv) => normalizeStatus(inv.status) === "paid"
    );
    const pendingInvoices = invoices.filter(
      (inv) => normalizeStatus(inv.status) === "pending"
    );
    const overdueInvoices = invoices.filter(
      (inv) => normalizeStatus(inv.status) === "overdue"
    );
    const scheduledInvoices = invoices.filter(
      (inv) => normalizeStatus(inv.status) === "scheduled"
    );

    return {
      outstandingAmount: pendingInvoices.reduce(
        (sum, inv) => sum + getAmount(inv),
        0
      ),
      paidAmount: paidInvoices.reduce((sum, inv) => sum + getAmount(inv), 0),
      totalInvoices: invoices.length,
      overdueCount: overdueInvoices.length,
      scheduledCount: scheduledInvoices.length,
      paidCount: paidInvoices.length,
    };
  }, [invoices]);

  const handleReset = () => {
    setInvoiceFilters({
      status: [],
      fromDate: "",
      toDate: "",
      minAmount: "",
      maxAmount: "",
      currency: "All",
    });
  };

  return (
    <>
      <div className="space-y-6">
        <SectionHeader
          title="Invoices"
          description={`Manage ${counts.all} invoices across your billing pipeline.`}
          secondaryAction={{
            label: "Filter",
            icon: "filter_list",
            onClick: () => setFilterDrawer(true),
          }}
          primaryAction={{
            label: "New Invoice",
            icon: "add",
            onClick: () => navigate("/composer"),
          }}
        />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Outstanding"
            value={format(stats.outstandingAmount)}
            sub={`${counts.pending} pending · ${counts.overdue} overdue`}
            badge={`${counts.pending}`}
            icon="account_balance"
            variant="dashboard"
          />

          <StatCard
            title="Paid Invoices"
            value={format(stats.paidAmount)}
            sub={`${stats.paidCount} paid invoices`}
            badge={`${stats.paidCount}`}
            icon="task_alt"
            variant="dashboard"
          />

          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            sub={`${counts.draft} drafts`}
            badge={stats.totalInvoices}
            icon="receipt_long"
            variant="dashboard"
          />

          <StatCard
            title="Scheduled"
            value={stats.scheduledCount}
            sub="Auto scheduled invoices"
            badge={stats.scheduledCount}
            icon="schedule"
            variant="dashboard"
          />
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-3 justify-between">
          <div className="inline-flex p-1 bg-surface-secondary rounded-lg gap-1">
            {[
              { key: "all", label: "All", count: counts.all },
              { key: "paid", label: "Paid", count: counts.paid },
              { key: "pending", label: "Pending", count: counts.pending },
              { key: "overdue", label: "Overdue", count: counts.overdue },
              { key: "scheduled", label: "Scheduled", count: counts.scheduled },
              { key: "draft", label: "Draft", count: counts.draft },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`
                  px-3.5 py-1.5 rounded-md text-[12.5px] font-semibold transition
                  flex items-center gap-1.5
                  ${
                    activeFilter === filter.key
                      ? "bg-surface text-primary shadow-sm"
                      : "text-text-muted hover:text-text"
                  }
                `}
              >
                {filter.label}
                <span className="ml-1.5 text-[10px] tabular-nums px-1.5 py-0.5 rounded-full font-bold bg-surface text-text-muted">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full md:w-64">
            <FormInput
              icon="search"
              placeholder="Search invoices…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedCount > 0 && (
          <div className="fade-in mb-3 p-3 bg-primary-soft border border-primary/20 rounded-xl flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              <b className="text-primary-dark">{selectedCount}</b> selected
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-surface border border-primary/30 text-primary-dark rounded-lg text-xs font-semibold hover:bg-primary-soft flex items-center gap-1 transition">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  send
                </span>
                Send
              </button>
              <button className="px-3 py-1.5 bg-surface border border-primary/30 text-primary-dark rounded-lg text-xs font-semibold hover:bg-primary-soft flex items-center gap-1 transition">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  notifications_active
                </span>
                Remind
              </button>
              <button className="px-3 py-1.5 bg-surface border border-danger/30 text-danger rounded-lg text-xs font-semibold hover:bg-danger-soft flex items-center gap-1 transition">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  delete
                </span>
                Delete
              </button>
            </div>
          </div>
        )}

        <DataTable
          data={filteredData}
          columns={columns}
          loading={loading}
          pagination={pagination}
          setPagination={setPagination}
          pageSizes={[5, 10, 20, 50]}
          emptyMessage="No invoices found"
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`Invoice ${selectedInvoice?.invoiceNumber || ""}`}
          size="lg"
          position="right-modal"
        >
          {selectedInvoice && (
            <div className="max-w-[700px] max-h-[800px] mx-auto scale-90 origin-top">
              <InvoiceTemplate
                invoice={selectedInvoice}
                selectedClient={selectedInvoice.client}
                selectedProject={selectedInvoice.project}
                subtotal={selectedInvoice.subtotal}
                tax={selectedInvoice.tax}
                total={selectedInvoice.total}
              />
            </div>
          )}
        </Modal>
      </div>

      <InvoiceFilterDrawer
        isOpen={filterDrawer}
        onClose={() => setFilterDrawer(false)}
        filters={invoiceFilters}
        setFilters={setInvoiceFilters}
        onApply={() => setFilterDrawer(false)}
        onReset={handleReset}
      />
    </>
  );
}