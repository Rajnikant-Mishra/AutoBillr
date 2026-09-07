import React, { useEffect, useState, useMemo, useRef } from "react";
import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import FormInput from "../../components/ui/FormInput";
import Button from "../../components/ui/Button";
import { getAuthToken, clearAuth } from "../../utils/auth";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  showSuccessToast,
  showErrorToast,
} from "../../components/ui/CustomToast";
import { useReactToPrint } from "react-to-print";
import InvoiceTemplate from "./InvoiceTemplate";
import html2pdf from "html2pdf.js";
import useCurrency from "../../hooks/useCurrency";
import { useNotificationStore } from "../../store/notificationStore";

export default function Composer() {
  const [clients, setClients] = useState([]);
  const [projectsByClient, setProjectsByClient] = useState({});
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const { addNotification } = useNotificationStore();
  const invoiceRef = useRef();
  const { format } = useCurrency();

  const today = new Date();
  const defaultDueDate = new Date();
  defaultDueDate.setDate(today.getDate() + 30);

  const initialInvoiceState = {
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    client: "",
    project: "",
    invoiceDate: today.toISOString().split("T")[0],
    dueDate: defaultDueDate.toISOString().split("T")[0],
    items: [
      { id: 1, desc: "UI/UX Design — Sprint 1", qty: 40, rate: 116 },
      { id: 2, desc: "Technical Consultancy", qty: 10, rate: 139.2 },
    ],
  };

  const [invoice, setInvoice] = useState(initialInvoiceState);
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const resetInvoiceForm = () => {
    const newInvoiceNumber = `INV-${new Date().getFullYear()}-${String(
      Date.now()
    ).slice(-4)}`;
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 30);

    setInvoice({
      ...initialInvoiceState,
      invoiceNumber: newInvoiceNumber,
      invoiceDate: today.toISOString().split("T")[0],
      dueDate: due.toISOString().split("T")[0],
    });
  };

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: invoice.invoiceNumber,
  });

  const handleDownloadPdf = () => {
    const element = invoiceRef.current;
    const options = {
      margin: 0.3,
      filename: `${invoice.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 4, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(options).from(element).save();
  };

  const [settings, setSettings] = useState({
    payLink: true,
    emailClient: true,
    autoCharge: false,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch Clients
  useEffect(() => {
    let cancelled = false;

    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const token =
          getAuthToken() || localStorage.getItem("autobiller-auth");

        if (!token) {
          showErrorToast("Session expired. Please login again.");
          navigate("/login");
          return;
        }

        const base = (
          import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
        ).replace(/\/$/, "");

        const response = await fetch(`${base}/clients`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("autobiller-auth");
          showErrorToast("Session expired. Please login again.");
          navigate("/login");
          return;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message || `Failed to load clients (${response.status})`
          );
        }

        let list = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data.clients)) list = data.clients;
        else if (Array.isArray(data.data)) list = data.data;
        else if (Array.isArray(data.result)) list = data.result;

        list = list
          .map((c) => ({
            ...c,
            id: c.id || c._id,
            name: c.name || c.clientName || "Unnamed",
          }))
          .filter((c) => c.id);

        if (!cancelled) setClients(list);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        showErrorToast(error.message || "Failed to load clients");
        if (!cancelled) setClients([]);
      } finally {
        if (!cancelled) setLoadingClients(false);
      }
    };

    fetchClients();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Fetch Projects when Client is selected
  useEffect(() => {
    if (!invoice.client) return;

    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const token = localStorage.getItem("autobiller-auth");

        if (!token) {
          showErrorToast("Session expired. Please login again.");
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/projects?clientId=${invoice.client}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("autobiller-auth");
          localStorage.removeItem("autobillr_subscription");
          localStorage.removeItem("user");
          showErrorToast("Session expired. Please login again.");
          navigate("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP Error: ${response.status}`);
        }

        setProjectsByClient((prev) => ({
          ...prev,
          [invoice.client]: Array.isArray(data) ? data : data.projects || [],
        }));
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        showErrorToast(error.message || "Failed to load projects");
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [invoice.client, navigate]);

  const currentClientProjects = projectsByClient[invoice.client] || [];
  const selectedClient = clients.find((c) => c.id === invoice.client);
  const selectedProject = currentClientProjects.find(
    (p) => p.id === invoice.project
  );

  const addItem = () => {
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), desc: "", qty: 1, rate: 0 }],
    }));
  };

  const updateItem = (id, field, value) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "qty" || field === "rate"
                  ? Number(value) || 0
                  : value,
            }
          : item
      ),
    }));
  };

  const removeItem = (id) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const updateField = (field, value) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setInvoice((prev) => ({
      ...prev,
      client: clientId,
      project: "",
    }));
  };

  const subtotal = useMemo(
    () => invoice.items.reduce((sum, item) => sum + item.qty * item.rate, 0),
    [invoice.items]
  );
  const tax = subtotal * 0.085;
  const total = subtotal + tax;

  const handleFinalizeInvoice = async () => {
    try {
      setSavingInvoice(true);

      if (!invoice.client) {
        showErrorToast("Please select a Client");
        return;
      }
      if (!invoice.project) {
        showErrorToast("Please select a Project");
        return;
      }

      const payload = {
        ...invoice,
        subtotal,
        tax,
        total,
        payLink: settings.payLink,
        emailClient: settings.emailClient,
        autoCharge: settings.autoCharge,
        status: "Scheduled",
      };

      const token = localStorage.getItem("autobiller-auth");
      if (!token) {
        showErrorToast("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        id
          ? `${import.meta.env.VITE_API_URL}/invoices/${id}`
          : `${import.meta.env.VITE_API_URL}/invoices`,
        {
          method: id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save invoice");
      }

      showSuccessToast(
        id ? "Invoice updated successfully" : "Invoice created successfully"
      );

      addNotification({
        type: "invoice",
        icon: "receipt_long",
        iconColor: "text-primary",
        bgColor: "bg-primary-soft",
        title: id ? "Invoice Updated" : "New Invoice Created",
        description: `#${invoice.invoiceNumber} • ${format(total)}`,
        borderColor: "border-l-primary",
      });

      navigate("/invoice");
    } catch (error) {
      console.error(error);
      showErrorToast(error.message);
    } finally {
      setSavingInvoice(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchInvoice = async () => {
      try {
        const token = localStorage.getItem("autobiller-auth");
        if (!token) {
          showErrorToast("Session expired. Please login again.");
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/invoices/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("autobiller-auth");
          localStorage.removeItem("autobillr_subscription");
          localStorage.removeItem("user");
          showErrorToast("Session expired. Please login again.");
          navigate("/login");
          return;
        }

        const data = await response.json();
        const invoiceData = data.invoice || data;

        setInvoice({
          invoiceNumber: invoiceData.invoiceNumber,
          client: invoiceData.client?.id || invoiceData.client,
          project: invoiceData.project?.id || invoiceData.project,
          invoiceDate: invoiceData.invoiceDate?.split("T")[0],
          dueDate: invoiceData.dueDate?.split("T")[0],
          items:
            invoiceData.items?.map((item) => ({
              id: item.id || Date.now(),
              desc: item.desc,
              qty: item.qty,
              rate: item.rate,
            })) || [],
        });
      } catch (error) {
        console.error(error);
        showErrorToast("Failed to load invoice");
      }
    };

    fetchInvoice();
  }, [id, navigate]);

  const selectClass =
    "w-full h-12 px-3 border border-border bg-surface rounded-xl text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <main className="flex-1 pt-2 pb-12 max-w-[1600px] mx-auto w-full scroll-host">
      <div className="page-in">
        <SectionHeader
          title="Invoice Composer"
          description="Create a polished, AI-validated invoice and dispatch in seconds."
          secondaryAction={{
            label: "Back to Invoices",
            icon: "arrow_back",
            onClick: () => navigate("/invoice"),
          }}
          primaryAction={{
            label: "Save Draft",
            icon: "save",
            variant: "secondary",
            onClick: () => showSuccessToast("Draft Saved"),
          }}
        />

        <div className="grid grid-cols-12 gap-6">
          {/* LEFT PANEL */}
          <div className="col-span-12 lg:col-span-5">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-text">Billing Details</h3>
                <Badge label="Draft · INV-2024-001" variant="active" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">
                    Client
                  </label>
                  <select
                    value={invoice.client}
                    onChange={handleClientChange}
                    className={selectClass}
                  >
                    <option value="">
                      {loadingClients ? "Loading..." : "Select Client"}
                    </option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">
                    Project
                  </label>
                  <select
                    value={invoice.project}
                    onChange={(e) => updateField("project", e.target.value)}
                    className={selectClass}
                    disabled={!invoice.client}
                  >
                    <option value="">
                      {loadingProjects ? "Loading..." : "Select Project"}
                    </option>
                    {currentClientProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>

                <FormInput
                  label="Invoice Date"
                  type="date"
                  value={invoice.invoiceDate}
                  onChange={(e) => updateField("invoiceDate", e.target.value)}
                />

                <FormInput
                  label="Due Date"
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => updateField("dueDate", e.target.value)}
                />
              </div>

              {/* LINE ITEMS */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-text-muted">
                    Line Items
                  </h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      add
                    </span>
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {invoice.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-surface-secondary border border-border-light rounded-xl p-3"
                    >
                      <div className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-6">
                          <label className="text-[10px] font-bold uppercase text-text-light">
                            Description
                          </label>
                          <input
                            value={item.desc}
                            onChange={(e) =>
                              updateItem(item.id, "desc", e.target.value)
                            }
                            className="w-full bg-transparent outline-none text-sm font-medium text-text"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="text-[10px] font-bold uppercase text-text-light">
                            Qty
                          </label>
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) =>
                              updateItem(item.id, "qty", e.target.value)
                            }
                            className="w-full bg-transparent outline-none text-right text-text"
                          />
                        </div>

                        <div className="col-span-3">
                          <label className="text-[10px] font-bold uppercase text-text-light">
                            Rate ({format(0).replace(/[0-9.,\s]/g, "")})
                          </label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              updateItem(item.id, "rate", e.target.value)
                            }
                            className="w-full bg-transparent outline-none text-right text-text"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="col-span-1 text-danger hover:text-danger-hover transition"
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOGGLES */}
              <div className="mt-8 border-t border-border-light pt-5 space-y-4">
                {[
                  {
                    key: "payLink",
                    title: "Enable Pay Link",
                    desc: "Client can pay via card or ACH",
                    icon: "payments",
                  },
                  {
                    key: "emailClient",
                    title: "Email to Client",
                    desc: "Auto-send PDF once finalized",
                    icon: "mail",
                  },
                  {
                    key: "autoCharge",
                    title: "Auto-charge on due date",
                    desc: "Charge stored payment method",
                    icon: "auto_mode",
                  },
                ].map((toggle) => (
                  <div
                    key={toggle.key}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-text-muted">
                        {toggle.icon}
                      </span>
                      <div>
                        <div className="font-semibold text-sm text-text">
                          {toggle.title}
                        </div>
                        <div className="text-xs text-text-muted">
                          {toggle.desc}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggle(toggle.key)}
                      className={`
                        relative w-11 h-6 rounded-full transition-all duration-300
                        ${settings[toggle.key] ? "bg-primary" : "bg-border-dark"}
                      `}
                    >
                      <span
                        className={`
                          absolute top-0.5 w-5 h-5 rounded-full bg-white shadow
                          transition-all duration-300
                          ${settings[toggle.key] ? "right-0.5" : "left-0.5"}
                        `}
                      />
                    </button>
                  </div>
                ))}

                <Button
                  fullWidth
                  icon={savingInvoice ? "hourglass_top" : "send"}
                  className="mt-6"
                  onClick={handleFinalizeInvoice}
                  disabled={savingInvoice}
                >
                  {savingInvoice ? "Saving..." : "Finalize & Send Invoice"}
                </Button>
              </div>
            </Card>
          </div>

          {/* RIGHT PANEL */}
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => {
                  window.open(
                    `/invoice-preview?data=${encodeURIComponent(
                      JSON.stringify({
                        ...invoice,
                        clientName: selectedClient?.name || "",
                        projectName: selectedProject?.title || "",
                        subtotal,
                        tax,
                        total,
                      })
                    )}`,
                    "_blank"
                  );
                }}
                className="flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-primary transition"
              >
                <span className="material-symbols-outlined text-sm">
                  visibility
                </span>
                Live Preview
              </button>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon="download"
                  onClick={handleDownloadPdf}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon="print"
                  onClick={handlePrint}
                />
              </div>
            </div>

            <div ref={invoiceRef}>
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <InvoiceTemplate
                  invoice={invoice}
                  selectedClient={selectedClient}
                  selectedProject={selectedProject}
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                  format={format}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}