const prisma = require("../../config/prisma");

/* =========================================================
   HELPERS
========================================================= */

const cleanString = (value) => {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
};

const cleanEmail = (value) => {
  const email = cleanString(value);
  return email ? email.toLowerCase() : null;
};

const cleanArray = (value) => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((t) => String(t).trim()).filter(Boolean))];
};

const cleanBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  return Boolean(value);
};

const cleanDecimal = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : fallback;
};

const getCompanyId = (req) => req.user?.companyId || null;

/* Allowed enums (must match Prisma) */
const VALID_PAYMENT_TERMS = ["DUE_ON_RECEIPT", "NET_15", "NET_30", "NET_60"];
const VALID_PAYMENT_METHODS = ["ACH", "CARD", "WIRE", "CHECK"];
const VALID_BILLING_CYCLES = ["MONTHLY", "QUARTERLY", "ANNUAL"];
const VALID_CLIENT_STATUS = ["ACTIVE", "PENDING", "INACTIVE", "ARCHIVED"];

const normalizePaymentTerms = (value) => {
  const cleaned = cleanString(value)?.toUpperCase().replace(/\s+/g, "_");
  if (VALID_PAYMENT_TERMS.includes(cleaned)) return cleaned;
  // legacy support
  if (cleaned === "NET30" || cleaned === "NET_30") return "NET_30";
  return "NET_30";
};

const normalizePaymentMethod = (value) => {
  const cleaned = cleanString(value)?.toUpperCase();
  return VALID_PAYMENT_METHODS.includes(cleaned) ? cleaned : "ACH";
};

const normalizeBillingCycle = (value) => {
  const cleaned = cleanString(value)?.toUpperCase();
  return VALID_BILLING_CYCLES.includes(cleaned) ? cleaned : "MONTHLY";
};

const normalizeStatus = (value) => {
  const cleaned = cleanString(value)?.toUpperCase();
  return VALID_CLIENT_STATUS.includes(cleaned) ? cleaned : "ACTIVE";
};

const getInitials = (name) => {
  const n = cleanString(name) || "";
  if (!n) return null;
  const words = n.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
};

/* =========================================================
   GET ALL CLIENTS
========================================================= */

const getClients = async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "No company associated with the authenticated user",
      });
    }

   const clients = await prisma.client.findMany({
  where: {
    companyId,
    status: { not: "ARCHIVED" },
  },
  orderBy: { createdAt: "desc" },
});

    return res.status(200).json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error("GET CLIENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
      error: error?.message || "Unknown error",
    });
  }
};

/* =========================================================
   GET CLIENT BY ID
========================================================= */

const getClientById = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "No company associated with the authenticated user",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    const client = await prisma.client.findFirst({
      where: { id, companyId },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    return res.status(200).json({
      success: true,
      client,
    });
  } catch (error) {
    console.error("GET CLIENT BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch client",
      error: error?.message || "Unknown error",
    });
  }
};

/* =========================================================
   CREATE CLIENT
========================================================= */

const createClient = async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "No company associated with the authenticated user",
      });
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return res.status(400).json({
        success: false,
        message: "Company not found for the authenticated user",
      });
    }

    const body = req.body || {};

    /* ---------- Clean & normalize ---------- */
    const name = cleanString(body.name);
    const contactName = cleanString(body.contactName);
    const email = cleanEmail(body.email);
    const phone = cleanString(body.phone);
    const website = cleanString(body.website);
    const industry = cleanString(body.industry);
    const tier = cleanString(body.tier) || "Enterprise";
    const color = cleanString(body.color) || "bg-primary";
    const taxId = cleanString(body.taxId);
    const currency = cleanString(body.currency)?.toUpperCase() || "USD";
    const notes = cleanString(body.notes);
    const tags = cleanArray(body.tags);

    // Address (flat – matches Prisma)
    const billingAddress = cleanString(body.billingAddress);
    const city = cleanString(body.city);
    const stateRegion = cleanString(body.stateRegion);
    const postalCode = cleanString(body.postalCode);
    const country = cleanString(body.country);

    // Billing
    const mrr = cleanDecimal(body.mrr, 0);
    const billingCycle = normalizeBillingCycle(body.billingCycle);
    const paymentTerms = normalizePaymentTerms(body.paymentTerms);
    const paymentMethod = normalizePaymentMethod(body.paymentMethod);

    // Automation (flat booleans – matches Prisma)
    const autoCharge = cleanBoolean(body.autoCharge, false);
    const reminders = cleanBoolean(body.reminders, true);
    const portalAccess = cleanBoolean(body.portalAccess, true);
    const welcomeEmail = cleanBoolean(body.welcomeEmail, true);

    // Optional
    const status = normalizeStatus(body.status);
    const initials = cleanString(body.initials) || getInitials(name);

    /* ---------- Validation ---------- */
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Contact email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid contact email",
      });
    }

    // Duplicate check (same company + email)
    const existing = await prisma.client.findFirst({
      where: { companyId, email },
      select: { id: true },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A client with this email already exists",
        clientId: existing.id,
      });
    }

    /* ---------- Create ---------- */
    const client = await prisma.client.create({
      data: {
        companyId,
        name,
        contactName,
        email,
        phone,
        website,
        industry,
        tier,
        color,
        initials,

        // Address
        billingAddress,
        city,
        stateRegion,
        postalCode,
        country,

        // Tax & billing
        taxId,
        currency,
        mrr,
        billingCycle,
        paymentTerms,
        paymentMethod,

        // Automation
        autoCharge,
        reminders,
        portalAccess,
        welcomeEmail,

        // Extra
        notes,
        tags,
        status,

        // Defaults already handled by schema
        // outstandingBalance: 0
        // nextInvoiceDate: null
      },
    });

    return res.status(201).json({
      success: true,
      message: "Client created successfully",
      client,
    });
  } catch (error) {
    console.error("CREATE CLIENT ERROR:", error);

    if (error?.name === "PrismaClientValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid client data. Please check the fields.",
        error: error.message,
      });
    }

    if (error?.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "A client with this information already exists.",
        meta: error.meta || null,
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create client",
    });
  }
};

/* =========================================================
   UPDATE CLIENT
========================================================= */

const updateClient = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "No company associated with the authenticated user",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    // Ownership check
    const existingClient = await prisma.client.findFirst({
      where: { id, companyId },
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const body = req.body || {};
    const updateData = {};

    /* ---------- Basic fields ---------- */
    if (body.name !== undefined) {
      const name = cleanString(body.name);
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Company name is required",
        });
      }
      updateData.name = name;
      updateData.initials = cleanString(body.initials) || getInitials(name);
    }

    if (body.contactName !== undefined) {
      updateData.contactName = cleanString(body.contactName);
    }

    if (body.email !== undefined) {
      const email = cleanEmail(body.email);
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Contact email is required",
        });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid contact email",
        });
      }

      // Check duplicate email on other clients
      const duplicate = await prisma.client.findFirst({
        where: {
          companyId,
          email,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Another client with this email already exists",
          clientId: duplicate.id,
        });
      }
      updateData.email = email;
    }

    if (body.phone !== undefined) updateData.phone = cleanString(body.phone);
    if (body.website !== undefined) updateData.website = cleanString(body.website);
    if (body.industry !== undefined) updateData.industry = cleanString(body.industry);
    if (body.tier !== undefined) updateData.tier = cleanString(body.tier);
    if (body.color !== undefined) updateData.color = cleanString(body.color);
    if (body.taxId !== undefined) updateData.taxId = cleanString(body.taxId);
    if (body.notes !== undefined) updateData.notes = cleanString(body.notes);
    if (body.tags !== undefined) updateData.tags = cleanArray(body.tags);

    /* ---------- Address ---------- */
    if (body.billingAddress !== undefined)
      updateData.billingAddress = cleanString(body.billingAddress);
    if (body.city !== undefined) updateData.city = cleanString(body.city);
    if (body.stateRegion !== undefined)
      updateData.stateRegion = cleanString(body.stateRegion);
    if (body.postalCode !== undefined)
      updateData.postalCode = cleanString(body.postalCode);
    if (body.country !== undefined) updateData.country = cleanString(body.country);

    /* ---------- Billing ---------- */
    if (body.currency !== undefined) {
      updateData.currency =
        cleanString(body.currency)?.toUpperCase() || existingClient.currency;
    }
    if (body.mrr !== undefined) {
      updateData.mrr = cleanDecimal(body.mrr, existingClient.mrr);
    }
    if (body.billingCycle !== undefined) {
      updateData.billingCycle = normalizeBillingCycle(body.billingCycle);
    }
    if (body.paymentTerms !== undefined) {
      updateData.paymentTerms = normalizePaymentTerms(body.paymentTerms);
    }
    if (body.paymentMethod !== undefined) {
      updateData.paymentMethod = normalizePaymentMethod(body.paymentMethod);
    }

    /* ---------- Automation ---------- */
    if (body.autoCharge !== undefined)
      updateData.autoCharge = cleanBoolean(body.autoCharge);
    if (body.reminders !== undefined)
      updateData.reminders = cleanBoolean(body.reminders);
    if (body.portalAccess !== undefined)
      updateData.portalAccess = cleanBoolean(body.portalAccess);
    if (body.welcomeEmail !== undefined)
      updateData.welcomeEmail = cleanBoolean(body.welcomeEmail);

    /* ---------- Status ---------- */
    if (body.status !== undefined) {
      updateData.status = normalizeStatus(body.status);
    }

    // Nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({
        success: true,
        message: "No changes detected",
        client: existingClient,
      });
    }

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    console.error("UPDATE CLIENT ERROR:", error);

    if (error?.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    if (error?.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "A client with this information already exists.",
        meta: error.meta || null,
      });
    }

    if (error?.name === "PrismaClientValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid client data. Please check the fields.",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update client",
    });
  }
};

/* =========================================================
   DELETE CLIENT
========================================================= */

const deleteClient = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "No company associated with the authenticated user",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    const existingClient = await prisma.client.findFirst({
      where: { id, companyId },
      select: { id: true },
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Soft delete (production way)
    const client = await prisma.client.update({
      where: { id },
      data: {
        status: "ARCHIVED",
        archivedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Client archived successfully",
      client,
    });
  } catch (error) {
    console.error("DELETE CLIENT ERROR:", error);

    if (error?.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to archive client",
    });
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};