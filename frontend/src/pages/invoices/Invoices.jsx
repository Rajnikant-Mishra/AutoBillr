
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

// =====================================================
// TOKEN HELPER
// =====================================================

const getToken = () => {
  const plain = localStorage.getItem("token");

  if (plain && plain.startsWith("ey")) {
    return plain;
  }

  const auth = localStorage.getItem("autobiller-auth");

  if (auth) {
    try {
      const parsed = JSON.parse(auth);

      return (
        parsed?.state?.token ||
        parsed?.token ||
        null
      );
    } catch {
      if (auth.startsWith("ey")) {
        return auth;
      }
    }
  }

  return null;
};

// =====================================================
// API BASE URL
// =====================================================

const getApiBase = () => {
  return (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/v1"
  ).replace(/\/$/, "");
};

// =====================================================
// HELPERS
// =====================================================

const getInvoiceId = (invoice) => {
  return invoice?.id || invoice?._id || null;
};

const normalizeStatus = (status) => {
  if (!status) {
    return "draft";
  }

  return status
    .toString()
    .trim()
    .toLowerCase();
};

const getDisplayStatus = (status) => {
  if (!status) {
    return "Draft";
  }

  const normalized = status
    .toString()
    .trim()
    .toLowerCase();

  return (
    normalized.charAt(0).toUpperCase() +
    normalized.slice(1)
  );
};

const getInvoiceAmount = (invoice) => {
  const raw =
    invoice?.total ??
    invoice?.totalAmount ??
    invoice?.grandTotal ??
    invoice?.amount ??
    0;

  if (typeof raw === "number") {
    return raw;
  }

  return (
    parseFloat(
      String(raw)
        .replace(/,/g, "")
        .replace(/[^\d.-]/g, "")
    ) || 0
  );
};

const getClientName = (client) => {
  if (!client) {
    return "Unknown Client";
  }

  if (typeof client === "string") {
    return client;
  }

  return client.name || "Unknown Client";
};

const getClientEmail = (client) => {
  if (!client) {
    return null;
  }

  if (typeof client === "object") {
    return client.email || null;
  }

  return null;
};

const getProjectTitle = (invoice) => {
  if (!invoice) {
    return "—";
  }

  if (invoice.project) {
    if (typeof invoice.project === "string") {
      return invoice.project;
    }

    return (
      invoice.project.title ||
      invoice.project.name ||
      "—"
    );
  }

  if (
    invoice.client?.projects &&
    invoice.client.projects.length > 0
  ) {
    return (
      invoice.client.projects[0].title ||
      invoice.client.projects[0].name ||
      "—"
    );
  }

  return "—";
};

const formatInvoiceDate = (invoice) => {
  const rawDate =
    invoice?.issueDate ||
    invoice?.invoiceDate ||
    invoice?.date ||
    invoice?.createdAt;

  if (!rawDate) {
    return "—";
  }

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// =====================================================
// PDF GENERATOR
// =====================================================

const generateInvoicePdf = async ({
  invoice,
  format,
}) => {
  const container = document.createElement("div");

  container.style.position = "absolute";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.background = "#ffffff";
  container.style.zIndex = "-1";

  document.body.appendChild(container);

  let root = null;

  try {
    const { createRoot } = await import(
      "react-dom/client"
    );

    root = createRoot(container);

    const total = getInvoiceAmount(invoice);

    const subtotal =
      invoice?.subtotal !== undefined &&
      invoice?.subtotal !== null
        ? Number(invoice.subtotal)
        : total / 1.085;

    const tax =
      invoice?.tax !== undefined &&
      invoice?.tax !== null
        ? Number(invoice.tax)
        : total - subtotal;

    await new Promise((resolve) => {
      root.render(
        <InvoiceTemplate
          invoice={invoice}
          selectedClient={invoice?.client}
          selectedProject={invoice?.project}
          subtotal={subtotal}
          tax={tax}
          total={total}
          format={format}
        />
      );

      setTimeout(resolve, 600);
    });

    const element = container.firstElementChild;

    if (!element) {
      throw new Error(
        "Failed to render invoice for PDF"
      );
    }

    const pdfBlob = await html2pdf()
      .set({
        margin: 0.3,

        filename: `${
          invoice?.invoiceNumber || "invoice"
        }.pdf`,

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

    return pdfBlob;
  } finally {
    try {
      if (root) {
        root.unmount();
      }
    } catch (cleanupError) {
      console.warn(
        "PDF React root cleanup failed:",
        cleanupError
      );
    }

    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

// =====================================================
// COMPONENT
// =====================================================

export default function Invoices() {
  const navigate = useNavigate();

  const { format } = useCurrency();

  const { addNotification } =
    useNotificationStore();

  // ===================================================
  // STATE
  // ===================================================

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [search, setSearch] = useState("");

  const [rowSelection, setRowSelection] =
    useState({});

  const [selectedInvoice, setSelectedInvoice] =
    useState(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [invoices, setInvoices] =
    useState([]);

  const [invoiceFilters, setInvoiceFilters] =
    useState({
      status: [],
      fromDate: "",
      toDate: "",
      minAmount: "",
      maxAmount: "",
      currency: "All",
    });

  const [filterDrawer, setFilterDrawer] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [pagination, setPagination] =
    useState({
      pageIndex: 0,
      pageSize: 10,
    });

  const [sendingId, setSendingId] =
    useState(null);

  // ===================================================
  // FILTER HANDLERS
  // ===================================================

  const handleFilterChange = useCallback(
    (key) => {
      setActiveFilter(key);

      setPagination((prev) => ({
        ...prev,
        pageIndex: 0,
      }));
    },
    []
  );

  const handleSearchChange = useCallback(
    (event) => {
      setSearch(event.target.value);

      setPagination((prev) => ({
        ...prev,
        pageIndex: 0,
      }));
    },
    []
  );

  // ===================================================
  // FETCH INVOICES
  // ===================================================

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        showErrorToast(
          "Session expired. Please login again."
        );

        navigate("/login");
        return;
      }

      const base = getApiBase();

      const response = await axios.get(
        `${base}/invoices`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const list = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.invoices)
        ? response.data.invoices
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setInvoices(list);
    } catch (error) {
      console.error(
        "Fetch invoices error:",
        error
      );

      if (error.response?.status === 401) {
        showErrorToast(
          "Session expired. Please login again."
        );

        navigate("/login");
        return;
      }

      showErrorToast(
        error.response?.data?.message ||
          "Failed to load invoices"
      );

      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // ===================================================
  // SINGLE SEND INVOICE
  // PDF + EMAIL TO RESPECTIVE CLIENT
  // ===================================================

  const handleSendInvoice = useCallback(
    async (invoice) => {
      const invoiceId = getInvoiceId(invoice);

      if (!invoiceId) {
        showErrorToast(
          "Invoice ID not found"
        );
        return;
      }

      try {
        setSendingId(invoiceId);

        const token = getToken();

        if (!token) {
          showErrorToast(
            "Session expired. Please login again."
          );

          navigate("/login");
          return;
        }

        const clientEmail =
          getClientEmail(invoice?.client);

        if (!clientEmail) {
          showErrorToast(
            `No email address found for ${getClientName(
              invoice?.client
            )}`
          );

          return;
        }

        // =============================================
        // GENERATE PDF
        // =============================================

        const pdfBlob =
          await generateInvoicePdf({
            invoice,
            format,
          });

        // =============================================
        // SEND PDF TO CLIENT
        // =============================================

        const formData = new FormData();

        formData.append(
          "pdf",
          pdfBlob,
          `${
            invoice?.invoiceNumber || "invoice"
          }.pdf`
        );

        formData.append(
          "emailClient",
          "true"
        );

        formData.append(
          "clientEmail",
          clientEmail
        );

        const base = getApiBase();

        await axios.post(
          `${base}/invoices/${invoiceId}/send`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // =============================================
        // SUCCESS
        // =============================================

        showSuccessToast(
          `Invoice sent to ${getClientName(
            invoice?.client
          )}`
        );

        addNotification({
          type: "invoice",
          icon: "send",
          iconColor: "text-primary",
          bgColor: "bg-primary-soft",
          title: "Invoice Sent",
          description: `#${
            invoice?.invoiceNumber || invoiceId
          } emailed to ${clientEmail}`,
          borderColor: "border-l-primary",
        });
      } catch (error) {
        console.error(
          "Send invoice error:",
          error
        );

        if (error.response?.status === 401) {
          showErrorToast(
            "Session expired. Please login again."
          );

          navigate("/login");
          return;
        }

        showErrorToast(
          error.response?.data?.message ||
            error.message ||
            "Failed to send invoice"
        );
      } finally {
        setSendingId(null);
      }
    },
    [
      navigate,
      addNotification,
      format,
    ]
  );

  // ===================================================
  // BULK SEND
  // PDF + EMAIL TO EACH CLIENT
  // ===================================================

  const handleBulkSend = useCallback(
    async () => {
      const selected = invoices.filter(
        (invoice) => {
          const id = getInvoiceId(invoice);

          return (
            id &&
            rowSelection[id]
          );
        }
      );

      if (selected.length === 0) {
        showErrorToast(
          "Please select at least one invoice."
        );

        return;
      }

      const token = getToken();

      if (!token) {
        showErrorToast(
          "Session expired. Please login again."
        );

        navigate("/login");
        return;
      }

      const base = getApiBase();

      let success = 0;
      let failed = 0;

      setSendingId("bulk");

      try {
        for (const invoice of selected) {
          const invoiceId =
            getInvoiceId(invoice);

          try {
            // =========================================
            // GET CLIENT EMAIL
            // =========================================

            const clientEmail =
              getClientEmail(
                invoice?.client
              );

            if (!clientEmail) {
              throw new Error(
                `No email address for ${getClientName(
                  invoice?.client
                )}`
              );
            }

            // =========================================
            // GENERATE PDF
            // =========================================

            const pdfBlob =
              await generateInvoicePdf({
                invoice,
                format,
              });

            // =========================================
            // SEND PDF
            // =========================================

            const formData =
              new FormData();

            formData.append(
              "pdf",
              pdfBlob,
              `${
                invoice?.invoiceNumber ||
                "invoice"
              }.pdf`
            );

            formData.append(
              "emailClient",
              "true"
            );

            formData.append(
              "clientEmail",
              clientEmail
            );

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
              description: `#${
                invoice?.invoiceNumber ||
                invoiceId
              } emailed to ${clientEmail}`,
              borderColor:
                "border-l-primary",
            });
          } catch (error) {
            console.error(
              `Bulk send failed for invoice ${invoiceId}:`,
              error
            );

            failed++;
          }
        }

        // ===========================================
        // RESULTS
        // ===========================================

        if (success > 0) {
          showSuccessToast(
            `${success} invoice${
              success > 1 ? "s" : ""
            } sent successfully`
          );
        }

        if (failed > 0) {
          showErrorToast(
            `${failed} invoice${
              failed > 1 ? "s" : ""
            } failed to send`
          );
        }

        setRowSelection({});
      } catch (error) {
        console.error(
          "BULK SEND ERROR:",
          error
        );

        showErrorToast(
          error.response?.data?.message ||
            error.message ||
            "Failed to send invoices"
        );
      } finally {
        setSendingId(null);
      }
    },
    [
      invoices,
      rowSelection,
      navigate,
      format,
      addNotification,
    ]
  );

  // ===================================================
  // BULK REMIND
  // ===================================================

  const handleBulkRemind = useCallback(
    async () => {
      const selected = invoices.filter(
        (invoice) => {
          const id = getInvoiceId(invoice);

          return (
            id &&
            rowSelection[id]
          );
        }
      );

      if (selected.length === 0) {
        showErrorToast(
          "Please select at least one invoice."
        );

        return;
      }

      const token = getToken();

      if (!token) {
        showErrorToast(
          "Session expired. Please login again."
        );

        navigate("/login");
        return;
      }

      const base = getApiBase();

      let success = 0;
      let failed = 0;

      try {
        for (const invoice of selected) {
          const invoiceId =
            getInvoiceId(invoice);

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
            `${success} reminder${
              success > 1 ? "s" : ""
            } sent`
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
            borderColor:
              "border-l-warning",
          });
        }

        if (failed > 0) {
          showErrorToast(
            `${failed} reminder${
              failed > 1 ? "s" : ""
            } failed`
          );
        }

        setRowSelection({});
      } catch (error) {
        console.error(
          "BULK REMINDER ERROR:",
          error
        );

        showErrorToast(
          error.response?.data?.message ||
            error.message ||
            "Failed to send reminders"
        );
      }
    },
    [
      invoices,
      rowSelection,
      navigate,
      addNotification,
    ]
  );

  // ===================================================
  // BULK DELETE
  // ===================================================

  const handleBulkDelete = useCallback(
    async () => {
      const selected = invoices.filter(
        (invoice) => {
          const id = getInvoiceId(invoice);

          return (
            id &&
            rowSelection[id]
          );
        }
      );

      if (selected.length === 0) {
        showErrorToast(
          "Please select at least one invoice."
        );

        return;
      }

      const confirmed = window.confirm(
        `Delete ${selected.length} selected invoice(s)?`
      );

      if (!confirmed) {
        return;
      }

      try {
        const token = getToken();

        if (!token) {
          showErrorToast(
            "Session expired. Please login again."
          );

          navigate("/login");
          return;
        }

        const base = getApiBase();

        await Promise.all(
          selected.map((invoice) => {
            const invoiceId =
              getInvoiceId(invoice);

            return axios.delete(
              `${base}/invoices/${invoiceId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          })
        );

        const deletedIds =
          new Set(
            selected.map((invoice) =>
              getInvoiceId(invoice)
            )
          );

        setInvoices((prev) =>
          prev.filter(
            (invoice) =>
              !deletedIds.has(
                getInvoiceId(invoice)
              )
          )
        );

        setRowSelection({});

        setPagination((prev) => ({
          ...prev,
          pageIndex: 0,
        }));

        showSuccessToast(
          `${selected.length} invoice(s) deleted`
        );

        addNotification({
          type: "invoice",
          icon: "delete",
          iconColor: "text-danger",
          bgColor: "bg-danger-soft",
          title: "Invoices Deleted",
          description: `${selected.length} invoice(s) deleted successfully`,
          borderColor:
            "border-l-danger",
        });
      } catch (error) {
        console.error(
          "Bulk delete error:",
          error
        );

        if (error.response?.status === 401) {
          showErrorToast(
            "Session expired. Please login again."
          );

          navigate("/login");
          return;
        }

        showErrorToast(
          error.response?.data?.message ||
            "Failed to delete invoices"
        );
      }
    },
    [
      invoices,
      rowSelection,
      navigate,
      addNotification,
    ]
  );

  // ===================================================
  // COUNTS
  // ===================================================

  const counts = useMemo(() => {
    const normalized =
      invoices.map((invoice) => ({
        ...invoice,
        normStatus:
          normalizeStatus(
            invoice.status
          ),
      }));

    return {
      all: invoices.length,

      paid: normalized.filter(
        (invoice) =>
          invoice.normStatus === "paid"
      ).length,

      pending: normalized.filter(
        (invoice) =>
          invoice.normStatus === "pending"
      ).length,

      overdue: normalized.filter(
        (invoice) =>
          invoice.normStatus === "overdue"
      ).length,

      scheduled: normalized.filter(
        (invoice) =>
          invoice.normStatus === "scheduled"
      ).length,

      draft: normalized.filter(
        (invoice) =>
          invoice.normStatus === "draft"
      ).length,
    };
  }, [invoices]);

  // ===================================================
  // FILTERED DATA
  // ===================================================

  const filteredData = useMemo(() => {
    const searchTerm =
      search.trim().toLowerCase();

    return invoices.filter(
      (invoice) => {
        const normStatus =
          normalizeStatus(
            invoice.status
          );

        // ---------------------------------------------
        // TAB FILTER
        // ---------------------------------------------

        const matchesTab =
          activeFilter === "all" ||
          normStatus === activeFilter;

        // ---------------------------------------------
        // SEARCH
        // ---------------------------------------------

        const clientName =
          getClientName(
            invoice.client
          ).toLowerCase();

        const invoiceNumber =
          invoice.invoiceNumber
            ?.toString()
            .toLowerCase() || "";

        const clientEmail =
          getClientEmail(
            invoice.client
          )
            ?.toLowerCase() || "";

        const matchesSearch =
          !searchTerm ||
          clientName.includes(
            searchTerm
          ) ||
          invoiceNumber.includes(
            searchTerm
          ) ||
          clientEmail.includes(
            searchTerm
          );

        // ---------------------------------------------
        // STATUS FILTER
        // ---------------------------------------------

        const matchesStatus =
          invoiceFilters.status
            .length === 0 ||
          invoiceFilters.status.includes(
            normStatus
          );

        // ---------------------------------------------
        // DATE FILTER
        // ---------------------------------------------

        const rawDate =
          invoice.issueDate ||
          invoice.invoiceDate ||
          invoice.date ||
          invoice.createdAt;

        const invoiceDate =
          rawDate
            ? new Date(rawDate)
            : null;

        const isValidDate =
          invoiceDate &&
          !Number.isNaN(
            invoiceDate.getTime()
          );

        const matchesFromDate =
          !invoiceFilters.fromDate ||
          (
            isValidDate &&
            invoiceDate >=
              new Date(
                invoiceFilters.fromDate
              )
          );

        let endDate = null;

        if (invoiceFilters.toDate) {
          endDate = new Date(
            invoiceFilters.toDate
          );

          endDate.setHours(
            23,
            59,
            59,
            999
          );
        }

        const matchesToDate =
          !endDate ||
          (
            isValidDate &&
            invoiceDate <= endDate
          );

        // ---------------------------------------------
        // AMOUNT FILTER
        // ---------------------------------------------

        const amount =
          Number(
            getInvoiceAmount(invoice)
          );

        const minAmount =
          invoiceFilters.minAmount !== ""
            ? Number(
                invoiceFilters.minAmount
              )
            : null;

        const maxAmount =
          invoiceFilters.maxAmount !== ""
            ? Number(
                invoiceFilters.maxAmount
              )
            : null;

        const matchesMinAmount =
          minAmount === null ||
          amount >= minAmount;

        const matchesMaxAmount =
          maxAmount === null ||
          amount <= maxAmount;

        // ---------------------------------------------
        // CURRENCY FILTER
        // ---------------------------------------------

        const invoiceCurrency =
          invoice.currency || "INR";

        const matchesCurrency =
          invoiceFilters.currency ===
            "All" ||
          invoiceCurrency ===
            invoiceFilters.currency;

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
      }
    );
  }, [
    invoices,
    search,
    activeFilter,
    invoiceFilters,
  ]);

  // ===================================================
  // MODAL
  // ===================================================

  const openInvoiceModal = useCallback(
    (invoice) => {
      setSelectedInvoice(invoice);
      setIsModalOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  }, []);

  // ===================================================
  // TABLE COLUMNS
  // ===================================================

  const columns = useMemo(
    () => [
      // -----------------------------------------------
      // SELECT
      // -----------------------------------------------

      {
        id: "select",

        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all invoices"
          />
        ),

        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Select invoice ${
              row.original.invoiceNumber ||
              ""
            }`}
          />
        ),
      },

      // -----------------------------------------------
      // INVOICE
      // -----------------------------------------------

      {
        accessorKey: "invoiceNumber",

        header: "Invoice",

        cell: ({ row }) => (
          <span className="font-semibold text-text">
            #
            {row.original.invoiceNumber ||
              "—"}
          </span>
        ),
      },

      // -----------------------------------------------
      // CLIENT
      // -----------------------------------------------

      {
        accessorKey: "client",

        header: "Client",

        cell: ({ row }) => {
          const client =
            row.original.client;

          const clientName =
            getClientName(client);

          const clientEmail =
            getClientEmail(client);

          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center font-semibold text-xs shrink-0">
                {clientName
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-text truncate">
                  {clientName}
                </p>

                <p className="text-xs text-text-muted truncate">
                  {clientEmail ||
                    "No Email"}
                </p>
              </div>
            </div>
          );
        },
      },

      // -----------------------------------------------
      // PROJECT
      // -----------------------------------------------

      {
        id: "project",

        header: "Project",

        cell: ({ row }) => (
          <span className="text-text-secondary">
            {getProjectTitle(
              row.original
            )}
          </span>
        ),
      },

      // -----------------------------------------------
      // DATE
      // -----------------------------------------------

      {
        id: "date",

        header: "Date",

        cell: ({ row }) => (
          <span className="text-text-secondary">
            {formatInvoiceDate(
              row.original
            )}
          </span>
        ),
      },

      // -----------------------------------------------
      // AMOUNT
      // -----------------------------------------------

      {
        id: "amount",

        header: "Amount",

        cell: ({ row }) => (
          <span className="font-bold text-text">
            {format(
              getInvoiceAmount(
                row.original
              )
            )}
          </span>
        ),
      },

      // -----------------------------------------------
      // STATUS
      // -----------------------------------------------

      {
        accessorKey: "status",

        header: "Status",

        cell: ({ row }) => {
          const displayStatus =
            getDisplayStatus(
              row.original.status
            );

          const styles = {
            Paid:
              "bg-success-soft text-success",

            Overdue:
              "bg-danger-soft text-danger",

            Draft:
              "bg-surface-secondary text-text-muted",

            Scheduled:
              "bg-info-soft text-info",

            Pending:
              "bg-warning-soft text-warning",

            Sent:
              "bg-info-soft text-info",
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
                inline-flex
                items-center
                gap-2
                px-3
                py-1
                rounded-full
                text-[11px]
                font-bold
                uppercase
                tracking-wide
                ${
                  styles[
                    displayStatus
                  ] ||
                  "bg-surface-secondary text-text-muted"
                }
              `}
            >
              <span
                className={`
                  w-1.5
                  h-1.5
                  rounded-full
                  ${
                    dotStyles[
                      displayStatus
                    ] ||
                    "bg-text-light"
                  }
                `}
              />

              {displayStatus}
            </span>
          );
        },
      },

      // -----------------------------------------------
      // ACTIONS
      // -----------------------------------------------

      {
        id: "actions",

        header: "Actions",

        cell: ({ row }) => {
          const invoice =
            row.original;

          const invoiceId =
            getInvoiceId(invoice);

          const isSending =
            sendingId === invoiceId ||
            sendingId === "bulk";

          return (
            <div className="flex items-center gap-1">
              {/* EDIT */}
              <button
                type="button"
                title="Edit"
                onClick={() =>
                  navigate(
                    `/composer/${invoiceId}`
                  )
                }
                className="
                  p-2
                  rounded-lg
                  text-text-light
                  hover:bg-surface-hover
                  hover:text-primary
                  transition
                "
              >
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
              </button>

              {/* VIEW */}
              <button
                type="button"
                title="View"
                onClick={() =>
                  openInvoiceModal(
                    invoice
                  )
                }
                className="
                  p-2
                  rounded-lg
                  text-text-light
                  hover:bg-surface-hover
                  hover:text-primary
                  transition
                "
              >
                <span className="material-symbols-outlined text-[18px]">
                  visibility
                </span>
              </button>

              {/* SEND */}
              <button
                type="button"
                title={
                  isSending
                    ? "Sending..."
                    : "Send Invoice"
                }
                disabled={
                  isSending ||
                  !invoiceId
                }
                onClick={() =>
                  handleSendInvoice(
                    invoice
                  )
                }
                className="
                  p-2
                  rounded-lg
                  text-text-light
                  hover:bg-surface-hover
                  hover:text-primary
                  transition
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >
                <span
                  className={`
                    material-symbols-outlined
                    text-[18px]
                    ${
                      isSending
                        ? "animate-spin"
                        : ""
                    }
                  `}
                >
                  {isSending
                    ? "hourglass_top"
                    : "send"}
                </span>
              </button>
            </div>
          );
        },
      },
    ],
    [
      navigate,
      openInvoiceModal,
      handleSendInvoice,
      format,
      sendingId,
    ]
  );

  // ===================================================
  // SELECTED COUNT
  // ===================================================

  const selectedCount = useMemo(
    () =>
      Object.keys(rowSelection).filter(
        (id) =>
          rowSelection[id]
      ).length,
    [rowSelection]
  );

  // ===================================================
  // STATS
  // ===================================================

  const stats = useMemo(() => {
    const paid =
      invoices.filter(
        (invoice) =>
          normalizeStatus(
            invoice.status
          ) === "paid"
      );

    const pending =
      invoices.filter(
        (invoice) =>
          normalizeStatus(
            invoice.status
          ) === "pending"
      );

    const overdue =
      invoices.filter(
        (invoice) =>
          normalizeStatus(
            invoice.status
          ) === "overdue"
      );

    const scheduled =
      invoices.filter(
        (invoice) =>
          normalizeStatus(
            invoice.status
          ) === "scheduled"
      );

    return {
      outstandingAmount:
        pending.reduce(
          (sum, invoice) =>
            sum +
            getInvoiceAmount(
              invoice
            ),
          0
        ),

      paidAmount:
        paid.reduce(
          (sum, invoice) =>
            sum +
            getInvoiceAmount(
              invoice
            ),
          0
        ),

      totalInvoices:
        invoices.length,

      overdueCount:
        overdue.length,

      scheduledCount:
        scheduled.length,

      paidCount:
        paid.length,
    };
  }, [invoices]);

  // ===================================================
  // RESET FILTERS
  // ===================================================

  const handleReset = useCallback(
    () => {
      setInvoiceFilters({
        status: [],
        fromDate: "",
        toDate: "",
        minAmount: "",
        maxAmount: "",
        currency: "All",
      });

      setPagination((prev) => ({
        ...prev,
        pageIndex: 0,
      }));
    },
    []
  );

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>
      <div className="space-y-6">
        {/* ==========================================
            HEADER
        ========================================== */}

        <SectionHeader
          title="Invoices"
          description={`Manage ${counts.all} invoices across your billing pipeline.`}
          secondaryAction={{
            label: "Filter",
            icon: "filter_list",
            onClick: () =>
              setFilterDrawer(true),
          }}
          primaryAction={{
            label: "New Invoice",
            icon: "add",
            onClick: () =>
              navigate("/composer"),
          }}
        />

        {/* ==========================================
            STATS
        ========================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Outstanding"
            value={format(
              stats.outstandingAmount
            )}
            sub={`${counts.pending} pending · ${counts.overdue} overdue`}
            badge={`${counts.pending}`}
            icon="account_balance"
            variant="dashboard"
          />

          <StatCard
            title="Paid Invoices"
            value={format(
              stats.paidAmount
            )}
            sub={`${stats.paidCount} paid invoices`}
            badge={`${stats.paidCount}`}
            icon="task_alt"
            variant="dashboard"
          />

          <StatCard
            title="Total Invoices"
            value={
              stats.totalInvoices
            }
            sub={`${counts.draft} drafts`}
            badge={
              stats.totalInvoices
            }
            icon="receipt_long"
            variant="dashboard"
          />

          <StatCard
            title="Scheduled"
            value={
              stats.scheduledCount
            }
            sub="Auto scheduled invoices"
            badge={
              stats.scheduledCount
            }
            icon="schedule"
            variant="dashboard"
          />
        </div>

        {/* ==========================================
            FILTER TABS + SEARCH
        ========================================== */}

        <div className="flex flex-col md:flex-row gap-3 justify-between">
          <div className="inline-flex p-1 bg-surface-secondary rounded-lg gap-1 overflow-x-auto">
            {[
              {
                key: "all",
                label: "All",
                count: counts.all,
              },
              {
                key: "paid",
                label: "Paid",
                count: counts.paid,
              },
              {
                key: "pending",
                label: "Pending",
                count: counts.pending,
              },
              {
                key: "overdue",
                label: "Overdue",
                count: counts.overdue,
              },
              {
                key: "scheduled",
                label: "Scheduled",
                count: counts.scheduled,
              },
              {
                key: "draft",
                label: "Draft",
                count: counts.draft,
              },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() =>
                  handleFilterChange(
                    filter.key
                  )
                }
                className={`
                  px-3.5
                  py-1.5
                  rounded-md
                  text-[12.5px]
                  font-semibold
                  transition
                  flex
                  items-center
                  gap-1.5
                  whitespace-nowrap
                  ${
                    activeFilter ===
                    filter.key
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
              onChange={
                handleSearchChange
              }
            />
          </div>
        </div>

        {/* ==========================================
            BULK ACTIONS
        ========================================== */}

        {selectedCount > 0 && (
          <div className="fade-in mb-3 p-3 bg-primary-soft border border-primary/20 rounded-xl flex items-center justify-between gap-3">
            <div className="text-sm text-text-secondary">
              <b className="text-primary-dark">
                {selectedCount}
              </b>{" "}
              selected
            </div>

            <div className="flex gap-2">
              {/* SEND */}
              <button
                type="button"
                onClick={
                  handleBulkSend
                }
                disabled={
                  sendingId === "bulk"
                }
                className="
                  px-3
                  py-1.5
                  bg-surface
                  border
                  border-primary/30
                  text-primary-dark
                  rounded-lg
                  text-xs
                  font-semibold
                  hover:bg-primary-soft
                  flex
                  items-center
                  gap-1
                  transition
                  disabled:opacity-60
                "
              >
                <span
                  className={`
                    material-symbols-outlined
                    ${sendingId === "bulk"
                      ? "animate-spin"
                      : ""}
                  `}
                  style={{
                    fontSize: 14,
                  }}
                >
                  {sendingId === "bulk"
                    ? "hourglass_top"
                    : "send"}
                </span>

                {sendingId === "bulk"
                  ? "Sending..."
                  : "Send"}
              </button>

              {/* REMIND */}
              <button
                type="button"
                onClick={
                  handleBulkRemind
                }
                disabled={
                  sendingId === "bulk"
                }
                className="
                  px-3
                  py-1.5
                  bg-surface
                  border
                  border-primary/30
                  text-primary-dark
                  rounded-lg
                  text-xs
                  font-semibold
                  hover:bg-primary-soft
                  flex
                  items-center
                  gap-1
                  transition
                  disabled:opacity-60
                "
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 14,
                  }}
                >
                  notifications_active
                </span>

                Remind
              </button>

              {/* DELETE */}
              <button
                type="button"
                onClick={
                  handleBulkDelete
                }
                disabled={
                  sendingId === "bulk"
                }
                className="
                  px-3
                  py-1.5
                  bg-surface
                  border
                  border-danger/30
                  text-danger
                  rounded-lg
                  text-xs
                  font-semibold
                  hover:bg-danger-soft
                  flex
                  items-center
                  gap-1
                  transition
                  disabled:opacity-60
                "
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 14,
                  }}
                >
                  delete
                </span>

                Delete
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            TABLE
        ========================================== */}

        <DataTable
          data={filteredData}
          columns={columns}
          loading={loading}
          pagination={pagination}
          setPagination={
            setPagination
          }
          pageSizes={[
            5,
            10,
            20,
            50,
          ]}
          emptyMessage="No invoices found"
          rowSelection={
            rowSelection
          }
          setRowSelection={
            setRowSelection
          }
          getRowId={(row) =>
            getInvoiceId(row)
          }
        />

        {/* ==========================================
            INVOICE VIEW MODAL
        ========================================== */}

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`Invoice ${
            selectedInvoice?.invoiceNumber ||
            ""
          }`}
          size="lg"
          position="right-modal"
        >
          {selectedInvoice && (
            <div className="max-w-[700px] max-h-[800px] mx-auto scale-90 origin-top">
              <InvoiceTemplate
                invoice={
                  selectedInvoice
                }
                selectedClient={
                  selectedInvoice.client
                }
                selectedProject={
                  selectedInvoice.project
                }
                subtotal={
                  selectedInvoice.subtotal
                }
                tax={
                  selectedInvoice.tax
                }
                total={
                  selectedInvoice.total
                }
                format={format}
              />
            </div>
          )}
        </Modal>
      </div>

      {/* ============================================
          FILTER DRAWER
      ============================================ */}

      <InvoiceFilterDrawer
        isOpen={filterDrawer}
        onClose={() =>
          setFilterDrawer(false)
        }
        filters={invoiceFilters}
        setFilters={
          setInvoiceFilters
        }
        onApply={() => {
          setFilterDrawer(false);

          setPagination((prev) => ({
            ...prev,
            pageIndex: 0,
          }));
        }}
        onReset={handleReset}
      />
    </>
  );
}
