const prisma = require("../../config/prisma");
const { sendInvoiceEmail, sendReminderEmail } = require("../services/emailService");

// =====================================================
// HELPER: PARSE INVOICE REQUEST BODY
// =====================================================

const parseInvoiceBody = (req) => {
  let body = req.body || {};

  if (typeof body.invoice === "string") {
    try {
      body = JSON.parse(body.invoice);
    } catch (error) {
      throw new Error("Invalid invoice JSON data");
    }
  }

  return body;
};

// =====================================================
// HELPER: CHECK EMAIL FLAG
// =====================================================

const shouldEmailClient = (value) => {
  return (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  );
};

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
      where: {
        companyId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            // Client ke linked projects fetch kiye
            projects: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
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
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required",
      });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        client: {
          include: {
            projects: true,
          },
        },
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
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found",
      });
    }

    const body = parseInvoiceBody(req);

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
      emailClient,
    } = body;

    const pdfBuffer = req.file?.buffer;

    if (!client) {
      return res.status(400).json({
        success: false,
        message: "Client is required",
      });
    }

    const existingClient = await prisma.client.findFirst({
      where: {
        id: client,
        companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        companyId: true,
      },
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found or does not belong to this company",
      });
    }

    const invoiceItems = Array.isArray(items)
      ? items.map((item) => {
          const quantity = Number(item?.qty ?? item?.quantity ?? 1);
          const unitPrice = Number(item?.rate ?? item?.unitPrice ?? 0);
          const safeQuantity = Number.isFinite(quantity) ? quantity : 1;
          const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;

          return {
            description: item?.desc || item?.description || "",
            quantity: safeQuantity,
            unitPrice: safeUnitPrice,
            amount: safeQuantity * safeUnitPrice,
          };
        })
      : [];

    const invoice = await prisma.invoice.create({
      data: {
        companyId,
        clientId: existingClient.id,
        invoiceNumber:
          invoiceNumber ||
          `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        status: status || "draft",
        subtotal: Number(subtotal) || 0,
        tax: Number(tax) || 0,
        total: Number(total) || 0,
        issueDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        items: {
          create: invoiceItems,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            projects: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        items: true,
      },
    });

    // Email Dispatch Logic
    let emailSent = false;
    let emailError = null;

    if (shouldEmailClient(emailClient)) {
      if (!invoice.client?.email) {
        emailError = "Client does not have an email address in database";
      } else if (!pdfBuffer) {
        emailError = "Invoice PDF was not received by server";
      } else {
        try {
          await sendInvoiceEmail({
            email: invoice.client.email,
            clientName: invoice.client.name,
            invoiceNumber: invoice.invoiceNumber,
            total: invoice.total,
            pdfBuffer,
          });
          emailSent = true;
        } catch (emailErr) {
          emailError = emailErr.message || "Failed to send invoice email";
          console.error("SEND INVOICE EMAIL ERROR:", emailErr);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Invoice created and emailed successfully"
        : "Invoice created successfully",
      invoice,
      emailSent,
      emailError,
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
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found",
      });
    }

    const existing = await prisma.invoice.findFirst({
      where: { id, companyId },
      include: { client: true, items: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const body = parseInvoiceBody(req);
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
      emailClient,
    } = body;

    const pdfBuffer = req.file?.buffer;
    const updateData = {};

    if (invoiceNumber !== undefined) updateData.invoiceNumber = invoiceNumber;
    if (client !== undefined) updateData.clientId = client;
    if (status !== undefined) updateData.status = status;
    if (subtotal !== undefined) updateData.subtotal = Number(subtotal) || 0;
    if (tax !== undefined) updateData.tax = Number(tax) || 0;
    if (total !== undefined) updateData.total = Number(total) || 0;
    if (invoiceDate !== undefined) {
      updateData.issueDate = invoiceDate ? new Date(invoiceDate) : existing.issueDate;
    }
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (Array.isArray(items)) {
      const invoiceItems = items.map((item) => {
        const quantity = Number(item?.qty ?? item?.quantity ?? 1);
        const unitPrice = Number(item?.rate ?? item?.unitPrice ?? 0);
        const safeQuantity = Number.isFinite(quantity) ? quantity : 1;
        const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;

        return {
          description: item?.desc || item?.description || "",
          quantity: safeQuantity,
          unitPrice: safeUnitPrice,
          amount: safeQuantity * safeUnitPrice,
        };
      });

      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      updateData.items = { create: invoiceItems };
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            projects: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        items: true,
      },
    });

    let emailSent = false;
    let emailError = null;

    if (shouldEmailClient(emailClient)) {
      if (!invoice.client?.email) {
        emailError = "Client does not have an email address in database";
      } else if (!pdfBuffer) {
        emailError = "Updated invoice PDF was not received by server";
      } else {
        try {
          await sendInvoiceEmail({
            email: invoice.client.email,
            clientName: invoice.client.name,
            invoiceNumber: invoice.invoiceNumber,
            total: invoice.total,
            pdfBuffer,
          });
          emailSent = true;
        } catch (emailErr) {
          emailError = emailErr.message || "Failed to send invoice email";
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      invoice,
      emailSent,
      emailError,
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
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required",
      });
    }

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



const sendReminder = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required",
      });
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        client: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (!invoice.client?.email) {
      return res.status(400).json({
        success: false,
        message: "Client does not have an email address in the database",
      });
    }

    const formattedDate = invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Due upon receipt";

    await sendReminderEmail({
      email: invoice.client.email,
      clientName: invoice.client.name,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      dueDate: formattedDate,
    });

    return res.status(200).json({
      success: true,
      message: `Reminder email successfully sent to ${invoice.client.email}`,
    });
  } catch (error) {
    console.error("SEND REMINDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send reminder email",
    });
  }
};



module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendReminder,
};