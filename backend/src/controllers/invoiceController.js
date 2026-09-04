const prisma = require("../../config/prisma");
// OR adjust path if different, e.g.:
// const prisma = require("../config/prisma");

// =====================================================
// GET ALL INVOICES
// =====================================================
const getInvoices = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found",
      });
    }

    const invoices = await prisma.invoice.findMany({
      where: { companyId },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error("GET INVOICES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch invoices",
    });
  }
};

// =====================================================
// GET INVOICE BY ID
// =====================================================
const getInvoiceById = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        client: true,
        items: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("GET INVOICE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch invoice",
    });
  }
};

// =====================================================
// CREATE INVOICE
// =====================================================
const createInvoice = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const {
      invoiceNumber,
      client,
      invoiceDate,
      dueDate,
      items,
      subtotal,
      tax,
      total,
      status,
    } = req.body;

    if (!client) {
      return res.status(400).json({
        success: false,
        message: "Client is required",
      });
    }

    // Verify client belongs to company
    const existingClient = await prisma.client.findFirst({
      where: { id: client, companyId },
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const invoice = await prisma.invoice.create({
      data: {
        companyId,
        clientId: client,
        invoiceNumber:
          invoiceNumber ||
          `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        status: status || "draft",
        subtotal: Number(subtotal) || 0,
        tax: Number(tax) || 0,
        total: Number(total) || 0,
        issueDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        items: {
          create: (items || []).map((item) => ({
            description: item.desc || item.description || "",
            quantity: Number(item.qty ?? item.quantity) || 1,
            unitPrice: Number(item.rate ?? item.unitPrice) || 0,
            amount:
              (Number(item.qty ?? item.quantity) || 0) *
              (Number(item.rate ?? item.unitPrice) || 0),
          })),
        },
      },
      include: {
        client: true,
        items: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error("CREATE INVOICE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create invoice",
    });
  }
};

// =====================================================
// UPDATE INVOICE
// =====================================================
const updateInvoice = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

    const existing = await prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const {
      invoiceNumber,
      client,
      invoiceDate,
      dueDate,
      items,
      subtotal,
      tax,
      total,
      status,
    } = req.body;

    // Optional: replace line items
    if (Array.isArray(items)) {
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(invoiceNumber !== undefined && { invoiceNumber }),
        ...(client !== undefined && { clientId: client }),
        ...(status !== undefined && { status }),
        ...(subtotal !== undefined && { subtotal: Number(subtotal) }),
        ...(tax !== undefined && { tax: Number(tax) }),
        ...(total !== undefined && { total: Number(total) }),
        ...(invoiceDate !== undefined && {
          issueDate: new Date(invoiceDate),
        }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(Array.isArray(items) && {
          items: {
            create: items.map((item) => ({
              description: item.desc || item.description || "",
              quantity: Number(item.qty ?? item.quantity) || 1,
              unitPrice: Number(item.rate ?? item.unitPrice) || 0,
              amount:
                (Number(item.qty ?? item.quantity) || 0) *
                (Number(item.rate ?? item.unitPrice) || 0),
            })),
          },
        }),
      },
      include: {
        client: true,
        items: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    console.error("UPDATE INVOICE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update invoice",
    });
  }
};

// =====================================================
// DELETE INVOICE
// =====================================================
const deleteInvoice = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

    const existing = await prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    await prisma.invoice.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("DELETE INVOICE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete invoice",
    });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};