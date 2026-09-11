const prisma = require("../../config/prisma");

/* =========================================================
   HELPERS
========================================================= */

/**
 * Safely convert a value to a trimmed string.
 */
const cleanString = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  return String(value).trim();
};

/**
 * Safely normalize email.
 */
const cleanEmail = (value) => {
  const email = cleanString(value);

  if (!email) {
    return null;
  }

  return email.toLowerCase();
};

/**
 * Safely normalize array.
 */
const cleanArray = (value) => {
  return Array.isArray(value) ? value : [];
};

/**
 * Safely normalize automation object.
 */
const cleanAutomation = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return {
    autoCharge: Boolean(value.autoCharge),
    reminders: Boolean(value.reminders),
    portalAccess: Boolean(value.portalAccess),
    welcomeEmail: Boolean(value.welcomeEmail),
  };
};

/**
 * Safely normalize address.
 */
const cleanAddress = (address) => {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return {
      billingAddress: null,
      city: null,
      stateRegion: null,
      postalCode: null,
      country: null,
    };
  }

  return {
    billingAddress: cleanString(address.street),
    city: cleanString(address.city),
    stateRegion: cleanString(address.state),
    postalCode: cleanString(address.postalCode),
    country: cleanString(address.country),
  };
};

/**
 * Extract company ID safely.
 */
const getCompanyId = (req) => {
  return req.user?.companyId || null;
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error("========== GET CLIENTS ERROR ==========");
    console.error("Name:", error?.name);
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("Meta:", error?.meta);
    console.error("=======================================");

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
      where: {
        id,
        companyId,
      },
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
    console.error("========== GET CLIENT BY ID ERROR ==========");
    console.error("Name:", error?.name);
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("Meta:", error?.meta);
    console.error("============================================");

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

    console.log("========== CREATE CLIENT ==========");
    console.log("Company ID:", companyId);
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("===================================");

    /* -----------------------------------------------------
       AUTHENTICATION
    ----------------------------------------------------- */

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "No company associated with the authenticated user",
      });
    }

    /* -----------------------------------------------------
       VERIFY COMPANY
    ----------------------------------------------------- */

    const company = await prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });

    if (!company) {
      return res.status(400).json({
        success: false,
        message: "Company not found for the authenticated user",
        companyId,
      });
    }

    /* -----------------------------------------------------
       READ REQUEST BODY
    ----------------------------------------------------- */

    const {
      name,
      contactName,
      email,
      phone,
      website,
      industry,
      tier,
      color,
      address,
      taxId,
      currency,
      paymentTerms,
      paymentMethod,
      notes,
      tags,
      automation,
    } = req.body || {};

    /* -----------------------------------------------------
       CLEAN VALUES
    ----------------------------------------------------- */

    const clientName = cleanString(name);
    const clientContactName = cleanString(contactName);
    const clientEmail = cleanEmail(email);
    const clientPhone = cleanString(phone);
    const clientWebsite = cleanString(website);
    const clientIndustry = cleanString(industry);
    const clientTier = cleanString(tier) || "Enterprise";
    const clientColor = cleanString(color) || "bg-teal-500";
    const clientTaxId = cleanString(taxId);
    const clientCurrency = cleanString(currency) || "USD";
    const clientPaymentTerms =
      cleanString(paymentTerms) || "Net 30";
    const clientPaymentMethod =
      cleanString(paymentMethod) || "ACH";
    const clientNotes = cleanString(notes);

    const normalizedAddress = cleanAddress(address);

    const clientTags = cleanArray(tags);

    const clientAutomation = cleanAutomation(automation);

    /* -----------------------------------------------------
       REQUIRED VALIDATION
    ----------------------------------------------------- */

    if (!clientName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    if (!clientEmail) {
      return res.status(400).json({
        success: false,
        message: "Contact email is required",
      });
    }

    /* -----------------------------------------------------
       BASIC EMAIL VALIDATION
    ----------------------------------------------------- */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(clientEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid contact email",
      });
    }

    /* -----------------------------------------------------
       DUPLICATE CLIENT CHECK
    ----------------------------------------------------- */

    const existingClient = await prisma.client.findFirst({
      where: {
        companyId,
        email: clientEmail,
      },
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: "A client with this email already exists",
        clientId: existingClient.id,
      });
    }

    /* -----------------------------------------------------
       CREATE CLIENT DATA
    ----------------------------------------------------- */

    const clientData = {
      companyId,

      name: clientName,

      contactName: clientContactName,

      email: clientEmail,

      phone: clientPhone,

      website: clientWebsite,

      industry: clientIndustry,

      tier: clientTier,

      color: clientColor,

      billingAddress:
        normalizedAddress.billingAddress,

      city:
        normalizedAddress.city,

      stateRegion:
        normalizedAddress.stateRegion,

      postalCode:
        normalizedAddress.postalCode,

      country:
        normalizedAddress.country,

      taxId:
        clientTaxId,

      currency:
        clientCurrency,

      paymentTerms:
        clientPaymentTerms,

      paymentMethod:
        clientPaymentMethod,

      notes:
        clientNotes,

      tags:
        clientTags,

      automation:
        clientAutomation,
    };

    console.log("========== CLIENT DATA ==========");
    console.log(
      JSON.stringify(clientData, null, 2)
    );
    console.log("================================");

    /* -----------------------------------------------------
       CREATE
    ----------------------------------------------------- */

    const client = await prisma.client.create({
      data: clientData,
    });

    console.log("========== CLIENT CREATED ==========");
    console.log("Client ID:", client.id);
    console.log("Client Name:", client.name);
    console.log("Client Email:", client.email);
    console.log("====================================");

    return res.status(201).json({
      success: true,
      message: "Client created successfully",
      client,
    });
  } catch (error) {
    console.error("========== CREATE CLIENT ERROR ==========");
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Prisma code:", error?.code);
    console.error("Prisma meta:", error?.meta);
    console.error("Stack:", error?.stack);
    console.error("==========================================");

    /* -----------------------------------------------------
       PRISMA VALIDATION ERROR
    ----------------------------------------------------- */

    if (error?.name === "PrismaClientValidationError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid client data. Please check the client fields.",
        error: error.message,
      });
    }

    /* -----------------------------------------------------
       PRISMA UNIQUE ERROR
    ----------------------------------------------------- */

    if (error?.code === "P2002") {
      return res.status(400).json({
        success: false,
        message:
          "A client with this information already exists.",
        error: error.message,
        meta: error.meta || null,
      });
    }

    /* -----------------------------------------------------
       OTHER PRISMA ERRORS
    ----------------------------------------------------- */

    if (error?.code) {
      return res.status(400).json({
        success: false,
        message:
          error?.message || "Unable to create client",
        error: error.code,
        meta: error.meta || null,
      });
    }

    /* -----------------------------------------------------
       GENERAL ERROR
    ----------------------------------------------------- */

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Failed to create client",
      error:
        error?.message || "Unknown server error",
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

    console.log("========== UPDATE CLIENT ==========");
    console.log("Company ID:", companyId);
    console.log("Client ID:", id);
    console.log(
      "Request body:",
      JSON.stringify(req.body, null, 2)
    );
    console.log("===================================");

    /* -----------------------------------------------------
       AUTHENTICATION
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       FIND CLIENT
    ----------------------------------------------------- */

    const existingClient =
      await prisma.client.findFirst({
        where: {
          id,
          companyId,
        },
      });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    /* -----------------------------------------------------
       READ BODY
    ----------------------------------------------------- */

    const {
      name,
      contactName,
      email,
      phone,
      website,
      industry,
      tier,
      color,
      address,
      taxId,
      currency,
      paymentTerms,
      paymentMethod,
      notes,
      tags,
      automation,
    } = req.body || {};

    /* -----------------------------------------------------
       UPDATE DATA
    ----------------------------------------------------- */

    const updateData = {};

    /* Name */

    if (name !== undefined) {
      const cleanedName = cleanString(name);

      if (!cleanedName) {
        return res.status(400).json({
          success: false,
          message: "Company name is required",
        });
      }

      updateData.name = cleanedName;
    }

    /* Contact Name */

    if (contactName !== undefined) {
      updateData.contactName =
        cleanString(contactName);
    }

    /* Email */

    if (email !== undefined) {
      const cleanedEmail = cleanEmail(email);

      if (!cleanedEmail) {
        return res.status(400).json({
          success: false,
          message: "Contact email is required",
        });
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(cleanedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid contact email",
        });
      }

      /* Check another client with same email */

      const duplicateClient =
        await prisma.client.findFirst({
          where: {
            companyId,
            email: cleanedEmail,
            NOT: {
              id,
            },
          },
        });

      if (duplicateClient) {
        return res.status(400).json({
          success: false,
          message:
            "Another client with this email already exists",
          clientId: duplicateClient.id,
        });
      }

      updateData.email = cleanedEmail;
    }

    /* Phone */

    if (phone !== undefined) {
      updateData.phone =
        cleanString(phone);
    }

    /* Website */

    if (website !== undefined) {
      updateData.website =
        cleanString(website);
    }

    /* Industry */

    if (industry !== undefined) {
      updateData.industry =
        cleanString(industry);
    }

    /* Tier */

    if (tier !== undefined) {
      updateData.tier =
        cleanString(tier);
    }

    /* Color */

    if (color !== undefined) {
      updateData.color =
        cleanString(color);
    }

    /* Address */

    if (address !== undefined) {
      const normalizedAddress =
        cleanAddress(address);

      updateData.billingAddress =
        normalizedAddress.billingAddress;

      updateData.city =
        normalizedAddress.city;

      updateData.stateRegion =
        normalizedAddress.stateRegion;

      updateData.postalCode =
        normalizedAddress.postalCode;

      updateData.country =
        normalizedAddress.country;
    }

    /* Tax ID */

    if (taxId !== undefined) {
      updateData.taxId =
        cleanString(taxId);
    }

    /* Currency */

    if (currency !== undefined) {
      updateData.currency =
        cleanString(currency);
    }

    /* Payment Terms */

    if (paymentTerms !== undefined) {
      updateData.paymentTerms =
        cleanString(paymentTerms);
    }

    /* Payment Method */

    if (paymentMethod !== undefined) {
      updateData.paymentMethod =
        cleanString(paymentMethod);
    }

    /* Notes */

    if (notes !== undefined) {
      updateData.notes =
        cleanString(notes);
    }

    /* Tags */

    if (tags !== undefined) {
      updateData.tags =
        cleanArray(tags);
    }

    /* Automation */

    if (automation !== undefined) {
      updateData.automation =
        cleanAutomation(automation);
    }

    console.log("========== UPDATE DATA ==========");
    console.log(
      JSON.stringify(updateData, null, 2)
    );
    console.log("=================================");

    /* -----------------------------------------------------
       UPDATE
    ----------------------------------------------------- */

    const client = await prisma.client.update({
      where: {
        id,
      },
      data: updateData,
    });

    console.log("========== CLIENT UPDATED ==========");
    console.log("Client ID:", client.id);
    console.log("Client Name:", client.name);
    console.log("Client Email:", client.email);
    console.log("====================================");

    return res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    console.error("========== UPDATE CLIENT ERROR ==========");
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Prisma code:", error?.code);
    console.error("Prisma meta:", error?.meta);
    console.error("Stack:", error?.stack);
    console.error("==========================================");

    /* -----------------------------------------------------
       CLIENT NOT FOUND
    ----------------------------------------------------- */

    if (error?.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Client not found",
        error: error.message,
      });
    }

    /* -----------------------------------------------------
       UNIQUE ERROR
    ----------------------------------------------------- */

    if (error?.code === "P2002") {
      return res.status(400).json({
        success: false,
        message:
          "A client with this information already exists.",
        error: error.message,
        meta: error.meta || null,
      });
    }

    /* -----------------------------------------------------
       PRISMA VALIDATION
    ----------------------------------------------------- */

    if (error?.name === "PrismaClientValidationError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid client data. Please check the client fields.",
        error: error.message,
      });
    }

    /* -----------------------------------------------------
       OTHER PRISMA ERRORS
    ----------------------------------------------------- */

    if (error?.code) {
      return res.status(400).json({
        success: false,
        message:
          error?.message || "Unable to update client",
        error: error.code,
        meta: error.meta || null,
      });
    }

    /* -----------------------------------------------------
       GENERAL ERROR
    ----------------------------------------------------- */

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Failed to update client",
      error:
        error?.message || "Unknown server error",
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

    /* -----------------------------------------------------
       CHECK CLIENT
    ----------------------------------------------------- */

    const existingClient =
      await prisma.client.findFirst({
        where: {
          id,
          companyId,
        },
      });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    /* -----------------------------------------------------
       DELETE
    ----------------------------------------------------- */

    await prisma.client.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("========== DELETE CLIENT ERROR ==========");
    console.error("Name:", error?.name);
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("Meta:", error?.meta);
    console.error("==========================================");

    if (error?.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Client not found",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Failed to delete client",
      error:
        error?.message || "Unknown server error",
    });
  }
};

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};