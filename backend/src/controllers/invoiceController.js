const prisma = require("../../config/prisma");
const { sendInvoiceEmail } = require("../services/emailService");

// =====================================================
// HELPER: PARSE INVOICE REQUEST BODY
// =====================================================

const parseInvoiceBody = (req) => {
  let body = req.body || {};

  /*
   * Frontend sends multipart/form-data:
   *
   * formData.append("invoice", JSON.stringify(payload))
   * formData.append("pdf", pdfBlob, "invoice.pdf")
   *
   * Therefore req.body.invoice is a JSON string.
   */

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
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found",
      });
    }

    // -------------------------------------------------
    // Parse multipart/form-data
    // -------------------------------------------------

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

    // -------------------------------------------------
    // PDF from Multer
    // -------------------------------------------------

    const pdfBuffer = req.file?.buffer;

    console.log("====================================");
    console.log("CREATE INVOICE");
    console.log("COMPANY ID:", companyId);
    console.log("CLIENT ID:", client);
    console.log("EMAIL CLIENT:", emailClient);
    console.log("EMAIL CLIENT BOOLEAN:", shouldEmailClient(emailClient));
    console.log("PDF RECEIVED:", !!req.file);
    console.log("PDF SIZE:", req.file?.size);
    console.log("====================================");

    // -------------------------------------------------
    // Validate client
    // -------------------------------------------------

    if (!client) {
      return res.status(400).json({
        success: false,
        message: "Client is required",
      });
    }

    // -------------------------------------------------
    // Get client from DATABASE
    //
    // IMPORTANT:
    // We DO NOT take the email from frontend.
    // We get it directly from PostgreSQL.
    // -------------------------------------------------

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

    console.log("====================================");
    console.log("CLIENT FROM DATABASE");
    console.log("CLIENT ID:", existingClient.id);
    console.log("CLIENT NAME:", existingClient.name);
    console.log("CLIENT EMAIL:", existingClient.email);
    console.log("CLIENT COMPANY:", existingClient.companyId);
    console.log("====================================");

    // -------------------------------------------------
    // Prepare invoice items
    // -------------------------------------------------

    const invoiceItems = Array.isArray(items)
      ? items.map((item) => {
          const quantity = Number(
            item?.qty ??
            item?.quantity ??
            1
          );

          const unitPrice = Number(
            item?.rate ??
            item?.unitPrice ??
            0
          );

          const safeQuantity = Number.isFinite(quantity)
            ? quantity
            : 1;

          const safeUnitPrice = Number.isFinite(unitPrice)
            ? unitPrice
            : 0;

          return {
            description:
              item?.desc ||
              item?.description ||
              "",

            quantity: safeQuantity,

            unitPrice: safeUnitPrice,

            amount: safeQuantity * safeUnitPrice,
          };
        })
      : [];

    // -------------------------------------------------
    // Create invoice
    // -------------------------------------------------

    const invoice = await prisma.invoice.create({
      data: {
        companyId,

        clientId: existingClient.id,

        invoiceNumber:
          invoiceNumber ||
          `INV-${new Date().getFullYear()}-${String(
            Date.now()
          ).slice(-6)}`,

        status: status || "draft",

        subtotal: Number(subtotal) || 0,

        tax: Number(tax) || 0,

        total: Number(total) || 0,

        issueDate: invoiceDate
          ? new Date(invoiceDate)
          : new Date(),

        dueDate: dueDate
          ? new Date(dueDate)
          : null,

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
          },
        },

        items: true,
      },
    });

    // =================================================
    // SEND INVOICE EMAIL
    // =================================================

    let emailSent = false;
    let emailError = null;

    if (shouldEmailClient(emailClient)) {
      console.log("====================================");
      console.log("EMAIL TO CLIENT ENABLED");
      console.log("DATABASE CLIENT EMAIL:", invoice.client?.email);
      console.log("CLIENT NAME:", invoice.client?.name);
      console.log("INVOICE NUMBER:", invoice.invoiceNumber);
      console.log("PDF AVAILABLE:", !!pdfBuffer);
      console.log("PDF SIZE:", pdfBuffer?.length);
      console.log("====================================");

      // -------------------------------------------------
      // Check client email from database
      // -------------------------------------------------

      if (!invoice.client?.email) {
        emailError =
          "Selected client does not have an email address in the database";

        console.warn(
          "INVOICE EMAIL SKIPPED:",
          emailError
        );
      }

      // -------------------------------------------------
      // Check PDF
      // -------------------------------------------------

      else if (!pdfBuffer) {
        emailError =
          "Invoice PDF was not received by the server";

        console.warn(
          "INVOICE EMAIL SKIPPED:",
          emailError
        );
      }

      // -------------------------------------------------
      // Send email
      // -------------------------------------------------

      else {
        try {
          console.log("====================================");
          console.log("SENDING INVOICE EMAIL");
          console.log("TO:", invoice.client.email);
          console.log("CLIENT:", invoice.client.name);
          console.log("INVOICE:", invoice.invoiceNumber);
          console.log("PDF SIZE:", pdfBuffer.length);
          console.log("====================================");

          const emailInfo = await sendInvoiceEmail({
            email: invoice.client.email,
            clientName: invoice.client.name,
            invoiceNumber: invoice.invoiceNumber,
            total: invoice.total,
            pdfBuffer,
          });

          emailSent = true;

          console.log("====================================");
          console.log("INVOICE EMAIL SENT SUCCESSFULLY");
          console.log("MESSAGE ID:", emailInfo?.messageId);
          console.log("ACCEPTED:", emailInfo?.accepted);
          console.log("REJECTED:", emailInfo?.rejected);
          console.log("RECIPIENT:", invoice.client.email);
          console.log("PDF ATTACHED: YES");
          console.log("PDF SIZE:", pdfBuffer.length);
          console.log("====================================");
        } catch (emailErr) {
          emailError =
            emailErr.message ||
            "Failed to send invoice email";

          console.error(
            "===================================="
          );

          console.error(
            "SEND INVOICE EMAIL ERROR:"
          );

          console.error(emailErr);

          console.error(
            "===================================="
          );
        }
      }
    } else {
      console.log(
        "EMAIL TO CLIENT DISABLED - EMAIL NOT SENT"
      );
    }

    // =================================================
    // RESPONSE
    // =================================================

    let message =
      "Invoice created successfully";

    if (shouldEmailClient(emailClient)) {
      if (emailSent) {
        message =
          "Invoice created and emailed successfully";
      } else {
        message =
          "Invoice created, but email could not be sent";
      }
    }

    return res.status(201).json({
      success: true,
      message,
      invoice,
      emailSent,
      emailError,
    });
  } catch (error) {
    console.error(
      "CREATE INVOICE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create invoice",
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

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required",
      });
    }

    // -------------------------------------------------
    // Find existing invoice
    // -------------------------------------------------

    const existing = await prisma.invoice.findFirst({
      where: {
        id,
        companyId,
      },

      include: {
        client: true,
        items: true,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // -------------------------------------------------
    // Parse request body
    // -------------------------------------------------

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

    console.log("====================================");
    console.log("UPDATE INVOICE");
    console.log("INVOICE ID:", id);
    console.log("COMPANY ID:", companyId);
    console.log("CLIENT ID:", client);
    console.log("EMAIL CLIENT:", emailClient);
    console.log(
      "EMAIL CLIENT BOOLEAN:",
      shouldEmailClient(emailClient)
    );
    console.log("PDF RECEIVED:", !!req.file);
    console.log("PDF SIZE:", req.file?.size);
    console.log("====================================");

    // -------------------------------------------------
    // Determine selected client
    // -------------------------------------------------

    let selectedClient = existing.client;

    if (client !== undefined) {
      if (!client) {
        return res.status(400).json({
          success: false,
          message: "Client is required",
        });
      }

      const existingClient =
        await prisma.client.findFirst({
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
          message:
            "Client not found or does not belong to this company",
        });
      }

      selectedClient = existingClient;

      console.log("====================================");
      console.log("UPDATED CLIENT FROM DATABASE");
      console.log("CLIENT ID:", selectedClient.id);
      console.log("CLIENT NAME:", selectedClient.name);
      console.log("CLIENT EMAIL:", selectedClient.email);
      console.log("====================================");
    }

    // -------------------------------------------------
    // Prepare update data
    // -------------------------------------------------

    const updateData = {};

    if (invoiceNumber !== undefined) {
      updateData.invoiceNumber = invoiceNumber;
    }

    if (client !== undefined) {
      updateData.clientId = client;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (subtotal !== undefined) {
      updateData.subtotal =
        Number(subtotal) || 0;
    }

    if (tax !== undefined) {
      updateData.tax =
        Number(tax) || 0;
    }

    if (total !== undefined) {
      updateData.total =
        Number(total) || 0;
    }

    if (invoiceDate !== undefined) {
      updateData.issueDate = invoiceDate
        ? new Date(invoiceDate)
        : existing.issueDate;
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate
        ? new Date(dueDate)
        : null;
    }

    // -------------------------------------------------
    // Replace invoice items
    // -------------------------------------------------

    if (Array.isArray(items)) {
      const invoiceItems = items.map((item) => {
        const quantity = Number(
          item?.qty ??
          item?.quantity ??
          1
        );

        const unitPrice = Number(
          item?.rate ??
          item?.unitPrice ??
          0
        );

        const safeQuantity =
          Number.isFinite(quantity)
            ? quantity
            : 1;

        const safeUnitPrice =
          Number.isFinite(unitPrice)
            ? unitPrice
            : 0;

        return {
          description:
            item?.desc ||
            item?.description ||
            "",

          quantity: safeQuantity,

          unitPrice: safeUnitPrice,

          amount:
            safeQuantity *
            safeUnitPrice,
        };
      });

      await prisma.invoiceItem.deleteMany({
        where: {
          invoiceId: id,
        },
      });

      updateData.items = {
        create: invoiceItems,
      };
    }

    // -------------------------------------------------
    // Update invoice
    // -------------------------------------------------

    const invoice =
      await prisma.invoice.update({
        where: {
          id,
        },

        data: updateData,

        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          items: true,
        },
      });

    // =================================================
    // SEND UPDATED INVOICE EMAIL
    // =================================================

    let emailSent = false;
    let emailError = null;

    if (shouldEmailClient(emailClient)) {
      console.log("====================================");
      console.log("UPDATED INVOICE EMAIL");
      console.log(
        "DATABASE CLIENT EMAIL:",
        invoice.client?.email
      );
      console.log(
        "CLIENT NAME:",
        invoice.client?.name
      );
      console.log(
        "INVOICE NUMBER:",
        invoice.invoiceNumber
      );
      console.log(
        "PDF AVAILABLE:",
        !!pdfBuffer
      );
      console.log(
        "PDF SIZE:",
        pdfBuffer?.length
      );
      console.log("====================================");

      if (!invoice.client?.email) {
        emailError =
          "Selected client does not have an email address in the database";

        console.warn(
          "UPDATE INVOICE EMAIL SKIPPED:",
          emailError
        );
      } else if (!pdfBuffer) {
        emailError =
          "Updated invoice PDF was not received by the server";

        console.warn(
          "UPDATE INVOICE EMAIL SKIPPED:",
          emailError
        );
      } else {
        try {
          console.log(
            "SENDING UPDATED INVOICE EMAIL TO:",
            invoice.client.email
          );

          const emailInfo =
            await sendInvoiceEmail({
              email: invoice.client.email,
              clientName: invoice.client.name,
              invoiceNumber:
                invoice.invoiceNumber,
              total: invoice.total,
              pdfBuffer,
            });

          emailSent = true;

          console.log("====================================");
          console.log(
            "UPDATED INVOICE EMAIL SENT SUCCESSFULLY"
          );
          console.log(
            "MESSAGE ID:",
            emailInfo?.messageId
          );
          console.log(
            "ACCEPTED:",
            emailInfo?.accepted
          );
          console.log(
            "REJECTED:",
            emailInfo?.rejected
          );
          console.log(
            "RECIPIENT:",
            invoice.client.email
          );
          console.log("PDF ATTACHED: YES");
          console.log(
            "PDF SIZE:",
            pdfBuffer.length
          );
          console.log("====================================");
        } catch (emailErr) {
          emailError =
            emailErr.message ||
            "Failed to send invoice email";

          console.error(
            "SEND UPDATED INVOICE EMAIL ERROR:",
            emailErr
          );
        }
      }
    } else {
      console.log(
        "EMAIL TO CLIENT DISABLED - EMAIL NOT SENT"
      );
    }

    // =================================================
    // RESPONSE
    // =================================================

    let message =
      "Invoice updated successfully";

    if (shouldEmailClient(emailClient)) {
      if (emailSent) {
        message =
          "Invoice updated and emailed successfully";
      } else {
        message =
          "Invoice updated, but email could not be sent";
      }
    }

    return res.status(200).json({
      success: true,
      message,
      invoice,
      emailSent,
      emailError,
    });
  } catch (error) {
    console.error(
      "UPDATE INVOICE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update invoice",
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

    // -------------------------------------------------
    // Find invoice belonging to company
    // -------------------------------------------------

    const existing =
      await prisma.invoice.findFirst({
        where: {
          id,
          companyId,
        },
      });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // -------------------------------------------------
    // Delete invoice
    // -------------------------------------------------

    await prisma.invoice.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE INVOICE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete invoice",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};