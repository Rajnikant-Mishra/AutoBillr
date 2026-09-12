import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";

import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StatCard";
import FormInput from "../../components/ui/FormInput";
import InvoiceTemplate from "../composer/InvoiceTemplate";
import Modal from "../../components/ui/Modal";
import useCurrency from "../../hooks/useCurrency";
import { useNotificationStore } from "../../store/notificationStore";
import {
  showErrorToast,
  showReminderToast,
  showSuccessToast,
} from "../../components/ui/CustomToast";
import DataTable from "../../components/ui/DataTable";
import InvoiceFilterDrawer from "../../components/invoice/InvoiceFilterDrawer";

// ==================== TOKEN HELPER ====================
const getToken = () => {
  const plain = localStorage.getItem("token");
  if (plain && plain.startsWith("ey")) return plain;

  const auth = localStorage.getItem("autobiller-auth");
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      return parsed?.state?.token || parsed?.token || null;
    } catch {
      if (auth.startsWith("ey")) return auth;
    }
  }
  return null;
};

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
    invoice?.total ??
    invoice?.totalAmount ??
    invoice?.grandTotal ??
    invoice?.amount ??
    0;
  return typeof raw === "number"
    ? raw
    : parseFloat(String(raw).replace(/,/g, "").replace(/[^\d.-]/g, "")) || 0;
};

const getClientName = (client) => {
  if (!client) return "Unknown Client";
  if (typeof client === "string") return client;
  return client.name || "Unknown Client";
};

const getClientEmail = (client) => {
  if (!client) return "No Email";
  if (typeof client === "object") return client.email || "No Email";
  return "No Email";
};

const getProjectTitle = (invoice) => {
  if (!invoice) return "—";
  if (invoice.project) {
    if (typeof invoice.project === "string") return invoice.project;
    return invoice.project.title || invoice.project.name || "—";
  }
  if (invoice.client?.projects?.length > 0) {
    return invoice.client.projects[0].title || invoice.client.projects[0].name || "—";
  }
  return "—";
};

const formatInvoiceDate = (invoice) => {
  const rawDate =
    invoice?.issueDate ||
    invoice?.invoiceDate ||
    invoice?.date ||
    invoice?.createdAt;
  if (!rawDate) return "—";
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sendingId, setSendingId] = useState(null);

  const handleFilterChange = (key) => {
    setActiveFilter(key);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // ==================== FETCH ====================
  const fetchInvoices = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        showErrorToast("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
      const res = await axios.get(`${base}/invoices`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
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
      console.error(error);
      if (error.response?.status === 401) {
        showErrorToast("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      showErrorToast(error.response?.data?.message || "Failed to load invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const token = getToken();
        if (!token) {
          showErrorToast("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
        const res = await axios.get(`${base}/invoices`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (isMounted) {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.invoices)
            ? res.data.invoices
            : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
          setInvoices(list);
        }
      } catch (error) {
        if (isMounted) {
          if (error.response?.status === 401) {
            showErrorToast("Session expired. Please login again.");
            navigate("/login");
            return;
          }
          showErrorToast(error.response?.data?.message || "Failed to load invoices");
          setInvoices([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [navigate]);

  // ==================== SINGLE SEND (PDF + EMAIL) ====================
  const handleSendInvoice = useCallback(
    async (invoice) => {
      const invoiceId = invoice?.id || invoice?._id;
      if (!invoiceId) {
        showErrorToast("Invoice ID not found");
        return;
      }

      try {
        setSendingId(invoiceId);

        const token = getToken();
        if (!token) {
          showErrorToast("Session expired. Please login again.");
          navigate("/login");
          return;
        }

        const clientEmail = getClientEmail(invoice.client);
        if (!clientEmail || clientEmail === "No Email") {
          showErrorToast("Client has no email address");
          return;
        }

        // Off-screen render for PDF
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "0";
        container.style.width = "800px";
        document.body.appendChild(container);

        const { createRoot } = await import("react-dom/client");
        const root = createRoot(container);

        const total = getInvoiceAmount(invoice);
        const subtotal = invoice.subtotal ?? total / 1.085;
        const tax = invoice.tax ?? total - subtotal;

        await new Promise((resolve) => {
          root.render(
            <InvoiceTemplate
              invoice={invoice}
              selectedClient={invoice.client}
              selectedProject={invoice.project}
              subtotal={subtotal}
              tax={tax}
              total={total}
              format={format}
            />
          );
          setTimeout(resolve, 500);
        });

        const element = container.firstElementChild;
        if (!element) throw new Error("Failed to render invoice for PDF");

        const pdfBlob = await html2pdf()
          .set({
            margin: 0.3,
            filename: `${invoice.invoiceNumber || "invoice"}.pdf`,
            image: { type: "jpeg", quality: 1 },
            html2canvas: { scale: 3, useCORS: true, letterRendering: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .from(element)
          .outputPdf("blob");

        root.unmount();
        document.body.removeChild(container);

        // Send PDF
        const formData = new FormData();
        formData.append("pdf", pdfBlob, `${invoice.invoiceNumber || "invoice"}.pdf`);
        formData.append("emailClient", "true");
        formData.append("clientEmail", clientEmail);

        const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

        await axios.post(`${base}/invoices/${invoiceId}/send`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        showSuccessToast(`Invoice sent to ${getClientName(invoice.client)}`);
        addNotification({
          type: "invoice",
          icon: "send",
          iconColor: "text-primary",
          bgColor: "bg-primary-soft",
          title: "Invoice Sent",
          description: `#${invoice.invoiceNumber} emailed to ${clientEmail}`,
          borderColor: "border-l-primary",
        });
      } catch (error) {
        console.error("Send invoice error:", error);
        showErrorToast(
          error.response?.data?.message || error.message || "Failed to send invoice"
        );
      } finally {
        setSendingId(null);
      }
    },
    [navigate, addNotification, format]
  );

  // ==================== BULK SEND ====================
 // =====================================================
// BULK SEND — PDF + EMAIL TO EACH CLIENT
// =====================================================
const handleBulkSend = useCallback(async () => {
  const selected = invoices.filter((inv) => {
    const id = inv.id || inv._id;
    return id && rowSelection[id];
  });

  if (selected.length === 0) {
    showErrorToast("Please select at least one invoice.");
    return;
  }

  const token = getToken();

  if (!token) {
    showErrorToast("Session expired. Please login again.");
    navigate("/login");
    return;
  }

  const base = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/v1"
  ).replace(/\/$/, "");

  let success = 0;
  let failed = 0;

  // Prevent multiple bulk clicks
  setSendingId("bulk");

  try {
    for (const invoice of selected) {
      const invoiceId = invoice.id || invoice._id;

      try {
        const clientEmail = getClientEmail(invoice.client);

        if (!clientEmail || clientEmail === "No Email") {
          throw new Error(
            `No email address for ${getClientName(invoice.client)}`
          );
        }

        // =================================================
        // CREATE OFF-SCREEN PDF — SAME AS SINGLE SEND
        // =================================================
        const container = document.createElement("div");

        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "0";
        container.style.width = "800px";

        document.body.appendChild(container);

        const { createRoot } = await import("react-dom/client");
        const root = createRoot(container);

        const total = getInvoiceAmount(invoice);
        const subtotal = invoice.subtotal ?? total / 1.085;
        const tax = invoice.tax ?? total - subtotal;

        await new Promise((resolve) => {
          root.render(
            <InvoiceTemplate
              invoice={invoice}
              selectedClient={invoice.client}
              selectedProject={invoice.project}
              subtotal={subtotal}
              tax={tax}
              total={total}
              format={format}
            />
          );

          setTimeout(resolve, 500);
        });

        const element = container.firstElementChild;

        if (!element) {
          throw new Error("Failed to render invoice for PDF");
        }

        const pdfBlob = await html2pdf()
          .set({
            margin: 0.3,
            filename: `${invoice.invoiceNumber || "invoice"}.pdf`,
            image: {
              type: "jpeg",
              quality: 1,
            },
            html2canvas: {
              scale: 3,
              useCORS: true,
              letterRendering: true,
            },
            jsPDF: {
              unit: "mm",
              format: "a4",
              orientation: "portrait",
            },
          })
          .from(element)
          .outputPdf("blob");

        // Cleanup rendered invoice
        root.unmount();

        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }

        // =================================================
        // SEND PDF TO RESPECTIVE CLIENT
        // =================================================
        const formData = new FormData();

        formData.append(
          "pdf",
          pdfBlob,
          `${invoice.invoiceNumber || "invoice"}.pdf`
        );

        formData.append("emailClient", "true");
        formData.append("clientEmail", clientEmail);

        await axios.post(
          `${base}/invoices/${invoiceId}/send`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        success++;

        addNotification({
          type: "invoice",
          icon: "send",
          iconColor: "text-primary",
          bgColor: "bg-primary-soft",
          title: "Invoice Sent",
          description: `#${invoice.invoiceNumber} emailed to ${clientEmail}`,
          borderColor: "border-l-primary",
        });

      } catch (error) {
        console.error(
          `Bulk send failed for invoice ${invoiceId}:`,
          error
        );

        failed++;
      }
    }

    // =================================================
    // RESULT
    // =================================================
    if (success > 0) {
      showSuccessToast(
        `${success} invoice${success > 1 ? "s" : ""} sent successfully`
      );
    }

    if (failed > 0) {
      showErrorToast(
        `${failed} invoice${failed > 1 ? "s" : ""} failed to send`
      );
    }

    // Clear selection after processing
    setRowSelection({});

  } catch (error) {
    console.error("BULK SEND ERROR:", error);

    showErrorToast(
      error.response?.data?.message ||
        error.message ||
        "Failed to send invoices"
    );
  } finally {
    setSendingId(null);
  }
}, [
  invoices,
  rowSelection,
  navigate,
  format,
  addNotification,
]);

  // =====================================================
// BULK REMIND
// =====================================================
const handleBulkRemind = useCallback(async () => {
  const selected = invoices.filter((inv) => {
    const id = inv.id || inv._id;
    return id && rowSelection[id];
  });

  if (selected.length === 0) {
    showErrorToast("Please select at least one invoice.");
    return;
  }

  const token = getToken();

  if (!token) {
    showErrorToast("Session expired. Please login again.");
    navigate("/login");
    return;
  }

  const base = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/v1"
  ).replace(/\/$/, "");

  let success = 0;
  let failed = 0;

  try {
    for (const invoice of selected) {
      const invoiceId = invoice.id || invoice._id;

      try {
        await axios.post(
          `${base}/invoices/${invoiceId}/remind`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        success++;
      } catch (error) {
        console.error(
          `Reminder failed for invoice ${invoiceId}:`,
          error
        );

        failed++;
      }
    }

    if (success > 0) {
      showReminderToast(
        `${success} reminder${success > 1 ? "s" : ""} sent`
      );

      addNotification({
        type: "reminder",
        icon: "notifications_active",
        iconColor: "text-warning",
        bgColor: "bg-warning-soft",
        title: "Reminders Sent",
        description: `${success} payment reminder email${
          success > 1 ? "s" : ""
        } sent`,
        borderColor: "border-l-warning",
      });
    }

    if (failed > 0) {
      showErrorToast(
        `${failed} reminder${failed > 1 ? "s" : ""} failed`
      );
    }

    setRowSelection({});

  } catch (error) {
    console.error("BULK REMINDER ERROR:", error);

    showErrorToast(
      error.response?.data?.message ||
        error.message ||
        "Failed to send reminders"
    );
  }
}, [
  invoices,
  rowSelection,
  navigate,
  addNotification,
]);

  // ==================== BULK DELETE ====================
  const handleBulkDelete = useCallback(async () => {
    const selected = invoices.filter((inv) => {
      const id = inv.id || inv._id;
      return id && rowSelection[id];
    });

    if (selected.length === 0) {
      showErrorToast("Please select at least one invoice.");
      return;
    }

    if (!window.confirm(`Delete ${selected.length} selected invoice(s)?`)) return;

    try {
      const token = getToken();
      if (!token) {
        showErrorToast("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

      await Promise.all(
        selected.map((inv) =>
          axios.delete(`${base}/invoices/${inv.id || inv._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      const deletedIds = new Set(selected.map((inv) => inv.id || inv._id));
      setInvoices((prev) => prev.filter((inv) => !deletedIds.has(inv.id || inv._id)));
      setRowSelection({});
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));

      showSuccessToast(`${selected.length} invoice(s) deleted`);
      addNotification({
        type: "invoice",
        icon: "delete",
        iconColor: "text-danger",
        bgColor: "bg-danger-soft",
        title: "Invoices Deleted",
        description: `${selected.length} invoice(s) deleted successfully`,
        borderColor: "border-l-danger",
      });
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        showErrorToast("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      showErrorToast(error.response?.data?.message || "Failed to delete invoices");
    }
  }, [invoices, rowSelection, navigate, addNotification]);

  // ==================== COUNTS & FILTERS ====================
  const counts = useMemo(() => {
    const normalized = invoices.map((inv) => ({
      ...inv,
      normStatus: normalizeStatus(inv.status),
    }));
    return {
      all: invoices.length,
      paid: normalized.filter((i) => i.normStatus === "paid").length,
      pending: normalized.filter((i) => i.normStatus === "pending").length,
      overdue: normalized.filter((i) => i.normStatus === "overdue").length,
      scheduled: normalized.filter((i) => i.normStatus === "scheduled").length,
      draft: normalized.filter((i) => i.normStatus === "draft").length,
    };
  }, [invoices]);

  const filteredData = useMemo(() => {
    return invoices.filter((invoice) => {
      const normStatus = normalizeStatus(invoice.status);
      const matchesTab = activeFilter === "all" || normStatus === activeFilter;
      const searchTerm = search.toLowerCase();
      const matchesSearch =
        getClientName(invoice.client).toLowerCase().includes(searchTerm) ||
        (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchTerm));
      const matchesStatus =
        invoiceFilters.status.length === 0 || invoiceFilters.status.includes(normStatus);

      const rawDate = invoice.issueDate || invoice.invoiceDate || invoice.date || invoice.createdAt;
      const invoiceDate = rawDate ? new Date(rawDate) : null;
      const isValidDate = invoiceDate && !isNaN(invoiceDate.getTime());

      const matchesFromDate =
        !invoiceFilters.fromDate || (isValidDate && invoiceDate >= new Date(invoiceFilters.fromDate));
      const endDate = invoiceFilters.toDate ? new Date(invoiceFilters.toDate) : null;
      if (endDate) endDate.setHours(23, 59, 59, 999);
      const matchesToDate = !endDate || (isValidDate && invoiceDate <= endDate);

      const amount = Number(getInvoiceAmount(invoice));
      const minAmount = invoiceFilters.minAmount !== "" ? Number(invoiceFilters.minAmount) : null;
      const maxAmount = invoiceFilters.maxAmount !== "" ? Number(invoiceFilters.maxAmount) : null;
      const matchesMinAmount = minAmount === null || amount >= minAmount;
      const matchesMaxAmount = maxAmount === null || amount <= maxAmount;
      const matchesCurrency =
        invoiceFilters.currency === "All" || (invoice.currency || "USD") === invoiceFilters.currency;

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
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  // ==================== COLUMNS ====================
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
          <span className="font-semibold text-text">#{row.original.invoiceNumber}</span>
        ),
      },
      {
        accessorKey: "client",
        header: "Client",
        cell: ({ row }) => {
          const client = row.original.client;
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center font-semibold text-xs">
                {getClientName(client).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-text">{getClientName(client)}</p>
                <p className="text-xs text-text-muted">{getClientEmail(client)}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "project",
        header: "Project",
        cell: ({ row }) => (
          <span className="text-text-secondary">{getProjectTitle(row.original)}</span>
        ),
      },
      {
        id: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-text-secondary">{formatInvoiceDate(row.original)}</span>
        ),
      },
      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-bold text-text">{format(getInvoiceAmount(row.original))}</span>
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
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                styles[displayStatus] || "bg-surface-secondary text-text-muted"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[displayStatus] || "bg-text-light"}`} />
              {displayStatus}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const inv = row.original;
          const invId = inv.id || inv._id;
          const isSending = sendingId === invId;

          return (
            <div className="flex items-center gap-1">
              <button
                title="Edit"
                onClick={() => navigate(`/composer/${invId}`)}
                className="p-2 rounded-lg text-text-light hover:bg-surface-hover hover:text-primary transition"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                title="View"
                onClick={() => openInvoiceModal(inv)}
                className="p-2 rounded-lg text-text-light hover:bg-surface-hover hover:text-primary transition"
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
              </button>
              <button
                title="Send Invoice"
                disabled={isSending}
                onClick={() => handleSendInvoice(inv)}
                className="p-2 rounded-lg text-text-light hover:bg-surface-hover hover:text-primary transition disabled:opacity-60"
              >
                <span className={`material-symbols-outlined text-[18px] ${isSending ? "animate-spin" : ""}`}>
                  {isSending ? "hourglass_top" : "send"}
                </span>
              </button>
            </div>
          );
        },
      },
    ],
    [navigate, handleSendInvoice, format, sendingId]
  );

  const selectedCount = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]).length,
    [rowSelection]
  );

  const stats = useMemo(() => {
    const paid = invoices.filter((i) => normalizeStatus(i.status) === "paid");
    const pending = invoices.filter((i) => normalizeStatus(i.status) === "pending");
    const overdue = invoices.filter((i) => normalizeStatus(i.status) === "overdue");
    const scheduled = invoices.filter((i) => normalizeStatus(i.status) === "scheduled");
    return {
      outstandingAmount: pending.reduce((s, i) => s + getInvoiceAmount(i), 0),
      paidAmount: paid.reduce((s, i) => s + getInvoiceAmount(i), 0),
      totalInvoices: invoices.length,
      overdueCount: overdue.length,
      scheduledCount: scheduled.length,
      paidCount: paid.length,
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
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
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
                onClick={() => handleFilterChange(filter.key)}
                className={`px-3.5 py-1.5 rounded-md text-[12.5px] font-semibold transition flex items-center gap-1.5 ${
                  activeFilter === filter.key
                    ? "bg-surface text-primary shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
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
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <div className="fade-in mb-3 p-3 bg-primary-soft border border-primary/20 rounded-xl flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              <b className="text-primary-dark">{selectedCount}</b> selected
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBulkSend}
                className="px-3 py-1.5 bg-surface border border-primary/30 text-primary-dark rounded-lg text-xs font-semibold hover:bg-primary-soft flex items-center gap-1 transition"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  send
                </span>
                Send
              </button>
              <button
                type="button"
                onClick={handleBulkRemind}
                className="px-3 py-1.5 bg-surface border border-primary/30 text-primary-dark rounded-lg text-xs font-semibold hover:bg-primary-soft flex items-center gap-1 transition"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  notifications_active
                </span>
                Remind
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-surface border border-danger/30 text-danger rounded-lg text-xs font-semibold hover:bg-danger-soft flex items-center gap-1 transition"
              >
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
  getRowId={(row) => row.id || row._id}
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
                format={format}
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
        onApply={() => {
          setFilterDrawer(false);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
        onReset={handleReset}
      />
    </>
  );
}