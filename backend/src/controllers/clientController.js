const prisma = require("../../config/prisma");

// =====================================================
// GET ALL CLIENTS
// =====================================================

const getClients = async (req, res) => {
  try {
    const companyId = req.user.companyId;

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
    console.error("GET CLIENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
    });
  }
};

// =====================================================
// GET CLIENT BY ID
// =====================================================

const getClientById = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

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
    console.error("GET CLIENT BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch client",
    });
  }
};

// =====================================================
// CREATE CLIENT
// =====================================================

const createClient = async (req, res) => {
  try {
    const companyId = req.user.companyId;

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
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Contact email is required",
      });
    }

    // -----------------------------
    // Create client
    // -----------------------------

    const client = await prisma.client.create({
      data: {
        companyId,

        name: name.trim(),

        contactName:
          contactName?.trim() || null,

        email:
          email?.trim().toLowerCase() || null,

        phone:
          phone?.trim() || null,

        website:
          website?.trim() || null,

        industry:
          industry || null,

        tier:
          tier || "Enterprise",

        color:
          color || "bg-teal-500",

        billingAddress: address?.street?.trim() || null,
city: address?.city?.trim() || null,
stateRegion: address?.state?.trim() || null,
postalCode: address?.postalCode?.trim() || null,
country: address?.country || null,

        taxId:
          taxId?.trim() || null,

        currency:
          currency || "USD",

        paymentTerms:
          paymentTerms || "Net 30",

        paymentMethod:
          paymentMethod || "ACH",

        notes:
          notes?.trim() || null,

        tags:
          Array.isArray(tags) ? tags : [],

        automation:
          automation || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Client created successfully",
      client,
    });
  } catch (error) {
    console.error("CREATE CLIENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create client",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE CLIENT
// =====================================================

const updateClient = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

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
    } = req.body;

    // -----------------------------
    // Check client belongs
    // to current company
    // -----------------------------

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

    // -----------------------------
    // Update
    // -----------------------------

    const client = await prisma.client.update({
      where: {
        id,
      },

      data: {
        ...(name !== undefined && {
          name: name.trim(),
        }),

        ...(contactName !== undefined && {
          contactName:
            contactName?.trim() || null,
        }),

        ...(email !== undefined && {
          email:
            email?.trim().toLowerCase() || null,
        }),

        ...(phone !== undefined && {
          phone:
            phone?.trim() || null,
        }),

        ...(website !== undefined && {
          website:
            website?.trim() || null,
        }),

        ...(industry !== undefined && {
          industry,
        }),

        ...(tier !== undefined && {
          tier,
        }),

        ...(color !== undefined && {
          color,
        }),

       ...(address !== undefined && {
  billingAddress:
    address?.street?.trim() || null,

  city:
    address?.city?.trim() || null,

  stateRegion:
    address?.state?.trim() || null,

  postalCode:
    address?.postalCode?.trim() || null,

  country:
    address?.country || null,
}),

        ...(taxId !== undefined && {
          taxId:
            taxId?.trim() || null,
        }),

        ...(currency !== undefined && {
          currency,
        }),

        ...(paymentTerms !== undefined && {
          paymentTerms,
        }),

        ...(paymentMethod !== undefined && {
          paymentMethod,
        }),

        ...(notes !== undefined && {
          notes:
            notes?.trim() || null,
        }),

        ...(tags !== undefined && {
          tags:
            Array.isArray(tags)
              ? tags
              : [],
        }),

        ...(automation !== undefined && {
          automation,
        }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    console.error("UPDATE CLIENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update client",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE CLIENT
// =====================================================

const deleteClient = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

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
    console.error("DELETE CLIENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete client",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};