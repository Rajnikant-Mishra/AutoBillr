// const prisma = require("../../config/prisma");
// const { sendInvoiceEmail } = require("../services/emailService");

// // =====================================================
// // HELPER: PARSE INVOICE REQUEST BODY
// // =====================================================

// const parseInvoiceBody = (req) => {
//   let body = req.body || {};

//   if (typeof body.invoice === "string") {
//     try {
//       body = JSON.parse(body.invoice);
//     } catch (error) {
//       throw new Error("Invalid invoice JSON data");
//     }
//   }

//   return body;
// };

// // =====================================================
// // HELPER: CHECK EMAIL FLAG
// // =====================================================

// const shouldEmailClient = (value) => {
//   return (
//     value === true ||
//     value === "true" ||
//     value === 1 ||
//     value === "1"
//   );
// };

// // =====================================================
// // GET ALL INVOICES
// // =====================================================

// const getInvoices = async (req, res) => {
//   try {
//     const companyId = req.user?.companyId;

//     if (!companyId) {
//       return res.status(401).json({
//         success: false,
//         message: "Company ID not found",
//       });
//     }

//     const invoices = await prisma.invoice.findMany({
//       where: {
//         companyId,
//       },
//       include: {
//         client: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             // Client ke linked projects fetch kiye
//             projects: {
//               select: {
//                 id: true,
//                 title: true,
//               },
//             },
//           },
//         },
//         items: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       invoices,
//     });
//   } catch (error) {
//     console.error("GET INVOICES ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to fetch invoices",
//     });
//   }
// };

// // =====================================================
// // GET INVOICE BY ID
// // =====================================================

// const getInvoiceById = async (req, res) => {
//   try {
//     const companyId = req.user?.companyId;
//     const { id } = req.params;

//     if (!companyId) {
//       return res.status(401).json({
//         success: false,
//         message: "Company ID not found",
//       });
//     }

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Invoice ID is required",
//       });
//     }

//     const invoice = await prisma.invoice.findFirst({
//       where: {
//         id,
//         companyId,
//       },
//       include: {
//         client: {
//           include: {
//             projects: true,
//           },
//         },
//         items: true,
//       },
//     });

//     if (!invoice) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       invoice,
//     });
//   } catch (error) {
//     console.error("GET INVOICE ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to fetch invoice",
//     });
//   }
// };

// // =====================================================
// // CREATE INVOICE
// // =====================================================

// const createInvoice = async (req, res) => {
//   try {
//     const companyId = req.user?.companyId;

//     if (!companyId) {
//       return res.status(401).json({
//         success: false,
//         message: "Company ID not found",
//       });
//     }

//     const body = parseInvoiceBody(req);

//     const {
//       invoiceNumber,
//       client,
//       project,
//       invoiceDate,
//       dueDate,
//       items,
//       subtotal,
//       tax,
//       total,
//       status,
//       emailClient,
//     } = body;

//     const pdfBuffer = req.file?.buffer;

//     if (!client) {
//       return res.status(400).json({
//         success: false,
//         message: "Client is required",
//       });
//     }

//     const existingClient = await prisma.client.findFirst({
//       where: {
//         id: client,
//         companyId,
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         companyId: true,
//       },
//     });

//     if (!existingClient) {
//       return res.status(404).json({
//         success: false,
//         message: "Client not found or does not belong to this company",
//       });
//     }

//     const invoiceItems = Array.isArray(items)
//       ? items.map((item) => {
//           const quantity = Number(item?.qty ?? item?.quantity ?? 1);
//           const unitPrice = Number(item?.rate ?? item?.unitPrice ?? 0);
//           const safeQuantity = Number.isFinite(quantity) ? quantity : 1;
//           const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;

//           return {
//             description: item?.desc || item?.description || "",
//             quantity: safeQuantity,
//             unitPrice: safeUnitPrice,
//             amount: safeQuantity * safeUnitPrice,
//           };
//         })
//       : [];

//     const invoice = await prisma.invoice.create({
//       data: {
//         companyId,
//         clientId: existingClient.id,
//          projectId: project || null,
//         invoiceNumber:
//           invoiceNumber ||
//           `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
//         status: status || "draft",
//         subtotal: Number(subtotal) || 0,
//         tax: Number(tax) || 0,
//         total: Number(total) || 0,
//         issueDate: invoiceDate ? new Date(invoiceDate) : new Date(),
//         dueDate: dueDate ? new Date(dueDate) : null,
//         items: {
//           create: invoiceItems,
//         },
//       },
//    include: {
//   client: {
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       projects: {
//         select: {
//           id: true,
//           title: true,
//         },
//       },
//     },
//   },
//   project: true,
//   items: true,
// },
//     });

//     // Email Dispatch Logic
//     let emailSent = false;
//     let emailError = null;

//     if (shouldEmailClient(emailClient)) {
//       if (!invoice.client?.email) {
//         emailError = "Client does not have an email address in database";
//       } else if (!pdfBuffer) {
//         emailError = "Invoice PDF was not received by server";
//       } else {
//         try {
//           await sendInvoiceEmail({
//             email: invoice.client.email,
//             clientName: invoice.client.name,
//             invoiceNumber: invoice.invoiceNumber,
//             total: invoice.total,
//             pdfBuffer,
//           });
//           emailSent = true;
//         } catch (emailErr) {
//           emailError = emailErr.message || "Failed to send invoice email";
//           console.error("SEND INVOICE EMAIL ERROR:", emailErr);
//         }
//       }
//     }

//     return res.status(201).json({
//       success: true,
//       message: emailSent
//         ? "Invoice created and emailed successfully"
//         : "Invoice created successfully",
//       invoice,
//       emailSent,
//       emailError,
//     });
//   } catch (error) {
//     console.error("CREATE INVOICE ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to create invoice",
//     });
//   }
// };

// // =====================================================
// // UPDATE INVOICE
// // =====================================================


// const updateInvoice = async (req, res) => {
//   try {
//     const companyId = req.user?.companyId;
//     const { id } = req.params;

//     // =====================================================
//     // AUTH CHECK
//     // =====================================================
//     if (!companyId) {
//       return res.status(401).json({
//         success: false,
//         message: "Company ID not found",
//       });
//     }

//     // =====================================================
//     // FIND EXISTING INVOICE
//     // =====================================================
//     const existing = await prisma.invoice.findFirst({
//       where: {
//         id,
//         companyId,
//       },
//       include: {
//         client: true,
//         project: true,
//         items: true,
//       },
//     });

//     if (!existing) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     // =====================================================
//     // PARSE REQUEST BODY
//     // =====================================================
//     const body = parseInvoiceBody(req);

//     const {
//       invoiceNumber,
//       client,
//       project,
//       invoiceDate,
//       dueDate,
//       items,
//       subtotal,
//       tax,
//       total,
//       status,
//       emailClient,
//     } = body;

//     const pdfBuffer = req.file?.buffer;

//     // =====================================================
//     // UPDATE DATA
//     // =====================================================
//     const updateData = {};

//     // Invoice number
//     if (invoiceNumber !== undefined) {
//       updateData.invoiceNumber = invoiceNumber;
//     }

//     // Client
//     if (client !== undefined) {
//       updateData.clientId = client || null;
//     }

//     // Project
//     // IMPORTANT: this was missing in your code
//     if (project !== undefined) {
//       updateData.projectId = project || null;
//     }

//     // Status
//     if (status !== undefined) {
//       updateData.status = status;
//     }

//     // Amounts
//     if (subtotal !== undefined) {
//       updateData.subtotal = Number(subtotal) || 0;
//     }

//     if (tax !== undefined) {
//       updateData.tax = Number(tax) || 0;
//     }

//     if (total !== undefined) {
//       updateData.total = Number(total) || 0;
//     }

//     // Invoice date
//     if (invoiceDate !== undefined) {
//       updateData.issueDate = invoiceDate
//         ? new Date(invoiceDate)
//         : existing.issueDate;
//     }

//     // Due date
//     if (dueDate !== undefined) {
//       updateData.dueDate = dueDate
//         ? new Date(dueDate)
//         : null;
//     }

//     // =====================================================
//     // UPDATE INVOICE ITEMS
//     // =====================================================
//     if (Array.isArray(items)) {
//       const invoiceItems = items.map((item) => {
//         const quantity = Number(
//           item?.qty ?? item?.quantity ?? 1
//         );

//         const unitPrice = Number(
//           item?.rate ?? item?.unitPrice ?? 0
//         );

//         const safeQuantity = Number.isFinite(quantity)
//           ? quantity
//           : 1;

//         const safeUnitPrice = Number.isFinite(unitPrice)
//           ? unitPrice
//           : 0;

//         return {
//           description:
//             item?.desc ||
//             item?.description ||
//             "",

//           quantity: safeQuantity,

//           unitPrice: safeUnitPrice,

//           amount: safeQuantity * safeUnitPrice,
//         };
//       });

//       // Delete old items
//       await prisma.invoiceItem.deleteMany({
//         where: {
//           invoiceId: id,
//         },
//       });

//       // Create new items
//       updateData.items = {
//         create: invoiceItems,
//       };
//     }

//     // =====================================================
//     // UPDATE INVOICE
//     // =====================================================
//     const invoice = await prisma.invoice.update({
//       where: {
//         id,
//       },

//       data: updateData,

//       include: {
//         client: {
//           select: {
//             id: true,
//             name: true,
//             email: true,

//             projects: {
//               select: {
//                 id: true,
//                 title: true,
//               },
//             },
//           },
//         },

//         // IMPORTANT: return project
//         project: true,

//         items: true,
//       },
//     });

//     // =====================================================
//     // EMAIL DISPATCH
//     // =====================================================
//     let emailSent = false;
//     let emailError = null;

//     if (shouldEmailClient(emailClient)) {
//       if (!invoice.client?.email) {
//         emailError =
//           "Client does not have an email address in database";
//       } else if (!pdfBuffer) {
//         emailError =
//           "Updated invoice PDF was not received by server";
//       } else {
//         try {
//           await sendInvoiceEmail({
//             email: invoice.client.email,
//             clientName: invoice.client.name,
//             invoiceNumber: invoice.invoiceNumber,
//             total: invoice.total,
//             pdfBuffer,
//           });

//           emailSent = true;
//         } catch (emailErr) {
//           emailError =
//             emailErr.message ||
//             "Failed to send invoice email";

//           console.error(
//             "SEND UPDATED INVOICE EMAIL ERROR:",
//             emailErr
//           );
//         }
//       }
//     }

//     // =====================================================
//     // RESPONSE
//     // =====================================================
//     return res.status(200).json({
//       success: true,

//       message: emailSent
//         ? "Invoice updated and emailed successfully"
//         : "Invoice updated successfully",

//       invoice,

//       emailSent,

//       emailError,
//     });
//   } catch (error) {
//     console.error("UPDATE INVOICE ERROR:", error);

//     return res.status(500).json({
//       success: false,

//       message:
//         error.message ||
//         "Failed to update invoice",
//     });
//   }
// };



// // =====================================================
// // DELETE INVOICE
// // =====================================================

// const deleteInvoice = async (req, res) => {
//   try {
//     const companyId = req.user?.companyId;
//     const { id } = req.params;

//     if (!companyId) {
//       return res.status(401).json({
//         success: false,
//         message: "Company ID not found",
//       });
//     }

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Invoice ID is required",
//       });
//     }

//     const existing = await prisma.invoice.findFirst({
//       where: { id, companyId },
//     });

//     if (!existing) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     await prisma.invoice.delete({ where: { id } });

//     return res.status(200).json({
//       success: true,
//       message: "Invoice deleted successfully",
//     });
//   } catch (error) {
//     console.error("DELETE INVOICE ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to delete invoice",
//     });
//   }
// };

// module.exports = {
//   getInvoices,
//   getInvoiceById,
//   createInvoice,
//   updateInvoice,
//   deleteInvoice,
// };
























const prisma = require("../../config/prisma");
const { sendInvoiceEmail } = require("../services/emailService");

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

            projects: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },

        // IMPORTANT:
        // Return the invoice's selected project
        project: true,

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
      message:
        error.message || "Failed to fetch invoices",
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

        // IMPORTANT:
        // This is what allows Composer to get invoice.project
        project: true,

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
      message:
        error.message || "Failed to fetch invoice",
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
      project,
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

    // =====================================================
    // CLIENT VALIDATION
    // =====================================================

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
        message:
          "Client not found or does not belong to this company",
      });
    }

    // =====================================================
    // PROJECT VALIDATION
    // =====================================================

    let existingProject = null;

    if (project) {
      existingProject = await prisma.project.findFirst({
        where: {
          id: project,
          companyId,
        },

        select: {
          id: true,
          title: true,
          companyId: true,
        },
      });

      if (!existingProject) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found or does not belong to this company",
        });
      }
    }

    // =====================================================
    // PREPARE INVOICE ITEMS
    // =====================================================

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

            amount:
              safeQuantity * safeUnitPrice,
          };
        })
      : [];

    // =====================================================
    // CREATE INVOICE
    // =====================================================

    const invoice = await prisma.invoice.create({
      data: {
        companyId,

        clientId: existingClient.id,

        // IMPORTANT:
        // Save selected project
        projectId: existingProject?.id || null,

        invoiceNumber:
          invoiceNumber ||
          `INV-${new Date().getFullYear()}-${String(
            Date.now()
          ).slice(-6)}`,

        status: status || "draft",

        subtotal:
          Number(subtotal) || 0,

        tax:
          Number(tax) || 0,

        total:
          Number(total) || 0,

        issueDate:
          invoiceDate
            ? new Date(invoiceDate)
            : new Date(),

        dueDate:
          dueDate
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

            projects: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },

        // IMPORTANT:
        // Return project in response
        project: true,

        items: true,
      },
    });

    // =====================================================
    // EMAIL DISPATCH
    // =====================================================

    let emailSent = false;
    let emailError = null;

    if (shouldEmailClient(emailClient)) {
      if (!invoice.client?.email) {
        emailError =
          "Client does not have an email address in database";
      } else if (!pdfBuffer) {
        emailError =
          "Invoice PDF was not received by server";
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
          emailError =
            emailErr.message ||
            "Failed to send invoice email";

          console.error(
            "SEND INVOICE EMAIL ERROR:",
            emailErr
          );
        }
      }
    }

    // =====================================================
    // RESPONSE
    // =====================================================

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

    // =====================================================
    // AUTH CHECK
    // =====================================================

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

    // =====================================================
    // FIND EXISTING INVOICE
    // =====================================================

    const existing = await prisma.invoice.findFirst({
      where: {
        id,
        companyId,
      },

      include: {
        client: true,
        project: true,
        items: true,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // =====================================================
    // PARSE BODY
    // =====================================================

    const body = parseInvoiceBody(req);

    const {
      invoiceNumber,
      client,
      project,
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

    // =====================================================
    // UPDATE DATA
    // =====================================================

    const updateData = {};

    // -----------------------------------------------------
    // INVOICE NUMBER
    // -----------------------------------------------------

    if (invoiceNumber !== undefined) {
      updateData.invoiceNumber = invoiceNumber;
    }

    // -----------------------------------------------------
    // CLIENT
    // -----------------------------------------------------

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
          },
        });

      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message:
            "Client not found or does not belong to this company",
        });
      }

      updateData.clientId =
        existingClient.id;
    }

    // -----------------------------------------------------
    // PROJECT
    // -----------------------------------------------------
    // IMPORTANT:
    // Save selected projectId when project changes

    if (project !== undefined) {
      if (project) {
        const existingProject =
          await prisma.project.findFirst({
            where: {
              id: project,
              companyId,
            },

            select: {
              id: true,
              title: true,
              companyId: true,
            },
          });

        if (!existingProject) {
          return res.status(404).json({
            success: false,
            message:
              "Project not found or does not belong to this company",
          });
        }

        updateData.projectId =
          existingProject.id;
      } else {
        // User removed project
        updateData.projectId = null;
      }
    }

    // -----------------------------------------------------
    // STATUS
    // -----------------------------------------------------

    if (status !== undefined) {
      updateData.status = status;
    }

    // -----------------------------------------------------
    // SUBTOTAL
    // -----------------------------------------------------

    if (subtotal !== undefined) {
      updateData.subtotal =
        Number(subtotal) || 0;
    }

    // -----------------------------------------------------
    // TAX
    // -----------------------------------------------------

    if (tax !== undefined) {
      updateData.tax =
        Number(tax) || 0;
    }

    // -----------------------------------------------------
    // TOTAL
    // -----------------------------------------------------

    if (total !== undefined) {
      updateData.total =
        Number(total) || 0;
    }

    // -----------------------------------------------------
    // ISSUE DATE
    // -----------------------------------------------------

    if (invoiceDate !== undefined) {
      updateData.issueDate =
        invoiceDate
          ? new Date(invoiceDate)
          : existing.issueDate;
    }

    // -----------------------------------------------------
    // DUE DATE
    // -----------------------------------------------------

    if (dueDate !== undefined) {
      updateData.dueDate =
        dueDate
          ? new Date(dueDate)
          : null;
    }

    // =====================================================
    // PREPARE INVOICE ITEMS
    // =====================================================

    let invoiceItems = null;

    if (Array.isArray(items)) {
      invoiceItems = items.map((item) => {
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

          quantity:
            safeQuantity,

          unitPrice:
            safeUnitPrice,

          amount:
            safeQuantity *
            safeUnitPrice,
        };
      });
    }

    // =====================================================
    // UPDATE INVOICE
    // =====================================================

    let invoice;

    if (invoiceItems !== null) {
      // ---------------------------------------------------
      // UPDATE INVOICE + ITEMS IN TRANSACTION
      // ---------------------------------------------------

      invoice =
        await prisma.$transaction(
          async (tx) => {
            // Delete old items
            await tx.invoiceItem.deleteMany({
              where: {
                invoiceId: id,
              },
            });

            // Update invoice
            return tx.invoice.update({
              where: {
                id,
              },

              data: {
                ...updateData,

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

                // IMPORTANT
                project: true,

                items: true,
              },
            });
          }
        );
    } else {
      // ---------------------------------------------------
      // UPDATE INVOICE WITHOUT CHANGING ITEMS
      // ---------------------------------------------------

      invoice =
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

                projects: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },

            // IMPORTANT
            project: true,

            items: true,
          },
        });
    }

    // =====================================================
    // EMAIL DISPATCH
    // =====================================================

    let emailSent = false;
    let emailError = null;

    if (shouldEmailClient(emailClient)) {
      if (!invoice.client?.email) {
        emailError =
          "Client does not have an email address in database";
      } else if (!pdfBuffer) {
        emailError =
          "Updated invoice PDF was not received by server";
      } else {
        try {
          await sendInvoiceEmail({
            email: invoice.client.email,

            clientName:
              invoice.client.name,

            invoiceNumber:
              invoice.invoiceNumber,

            total:
              invoice.total,

            pdfBuffer,
          });

          emailSent = true;
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
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      message: emailSent
        ? "Invoice updated and emailed successfully"
        : "Invoice updated successfully",

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

    // =====================================================
    // AUTH CHECK
    // =====================================================

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

    // =====================================================
    // FIND INVOICE
    // =====================================================

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

    // =====================================================
    // DELETE
    // =====================================================

    await prisma.invoice.delete({
      where: {
        id,
      },
    });

    // =====================================================
    // RESPONSE
    // =====================================================

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
// =====================================================
// SEND INVOICE (PDF + EMAIL)
// =====================================================
const sendInvoice = async (req, res) => {
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

    // Find invoice (with client)
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
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
        project: true,
        items: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const pdfBuffer = req.file?.buffer;
    const emailClientFlag =
      req.body?.emailClient ?? req.body?.emailClient === "true";

    // Prefer the email that the frontend sent, otherwise fall back to DB
    const clientEmail =
      req.body?.clientEmail || invoice.client?.email || null;

    if (!shouldEmailClient(emailClientFlag) && !clientEmail) {
      return res.status(400).json({
        success: false,
        message: "Email flag not set or client has no email",
      });
    }

    if (!clientEmail) {
      return res.status(400).json({
        success: false,
        message: "Client does not have an email address",
      });
    }

    if (!pdfBuffer) {
      return res.status(400).json({
        success: false,
        message: "Invoice PDF was not received by server",
      });
    }

    // Send the email
    let emailSent = false;
    let emailError = null;

    try {
      await sendInvoiceEmail({
        email: clientEmail,
        clientName: invoice.client?.name || "Client",
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        pdfBuffer,
      });
      emailSent = true;
    } catch (emailErr) {
      emailError = emailErr.message || "Failed to send invoice email";
      console.error("SEND INVOICE EMAIL ERROR:", emailErr);
    }

    // Optional: update status to "sent" / "pending" after successful send
    if (emailSent) {
      await prisma.invoice.update({
        where: { id },
        data: {
          status: invoice.status === "draft" ? "pending" : invoice.status,
          // you can also set a sentAt field if you have one
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: emailSent
        ? "Invoice emailed successfully"
        : "Invoice processed but email failed",
      emailSent,
      emailError,
      invoice,
    });
  } catch (error) {
    console.error("SEND INVOICE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send invoice",
    });
  }
};
module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
};

