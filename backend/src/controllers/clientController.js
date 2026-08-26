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
// CREATE CLIENT
// =====================================================

const createClient = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const {
      name,
      email,
      phone,
      status,
      billing,
      mrr,
      nextInvoice,
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Client name is required",
      });
    }

    // -----------------------------
    // Create client
    // -----------------------------

    const client = await prisma.client.create({
      data: {
        companyId,
        name: name.trim(),
        email: email?.trim().toLowerCase() || null,
        phone: phone?.trim() || null,
        status: status || "active",
        billing: billing || null,
        mrr: mrr ? Number(mrr) : 0,
        nextInvoice: nextInvoice
          ? new Date(nextInvoice)
          : null,
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
      email,
      phone,
      status,
      billing,
      mrr,
      nextInvoice,
    } = req.body;

    // -----------------------------
    // Check client belongs
    // to current company
    // -----------------------------

    const existingClient = await prisma.client.findFirst({
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

        ...(email !== undefined && {
          email: email?.trim().toLowerCase() || null,
        }),

        ...(phone !== undefined && {
          phone: phone?.trim() || null,
        }),

        ...(status !== undefined && {
          status,
        }),

        ...(billing !== undefined && {
          billing,
        }),

        ...(mrr !== undefined && {
          mrr: Number(mrr),
        }),

        ...(nextInvoice !== undefined && {
          nextInvoice: nextInvoice
            ? new Date(nextInvoice)
            : null,
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

    const existingClient = await prisma.client.findFirst({
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
    });
  }
};

module.exports = {
  getClients,
  createClient,
  updateClient,
  deleteClient,
};