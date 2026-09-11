import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";

import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import FormInput from "../../components/ui/FormInput";
import Button from "../../components/ui/Button";

import { getAuthToken } from "../../utils/auth";
import { useNavigate, useParams } from "react-router-dom";

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
  /* =========================================================
     ROUTER
  ========================================================= */

  const navigate = useNavigate();
  const { id } = useParams();

  /* =========================================================
     STATE
  ========================================================= */

  const [clients, setClients] = useState([]);
  const [projectsByClient, setProjectsByClient] = useState({});

  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);

  const { addNotification } = useNotificationStore();

  const invoiceRef = useRef(null);

  const { format } = useCurrency();

  /* =========================================================
     API BASE URL
  ========================================================= */

  const API_BASE = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api/v1"
  ).replace(/\/$/, "");

  /* =========================================================
     DEFAULT INVOICE
  ========================================================= */

  const createDefaultInvoice = () => {
    const today = new Date();

    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30);

    return {
      invoiceNumber: `INV-${today.getFullYear()}-${String(
        Date.now()
      ).slice(-4)}`,

      client: "",
      project: "",

      invoiceDate: today.toISOString().split("T")[0],

      dueDate: dueDate.toISOString().split("T")[0],

      items: [
        {
          id: `item-${Date.now()}`,
          desc: "",
          qty: 1,
          rate: 0,
        },
      ],

      subtotal: 0,
      tax: 0,
      total: 0,

      currency: "USD",

      status: "Draft",
    };
  };

  const [invoice, setInvoice] = useState(
    createDefaultInvoice()
  );

  /* =========================================================
     SETTINGS
  ========================================================= */

  const [settings, setSettings] = useState({
    payLink: true,
    emailClient: true,
    autoCharge: false,
  });

  /* =========================================================
     EDIT MODE
  ========================================================= */

  const isEditMode = Boolean(id);

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetInvoiceForm = () => {
    setInvoice(createDefaultInvoice());

    setSettings({
      payLink: true,
      emailClient: true,
      autoCharge: false,
    });
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const getId = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    if (typeof value === "object") {
      return (
        value.id ??
        value._id ??
        value.clientId ??
        value.projectId ??
        null
      );
    }

    return value;
  };

  const normalizeId = (value) => {
    const idValue = getId(value);

    if (
      idValue === null ||
      idValue === undefined
    ) {
      return "";
    }

    return String(idValue);
  };

  const toNumber = (value, fallback = 0) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return fallback;
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  };

  const normalizeDate = (value) => {
    if (!value) {
      return "";
    }

    return String(value).split("T")[0];
  };

  /* =========================================================
     GET CLIENT ID FROM PROJECT
  ========================================================= */

  const getProjectClientId = (project) => {
    if (!project) {
      return null;
    }

    return (
      project.clientId ??
      project.client_id ??
      project.client?.id ??
      project.client?._id ??
      project.client?.clientId ??
      project.Client?.id ??
      project.Client?._id ??
      project.Client?.clientId ??
      null
    );
  };

  /* =========================================================
     NORMALIZE CLIENT
  ========================================================= */

  const normalizeClient = (client) => {
    if (!client) {
      return null;
    }

    const clientId =
      client.id ??
      client._id ??
      client.clientId ??
      null;

    const clientName =
      client.name ??
      client.clientName ??
      client.companyName ??
      client.fullName ??
      "Unnamed Client";

    return {
      ...client,
      id: clientId,
      name: clientName,
    };
  };

  /* =========================================================
     NORMALIZE PROJECT
  ========================================================= */

  const normalizeProject = (project) => {
    if (!project) {
      return null;
    }

    const projectId =
      project.id ??
      project._id ??
      project.projectId ??
      null;

    const projectTitle =
      project.title ??
      project.name ??
      project.projectName ??
      project.projectTitle ??
      "Untitled Project";

    return {
      ...project,

      id: projectId,

      title: projectTitle,

      clientId: getProjectClientId(project),
    };
  };

  /* =========================================================
     NORMALIZE PROJECT RESPONSE
  ========================================================= */

  const normalizeProjects = (data) => {
    let list = [];

    if (Array.isArray(data)) {
      list = data;
    } else if (Array.isArray(data?.projects)) {
      list = data.projects;
    } else if (Array.isArray(data?.data)) {
      list = data.data;
    } else if (Array.isArray(data?.result)) {
      list = data.result;
    } else if (
      Array.isArray(data?.Projects)
    ) {
      list = data.Projects;
    }

    return list
      .map(normalizeProject)
      .filter(
        (project) =>
          project &&
          project.id !== null &&
          project.id !== undefined
      );
  };

  /* =========================================================
     NORMALIZE INVOICE ITEMS
  ========================================================= */

  const normalizeInvoiceItems = (
    invoiceData
  ) => {
    const rawItems =
      invoiceData?.items ??
      invoiceData?.Items ??
      invoiceData?.invoiceItems ??
      invoiceData?.InvoiceItems ??
      invoiceData?.lineItems ??
      invoiceData?.LineItems ??
      [];

    if (!Array.isArray(rawItems)) {
      return [];
    }

    return rawItems.map((item, index) => {
      const itemId =
        item?.id ??
        item?._id ??
        item?.invoiceItemId ??
        `edit-item-${Date.now()}-${index}`;

      const description =
        item?.desc ??
        item?.description ??
        item?.itemDescription ??
        item?.name ??
        item?.itemName ??
        "";

      const quantity = toNumber(
        item?.qty ??
          item?.quantity ??
          item?.itemQuantity ??
          0
      );

      const rate = toNumber(
        item?.rate ??
          item?.unitPrice ??
          item?.price ??
          item?.unit_price ??
          0
      );

      return {
        ...item,

        id: itemId,

        desc: description,

        qty: quantity,

        rate: rate,
      };
    });
  };

  /* =========================================================
     GET CLIENT ID FROM INVOICE
  ========================================================= */

  const getInvoiceClientId = (
    invoiceData
  ) => {
    const client =
      invoiceData?.client ??
      invoiceData?.Client;

    if (typeof client === "string") {
      return client;
    }

    return (
      client?.id ??
      client?._id ??
      client?.clientId ??
      invoiceData?.clientId ??
      invoiceData?.client_id ??
      invoiceData?.ClientId ??
      ""
    );
  };

  /* =========================================================
     GET PROJECT ID FROM INVOICE
  ========================================================= */

  const getInvoiceProjectId = (
    invoiceData
  ) => {
    const project =
      invoiceData?.project ??
      invoiceData?.Project;

    if (typeof project === "string") {
      return project;
    }

    return (
      project?.id ??
      project?._id ??
      project?.projectId ??
      invoiceData?.projectId ??
      invoiceData?.project_id ??
      invoiceData?.ProjectId ??
      ""
    );
  };

  /* =========================================================
     PRINT
  ========================================================= */

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle:
      invoice.invoiceNumber || "Invoice",
  });

  /* =========================================================
     DOWNLOAD PDF
  ========================================================= */

  const handleDownloadPdf = async () => {
    const element = invoiceRef.current;

    if (!element) {
      showErrorToast(
        "Invoice preview is not available."
      );
      return;
    }

    try {
      const options = {
        margin: 0.3,

        filename: `${
          invoice.invoiceNumber || "invoice"
        }.pdf`,

        image: {
          type: "jpeg",
          quality: 1,
        },

        html2canvas: {
          scale: 4,
          useCORS: true,
          letterRendering: true,
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      await html2pdf()
        .set(options)
        .from(element)
        .save();
    } catch (error) {
      console.error(
        "PDF download error:",
        error
      );

      showErrorToast(
        "Failed to download invoice PDF."
      );
    }
  };

  /* =========================================================
     TOGGLE
  ========================================================= */

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /* =========================================================
     FETCH CLIENTS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const fetchClients = async () => {
      setLoadingClients(true);

      try {
        const token =
          getAuthToken() ||
          localStorage.getItem(
            "autobiller-auth"
          ) ||
          localStorage.getItem("token");

        if (!token) {
          showErrorToast(
            "Session expired. Please login again."
          );

          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_BASE}/clients`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem(
            "autobiller-auth"
          );

          localStorage.removeItem("token");

          showErrorToast(
            "Session expired. Please login again."
          );

          navigate("/login");

          return;
        }

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Failed to load clients (${response.status})`
          );
        }

        let list = [];

        if (Array.isArray(data)) {
          list = data;
        } else if (
          Array.isArray(data?.clients)
        ) {
          list = data.clients;
        } else if (
          Array.isArray(data?.Clients)
        ) {
          list = data.Clients;
        } else if (
          Array.isArray(data?.data)
        ) {
          list = data.data;
        } else if (
          Array.isArray(data?.result)
        ) {
          list = data.result;
        }

        const normalizedClients = list
          .map(normalizeClient)
          .filter(
            (client) =>
              client &&
              client.id !== null &&
              client.id !== undefined
          );

        console.log(
          "CLIENTS:",
          normalizedClients
        );

        if (!cancelled) {
          setClients(normalizedClients);
        }
      } catch (error) {
        console.error(
          "Failed to fetch clients:",
          error
        );

        if (!cancelled) {
          setClients([]);
        }

        showErrorToast(
          error.message ||
            "Failed to load clients"
        );
      } finally {
        if (!cancelled) {
          setLoadingClients(false);
        }
      }
    };

    fetchClients();

    return () => {
      cancelled = true;
    };
  }, [navigate, API_BASE]);

  /* =========================================================
     FETCH EXISTING INVOICE - EDIT MODE
  ========================================================= */

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    const fetchInvoice = async () => {
      try {
        const token =
          getAuthToken() ||
          localStorage.getItem(
            "autobiller-auth"
          ) ||
          localStorage.getItem("token");

        if (!token) {
          showErrorToast(
            "Session expired. Please login again."
          );

          navigate("/login");
          return;
        }

        console.log(
          "================================="
        );

        console.log(
          "LOADING INVOICE FOR EDIT:",
          id
        );

        console.log(
          "================================="
        );

        const response = await fetch(
          `${API_BASE}/invoices/${id}`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem(
            "autobiller-auth"
          );

          localStorage.removeItem("token");

          localStorage.removeItem(
            "autobillr_subscription"
          );

          localStorage.removeItem("user");

          showErrorToast(
            "Session expired. Please login again."
          );

          navigate("/login");

          return;
        }

        const data =
          await response
            .json()
            .catch(() => ({}));

        console.log(
          "EDIT INVOICE API RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Failed to load invoice (${response.status})`
          );
        }

        /* =====================================================
           FIND ACTUAL INVOICE OBJECT

           Supports:
           { invoice: {...} }
           { data: { invoice: {...} } }
           { data: {...} }
           {...}
        ===================================================== */

        const invoiceData =
          data?.invoice ??
          data?.data?.invoice ??
          data?.data ??
          data;

        console.log(
          "NORMALIZED INVOICE OBJECT:",
          invoiceData
        );

        if (
          !invoiceData ||
          typeof invoiceData !== "object"
        ) {
          throw new Error(
            "Invalid invoice response from server."
          );
        }

        if (cancelled) {
          return;
        }

        /* =====================================================
           CLIENT
        ===================================================== */

        const clientId =
          getInvoiceClientId(
            invoiceData
          );

        /* =====================================================
           PROJECT
        ===================================================== */

        const projectId =
          getInvoiceProjectId(
            invoiceData
          );

        /* =====================================================
           ITEMS
        ===================================================== */

        const normalizedItems =
          normalizeInvoiceItems(
            invoiceData
          );

        /* =====================================================
           DATES
        ===================================================== */

        const invoiceDate =
          normalizeDate(
            invoiceData?.invoiceDate ??
              invoiceData?.date ??
              invoiceData?.createdAt
          );

        const dueDate =
          normalizeDate(
            invoiceData?.dueDate ??
              invoiceData?.paymentDueDate
          );

        /* =====================================================
           TOTALS
        ===================================================== */

        const backendSubtotal =
          toNumber(
            invoiceData?.subtotal ??
              invoiceData?.subTotal ??
              invoiceData?.SubTotal ??
              0
          );

        const backendTax =
          toNumber(
            invoiceData?.tax ??
              invoiceData?.taxAmount ??
              invoiceData?.Tax ??
              0
          );

        const backendTotal =
          toNumber(
            invoiceData?.total ??
              invoiceData?.totalAmount ??
              invoiceData?.grandTotal ??
              invoiceData?.amount ??
              0
          );

        /* =====================================================
           SETTINGS
        ===================================================== */

        const payLink =
          invoiceData?.payLink ??
          invoiceData?.enablePayLink ??
          true;

        const emailClient =
          invoiceData?.emailClient ??
          invoiceData?.sendEmail ??
          true;

        const autoCharge =
          invoiceData?.autoCharge ??
          invoiceData?.automaticCharge ??
          false;

        /* =====================================================
           FINAL INVOICE STATE
        ===================================================== */

        const normalizedInvoice = {
          ...invoiceData,

          id:
            invoiceData?.id ??
            id,

          invoiceNumber:
            invoiceData?.invoiceNumber ??
            invoiceData?.number ??
            invoiceData?.invoiceNo ??
            "",

          client: clientId,

          project: projectId,

          invoiceDate,

          dueDate,

          items:
            normalizedItems.length > 0
              ? normalizedItems
              : [
                  {
                    id: `edit-item-${Date.now()}`,
                    desc: "",
                    qty: 1,
                    rate: 0,
                  },
                ],

          subtotal: backendSubtotal,

          tax: backendTax,

          total: backendTotal,

          currency:
            invoiceData?.currency ??
            invoiceData?.currencyCode ??
            "USD",

          status:
            invoiceData?.status ??
            "Draft",

          payLink,

          emailClient,

          autoCharge,
        };

        console.log(
          "================================="
        );

        console.log(
          "SETTING EDIT INVOICE:",
          normalizedInvoice
        );

        console.log(
          "CLIENT ID:",
          clientId
        );

        console.log(
          "PROJECT ID:",
          projectId
        );

        console.log(
          "ITEMS:",
          normalizedItems
        );

        console.log(
          "================================="
        );

        setInvoice(normalizedInvoice);

        setSettings({
          payLink,
          emailClient,
          autoCharge,
        });
      } catch (error) {
        console.error(
          "Failed to load invoice:",
          error
        );

        showErrorToast(
          error.message ||
            "Failed to load invoice"
        );
      }
    };

    fetchInvoice();

    return () => {
      cancelled = true;
    };
  }, [id, navigate, API_BASE]);

  /* =========================================================
     FETCH PROJECTS FOR SELECTED CLIENT
  ========================================================= */

  useEffect(() => {
    const clientId = invoice.client;

    if (!clientId) {
      setLoadingProjects(false);

      return;
    }

    let cancelled = false;

    const fetchProjects = async () => {
      setLoadingProjects(true);

      try {
        const token =
          getAuthToken() ||
          localStorage.getItem(
            "autobiller-auth"
          ) ||
          localStorage.getItem("token");

        if (!token) {
          showErrorToast(
            "Session expired. Please login again."
          );

          navigate("/login");

          return;
        }

        const url =
          `${API_BASE}/projects?clientId=` +
          encodeURIComponent(clientId);

        console.log(
          "FETCHING PROJECTS:",
          url
        );

        const response = await fetch(
          url,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem(
            "autobiller-auth"
          );

          localStorage.removeItem("token");

          localStorage.removeItem(
            "autobillr_subscription"
          );

          localStorage.removeItem("user");

          showErrorToast(
            "Session expired. Please login again."
          );

          navigate("/login");

          return;
        }

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Failed to load projects (${response.status})`
          );
        }

        const projects =
          normalizeProjects(data);

        console.log(
          "PROJECTS FROM API:",
          projects
        );

        /* =====================================================
           FILTER BY CLIENT ONLY IF CLIENT INFO EXISTS
        ===================================================== */

        const selectedClientId =
          normalizeId(clientId);

        const projectsWithClientInfo =
          projects.filter((project) => {
            const projectClientId =
              getProjectClientId(project);

            return (
              projectClientId !== null &&
              projectClientId !== undefined &&
              projectClientId !== ""
            );
          });

        let filteredProjects =
          projects;

        if (
          projectsWithClientInfo.length > 0
        ) {
          filteredProjects =
            projects.filter((project) => {
              return (
                normalizeId(
                  getProjectClientId(project)
                ) === selectedClientId
              );
            });
        }

        console.log(
          "SELECTED CLIENT:",
          selectedClientId
        );

        console.log(
          "FILTERED PROJECTS:",
          filteredProjects
        );

        if (!cancelled) {
          setProjectsByClient((prev) => ({
            ...prev,

            [String(clientId)]:
              filteredProjects,
          }));
        }
      } catch (error) {
        console.error(
          "Failed to fetch projects:",
          error
        );

        if (!cancelled) {
          setProjectsByClient((prev) => ({
            ...prev,

            [String(clientId)]: [],
          }));
        }

        showErrorToast(
          error.message ||
            "Failed to load projects"
        );
      } finally {
        if (!cancelled) {
          setLoadingProjects(false);
        }
      }
    };

    fetchProjects();

    return () => {
      cancelled = true;
    };
  }, [invoice.client, navigate, API_BASE]);

  /* =========================================================
     CURRENT CLIENT PROJECTS
  ========================================================= */

  const currentClientProjects =
    projectsByClient[
      String(invoice.client)
    ] || [];

  /* =========================================================
     SELECTED CLIENT
  ========================================================= */

  const selectedClient = clients.find(
    (client) =>
      normalizeId(client.id) ===
      normalizeId(invoice.client)
  );

  /* =========================================================
     SELECTED PROJECT
  ========================================================= */

  const selectedProject =
    currentClientProjects.find(
      (project) =>
        normalizeId(project.id) ===
        normalizeId(invoice.project)
    );

  /* =========================================================
     ADD ITEM
  ========================================================= */

  const addItem = () => {
    setInvoice((prev) => ({
      ...prev,

      items: [
        ...(Array.isArray(prev.items)
          ? prev.items
          : []),

        {
          id: `item-${Date.now()}`,
          desc: "",
          qty: 1,
          rate: 0,
        },
      ],
    }));
  };

  /* =========================================================
     UPDATE ITEM
  ========================================================= */

  const updateItem = (
    id,
    field,
    value
  ) => {
    setInvoice((prev) => ({
      ...prev,

      items: prev.items.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,

          [field]:
            field === "qty" ||
            field === "rate"
              ? Number(value) || 0
              : value,
        };
      }),
    }));
  };

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  const removeItem = (id) => {
    setInvoice((prev) => {
      const remainingItems =
        prev.items.filter(
          (item) => item.id !== id
        );

      return {
        ...prev,

        items:
          remainingItems.length > 0
            ? remainingItems
            : [
                {
                  id: `item-${Date.now()}`,
                  desc: "",
                  qty: 1,
                  rate: 0,
                },
              ],
      };
    });
  };

  /* =========================================================
     UPDATE FIELD
  ========================================================= */

  const updateField = (
    field,
    value
  ) => {
    setInvoice((prev) => ({
      ...prev,

      [field]: value,
    }));
  };

  /* =========================================================
     CLIENT CHANGE
  ========================================================= */

  const handleClientChange = (e) => {
    const clientId =
      e.target.value;

    /*
      This is intentionally here.

      If USER manually changes client,
      the old project must be cleared.

      It does NOT run automatically when
      invoice data is loaded.
    */

    setInvoice((prev) => ({
      ...prev,

      client: clientId,

      project: "",
    }));

    if (!clientId) {
      setLoadingProjects(false);
    }
  };

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const subtotal = useMemo(() => {
    return invoice.items.reduce(
      (sum, item) => {
        const qty =
          Number(item.qty) || 0;

        const rate =
          Number(item.rate) || 0;

        return sum + qty * rate;
      },
      0
    );
  }, [invoice.items]);

  /*
    IMPORTANT:

    Do NOT use parseInt here.

    Example:
    1 * 0.99 = 0.99
  */

  const tax =
    subtotal * 0.085;

  const total =
    subtotal + tax;

  /* =========================================================
     FINALIZE / SAVE INVOICE
  ========================================================= */

  const handleFinalizeInvoice =
    async () => {
      try {
        setSavingInvoice(true);

        /* =====================================================
           VALIDATION
        ===================================================== */

        if (!invoice.client) {
          showErrorToast(
            "Please select a Client"
          );

          return;
        }

        if (!invoice.project) {
          showErrorToast(
            "Please select a Project"
          );

          return;
        }

        /*
          Project validation.

          During normal usage, project must belong
          to selected client.

          If project list is still loading, wait.
        */

        if (loadingProjects) {
          showErrorToast(
            "Please wait for projects to finish loading."
          );

          return;
        }

        const validProject =
          currentClientProjects.some(
            (project) =>
              normalizeId(
                project.id
              ) ===
              normalizeId(
                invoice.project
              )
          );

        if (!validProject) {
          showErrorToast(
            "Selected project does not belong to the selected client."
          );

          return;
        }

        /* =====================================================
           PDF
        ===================================================== */

        const element =
          invoiceRef.current;

        if (!element) {
          showErrorToast(
            "Invoice preview is not available."
          );

          return;
        }

        const options = {
          margin: 0.3,

          filename: `${
            invoice.invoiceNumber ||
            "invoice"
          }.pdf`,

          image: {
            type: "jpeg",
            quality: 1,
          },

          html2canvas: {
            scale: 4,
            useCORS: true,
            letterRendering: true,
          },

          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
        };

        const pdfBlob =
          await html2pdf()
            .set(options)
            .from(element)
            .outputPdf("blob");

        /* =====================================================
           FORM DATA
        ===================================================== */

        const formData =
          new FormData();

        const payload = {
          ...invoice,

          client:
            invoice.client,

          project:
            invoice.project,

          items: invoice.items.map(
            (item) => ({
              ...item,

              desc: item.desc || "",

              qty:
                Number(item.qty) || 0,

              rate:
                Number(item.rate) || 0,
            })
          ),

          subtotal,

          tax,

          total,

          payLink:
            settings.payLink,

          emailClient:
            settings.emailClient,

          autoCharge:
            settings.autoCharge,

          status:
            isEditMode
              ? invoice.status ||
                "Scheduled"
              : "Scheduled",
        };

        console.log(
          "SAVING INVOICE PAYLOAD:",
          payload
        );

        formData.append(
          "invoice",
          JSON.stringify(payload)
        );

        formData.append(
          "pdf",
          pdfBlob,
          `${
            invoice.invoiceNumber ||
            "invoice"
          }.pdf`
        );

        /* =====================================================
           TOKEN
        ===================================================== */

        const token =
          getAuthToken() ||
          localStorage.getItem(
            "autobiller-auth"
          ) ||
          localStorage.getItem("token");

        if (!token) {
          showErrorToast(
            "Session expired. Please login again."
          );

          navigate("/login");

          return;
        }

        /* =====================================================
           CREATE = POST
           EDIT   = PUT
        ===================================================== */

        const url = isEditMode
          ? `${API_BASE}/invoices/${id}`
          : `${API_BASE}/invoices`;

        const method = isEditMode
          ? "PUT"
          : "POST";

        console.log(
          "INVOICE REQUEST:",
          method,
          url
        );

        const response =
          await fetch(url, {
            method,

            headers: {
              Authorization: `Bearer ${token}`,
            },

            /*
              IMPORTANT:

              Do NOT manually set
              Content-Type here.

              Browser automatically creates:
              multipart/form-data
              with boundary.
            */

            body: formData,
          });

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "autobiller-auth"
          );

          localStorage.removeItem(
            "token"
          );

          showErrorToast(
            "Session expired. Please login again."
          );

          navigate("/login");

          return;
        }

        const data =
          await response
            .json()
            .catch(() => ({}));

        console.log(
          "SAVE INVOICE RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to save invoice"
          );
        }

        /* =====================================================
           SUCCESS
        ===================================================== */

        showSuccessToast(
          isEditMode
            ? "Invoice updated successfully"
            : "Invoice created & emailed successfully"
        );

        addNotification({
          type: "invoice",

          icon: "receipt_long",

          iconColor:
            "text-primary",

          bgColor:
            "bg-primary-soft",

          title: isEditMode
            ? "Invoice Updated"
            : "New Invoice Created",

          description:
            `#${invoice.invoiceNumber} • ${format(
              total
            )}`,

          borderColor:
            "border-l-primary",
        });

        navigate("/invoice");
      } catch (error) {
        console.error(
          "SAVE INVOICE ERROR:",
          error
        );

        showErrorToast(
          error.message ||
            "Failed to save invoice"
        );
      } finally {
        setSavingInvoice(false);
      }
    };

  /* =========================================================
     DYNAMIC BADGE
  ========================================================= */

  const displayStatus =
    invoice.status
      ? String(invoice.status)
          .charAt(0)
          .toUpperCase() +
        String(invoice.status)
          .slice(1)
          .toLowerCase()
      : "Draft";

  /* =========================================================
     SELECT CLASS
  ========================================================= */

  const selectClass =
    "w-full h-12 px-3 border border-border bg-surface rounded-xl text-sm text-text outline-none transition focus:ring-2 focus:ring-primary/20 focus:border-primary";

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="flex-1 pt-2 pb-12 max-w-[1600px] mx-auto w-full scroll-host">
      <div className="page-in">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <SectionHeader
          title={
            isEditMode
              ? "Edit Invoice"
              : "Invoice Composer"
          }

          description={
            isEditMode
              ? "Update invoice details and resend the invoice."
              : "Create a polished, AI-validated invoice and dispatch in seconds."
          }

          secondaryAction={{
            label: "Back to Invoices",
            icon: "arrow_back",
            onClick: () =>
              navigate("/invoice"),
          }}

          primaryAction={{
            label: "Save Draft",
            icon: "save",
            variant: "secondary",

            onClick: () =>
              showSuccessToast(
                "Draft Saved"
              ),
          }}
        />

        <div className="grid grid-cols-12 gap-6">

          {/* ===================================================
              LEFT PANEL
          =================================================== */}

          <div className="col-span-12 lg:col-span-5">

            <Card>

              {/* =================================================
                  BILLING HEADER
              ================================================= */}

              <div className="flex items-center justify-between mb-6">

                <h3 className="font-bold text-text">
                  Billing Details
                </h3>

                <Badge
                  label={`${displayStatus} · ${
                    invoice.invoiceNumber ||
                    "Invoice"
                  }`}
                  variant="active"
                />

              </div>

              {/* =================================================
                  BILLING DETAILS
              ================================================= */}

              <div className="grid grid-cols-2 gap-4">

                {/* CLIENT */}

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">
                    Client
                  </label>

                  <select
                    value={
                      invoice.client
                    }
                    onChange={
                      handleClientChange
                    }
                    className={
                      selectClass
                    }
                  >
                    <option value="">
                      {loadingClients
                        ? "Loading..."
                        : "Select Client"}
                    </option>

                    {clients.map(
                      (client) => (
                        <option
                          key={
                            client.id
                          }
                          value={
                            client.id
                          }
                        >
                          {
                            client.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* PROJECT */}

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">
                    Project
                  </label>

                  <select
                    value={
                      invoice.project
                    }
                    onChange={(e) =>
                      updateField(
                        "project",
                        e.target.value
                      )
                    }
                    className={
                      selectClass
                    }
                    disabled={
                      !invoice.client ||
                      loadingProjects
                    }
                  >
                    <option value="">
                      {!invoice.client
                        ? "Select Client"
                        : loadingProjects
                        ? "Loading..."
                        : currentClientProjects.length ===
                          0
                        ? "No Projects Assigned"
                        : "Select Project"}
                    </option>

                    {currentClientProjects.map(
                      (project) => (
                        <option
                          key={
                            project.id
                          }
                          value={
                            project.id
                          }
                        >
                          {
                            project.title
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* INVOICE DATE */}

                <FormInput
                  label="Invoice Date"
                  type="date"
                  value={
                    invoice.invoiceDate
                  }
                  onChange={(e) =>
                    updateField(
                      "invoiceDate",
                      e.target.value
                    )
                  }
                />

                {/* DUE DATE */}

                <FormInput
                  label="Due Date"
                  type="date"
                  value={
                    invoice.dueDate
                  }
                  onChange={(e) =>
                    updateField(
                      "dueDate",
                      e.target.value
                    )
                  }
                />

              </div>

              {/* =================================================
                  LINE ITEMS
              ================================================= */}

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

                  {invoice.items.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="bg-surface-secondary border border-border-light rounded-xl p-3"
                      >

                        <div className="grid grid-cols-12 gap-3 items-end">

                          {/* DESCRIPTION */}

                          <div className="col-span-6">

                            <label className="text-[10px] font-bold uppercase text-text-light">
                              Description
                            </label>

                            <input
                              value={
                                item.desc
                              }
                              onChange={(
                                e
                              ) =>
                                updateItem(
                                  item.id,
                                  "desc",
                                  e.target
                                    .value
                                )
                              }
                              className="w-full bg-transparent outline-none text-sm font-medium text-text"
                            />

                          </div>

                          {/* QTY */}

                          <div className="col-span-2">

                            <label className="text-[10px] font-bold uppercase text-text-light">
                              Qty
                            </label>

                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={
                                item.qty
                              }
                              onChange={(
                                e
                              ) =>
                                updateItem(
                                  item.id,
                                  "qty",
                                  e.target
                                    .value
                                )
                              }
                              className="w-full bg-transparent outline-none text-right text-text"
                            />

                          </div>

                          {/* RATE */}

                          <div className="col-span-3">

                            <label className="text-[10px] font-bold uppercase text-text-light">

                              Rate (
                              {format(
                                0
                              ).replace(
                                /[0-9.,\s]/g,
                                ""
                              )}
                              )

                            </label>

                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={
                                item.rate
                              }
                              onChange={(
                                e
                              ) =>
                                updateItem(
                                  item.id,
                                  "rate",
                                  e.target
                                    .value
                                )
                              }
                              className="w-full bg-transparent outline-none text-right text-text"
                            />

                          </div>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.id
                              )
                            }
                            className="col-span-1 text-danger hover:text-danger-hover transition"
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          </button>

                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* =================================================
                  TOGGLES
              ================================================= */}

              <div className="mt-8 border-t border-border-light pt-5 space-y-4">

                {[
                  {
                    key: "payLink",
                    title:
                      "Enable Pay Link",
                    desc:
                      "Client can pay via card or ACH",
                    icon:
                      "payments",
                  },

                  {
                    key:
                      "emailClient",
                    title:
                      "Email to Client",
                    desc:
                      "Auto-send PDF once finalized",
                    icon:
                      "mail",
                  },

                  {
                    key:
                      "autoCharge",
                    title:
                      "Auto-charge on due date",
                    desc:
                      "Charge stored payment method",
                    icon:
                      "auto_mode",
                  },
                ].map(
                  (toggle) => (
                    <div
                      key={
                        toggle.key
                      }
                      className="flex items-center justify-between"
                    >

                      <div className="flex items-center gap-3">

                        <span className="material-symbols-outlined text-text-muted">
                          {
                            toggle.icon
                          }
                        </span>

                        <div>

                          <div className="font-semibold text-sm text-text">
                            {
                              toggle.title
                            }
                          </div>

                          <div className="text-xs text-text-muted">
                            {
                              toggle.desc
                            }
                          </div>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggle(
                            toggle.key
                          )
                        }
                        className={`
                          relative w-11 h-6 rounded-full transition-all duration-300
                          ${
                            settings[
                              toggle.key
                            ]
                              ? "bg-primary"
                              : "bg-border-dark"
                          }
                        `}
                      >

                        <span
                          className={`
                            absolute top-0.5 w-5 h-5 rounded-full bg-white shadow
                            transition-all duration-300
                            ${
                              settings[
                                toggle.key
                              ]
                                ? "right-0.5"
                                : "left-0.5"
                            }
                          `}
                        />

                      </button>

                    </div>
                  )
                )}

                {/* SAVE */}

                <Button
                  fullWidth
                  icon={
                    savingInvoice
                      ? "hourglass_top"
                      : "send"
                  }
                  className="mt-6"
                  onClick={
                    handleFinalizeInvoice
                  }
                  disabled={
                    savingInvoice
                  }
                >
                  {savingInvoice
                    ? "Saving..."
                    : isEditMode
                    ? "Update & Send Invoice"
                    : "Finalize & Send Invoice"}
                </Button>

              </div>

            </Card>

          </div>

          {/* ===================================================
              RIGHT PANEL
          =================================================== */}

          <div className="col-span-12 lg:col-span-7">

            <div className="flex items-center justify-between mb-3">

              {/* LIVE PREVIEW */}

              <button
                type="button"
                onClick={() => {
                  const previewData =
                    {
                      ...invoice,

                      clientName:
                        selectedClient?.name ||
                        "",

                      projectName:
                        selectedProject?.title ||
                        "",

                      subtotal,

                      tax,

                      total,
                    };

                  window.open(
                    `/invoice-preview?data=${encodeURIComponent(
                      JSON.stringify(
                        previewData
                      )
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

              {/* PDF / PRINT */}

              <div className="flex gap-2">

                <Button
                  variant="secondary"
                  size="sm"
                  icon="download"
                  onClick={
                    handleDownloadPdf
                  }
                />

                <Button
                  variant="secondary"
                  size="sm"
                  icon="print"
                  onClick={
                    handlePrint
                  }
                />

              </div>

            </div>

            {/* =================================================
                INVOICE PREVIEW
            ================================================= */}

            <div ref={invoiceRef}>

              <div className="bg-surface border border-border rounded-xl overflow-hidden">

                <InvoiceTemplate
                  invoice={invoice}
                  selectedClient={
                    selectedClient
                  }
                  selectedProject={
                    selectedProject
                  }
                  subtotal={
                    subtotal
                  }
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