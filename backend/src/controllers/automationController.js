// const prisma = require("../../config/prisma");

// const getCompanyId = async (req) => {
//   let companyId = req.user?.companyId || req.user?.company?.id;
//   if (!companyId) {
//     const userId = req.user?.id || req.user?.userId;
//     if (userId) {
//       const user = await prisma.user.findUnique({
//         where: { id: userId },
//         select: { companyId: true },
//       });
//       companyId = user?.companyId;
//     }
//   }
//   if (!companyId) {
//     const company = await prisma.company.findFirst();
//     companyId = company?.id;
//   }
//   return companyId;
// };

// const getAutomationOverview = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) {
//       return res.status(400).json({ success: false, message: "Company not found" });
//     }

//     // Fetch all clients with their projects
//     const clients = await prisma.client.findMany({
//       where: { companyId },
//       include: {
//         projects: {
//           select: { id: true, title: true },
//         },
//       },
//       orderBy: { name: "asc" },
//     });

//     const activeEnginesCount = clients.filter(
//       (c) => c.automation && c.automation.isActive === true
//     ).length;

//     return res.status(200).json({
//       success: true,
//       activeEngines: activeEnginesCount,
//       clients,
//     });
//   } catch (error) {
//     console.error("Automation Overview Error:", error);
//     return res.status(500).json({ success: false, message: "Failed to load automation data" });
//   }
// };

// const saveAutomation = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const { clientId, projectId, frequency, amount, autoSubmit, autoCharge } = req.body;

//     if (!clientId) {
//       return res.status(400).json({ success: false, message: "Client is required" });
//     }

//     // Calculate next invoice date based on frequency
//     const now = new Date();
//     let nextDate = new Date();

//     switch (frequency) {
//       case "Quarterly":
//         nextDate.setMonth(now.getMonth() + 3);
//         break;
//       case "Annual":
//         nextDate.setFullYear(now.getFullYear() + 1);
//         break;
//       case "Monthly":
//       default:
//         nextDate.setMonth(now.getMonth() + 1);
//         break;
//     }

//     const automationConfig = {
//       isActive: true,
//       projectId: projectId || null,
//       frequency: frequency || "Monthly",
//       amount: Number(amount) || 0,
//       autoSubmit: Boolean(autoSubmit),
//       autoCharge: Boolean(autoCharge),
//       updatedAt: new Date(),
//     };

//     const updatedClient = await prisma.client.update({
//       where: { id: clientId },
//       data: {
//         automation: automationConfig,
//         nextInvoice: nextDate,
//         mrr: frequency === "Monthly" ? Number(amount) : Number(amount) / 12,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Automation engine activated successfully",
//       client: updatedClient,
//     });
//   } catch (error) {
//     console.error("Save Automation Error:", error);
//     return res.status(500).json({ success: false, message: "Failed to save automation" });
//   }
// };

// module.exports = {
//   getAutomationOverview,
//   saveAutomation,
// };

const prisma = require("../../config/prisma");
const jwt = require("jsonwebtoken");

const getCompanyId = async (req) => {
  if (req.user?.companyId) return req.user.companyId;
  if (req.user?.company?.id) return req.user.company.id;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.decode(token);
      if (decoded) {
        const userId = decoded.id || decoded.userId || decoded._id;
        const email = decoded.email;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              ...(userId ? [{ id: userId }] : []),
              ...(email ? [{ email: email }] : []),
            ],
          },
          select: { companyId: true },
        });

        if (user?.companyId) {
          return user.companyId;
        }
      }
    } catch (err) {
      console.error("Token decode failed:", err);
    }
  }

  // 3. Fallback: Jis company ke paas latest clients hain
  const latestClient = await prisma.client.findFirst({
    orderBy: { createdAt: "desc" },
    select: { companyId: true },
  });

  return latestClient?.companyId;
};

// 1. Get All Clients for Dropdown & Active Engines Count
const getAutomationOverview = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ success: false, message: "Company not found" });
    }

    // Sirf aapki company ke real clients fetch honge
    const clients = await prisma.client.findMany({
      where: { companyId },
      include: {
        projects: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const activeEnginesCount = clients.filter(
      (c) => c.automation && c.automation.isActive === true
    ).length;

    return res.status(200).json({
      success: true,
      activeEngines: activeEnginesCount,
      clients,
    });
  } catch (error) {
    console.error("Automation Overview Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load automation data" });
  }
};

// 2. Save or Update Client Automation
const saveAutomation = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const { clientId, projectId, frequency, amount, autoSubmit, autoCharge } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, message: "Client is required" });
    }

    const now = new Date();
    let nextDate = new Date();

    switch (frequency) {
      case "Quarterly":
        nextDate.setMonth(now.getMonth() + 3);
        break;
      case "Annual":
        nextDate.setFullYear(now.getFullYear() + 1);
        break;
      case "Monthly":
      default:
        nextDate.setMonth(now.getMonth() + 1);
        break;
    }

    const automationConfig = {
      isActive: true,
      projectId: projectId || null,
      frequency: frequency || "Monthly",
      amount: Number(amount) || 0,
      autoSubmit: Boolean(autoSubmit),
      autoCharge: Boolean(autoCharge),
      updatedAt: new Date(),
    };

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        automation: automationConfig,
        nextInvoice: nextDate,
        mrr: frequency === "Monthly" ? Number(amount) : Number(amount) / 12,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Automation engine activated successfully",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Save Automation Error:", error);
    return res.status(500).json({ success: false, message: "Failed to save automation" });
  }
};

module.exports = {
  getAutomationOverview,
  saveAutomation,
};