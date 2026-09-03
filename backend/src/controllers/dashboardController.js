// const { PrismaClient } = require("@prisma/client");

// const prisma = new PrismaClient();

// const getDashboard = async (req, res) => {
//   try {
//     // Get current user if auth middleware is already attached
//     const userId = req.user?.id;

//     /*
//      * If your dashboard is user-specific, we need userId.
//      * For now, if authentication is not yet attached,
//      * this will return data from the whole database.
//      */

//     const userFilter = userId
//       ? {
//           userId: userId,
//         }
//       : {};

//     // =========================
//     // TOTAL CLIENTS
//     // =========================
//     const totalClients = await prisma.client.count({
//       where: userFilter,
//     });

//     // =========================
//     // TOTAL INVOICES
//     // =========================
//     const totalInvoices = await prisma.invoice.count({
//       where: userFilter,
//     });

//     // =========================
//     // TOTAL PROJECTS
//     // =========================
//     let totalProjects = 0;

//     try {
//       totalProjects = await prisma.project.count({
//         where: userFilter,
//       });
//     } catch (error) {
//       // Project model may not exist yet
//       totalProjects = 0;
//     }

//     // =========================
//     // INVOICES
//     // =========================
//     const invoices = await prisma.invoice.findMany({
//       where: userFilter,
//       orderBy: {
//         createdAt: "desc",
//       },
//       take: 5,
//     });

//     // =========================
//     // REVENUE CALCULATIONS
//     // =========================

//     const allInvoices = await prisma.invoice.findMany({
//       where: userFilter,
//       select: {
//         amount: true,
//         status: true,
//         dueDate: true,
//         createdAt: true,
//       },
//     });

//     let monthlyRevenue = 0;
//     let projectedRevenue = 0;
//     let overdueAmount = 0;
//     let overdueCount = 0;

//     const now = new Date();

//     const startOfMonth = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       1
//     );

//     const endOfMonth = new Date(
//       now.getFullYear(),
//       now.getMonth() + 1,
//       0,
//       23,
//       59,
//       59
//     );

//     allInvoices.forEach((invoice) => {
//       const amount = Number(invoice.amount || 0);

//       const status = invoice.status?.toLowerCase();

//       // Monthly revenue
//       if (
//         status === "paid" &&
//         invoice.createdAt >= startOfMonth &&
//         invoice.createdAt <= endOfMonth
//       ) {
//         monthlyRevenue += amount;
//       }

//       // Projected revenue
//       if (
//         status === "pending" ||
//         status === "scheduled"
//       ) {
//         projectedRevenue += amount;
//       }

//       // Overdue
//       if (
//         status === "overdue" ||
//         (
//           invoice.dueDate &&
//           new Date(invoice.dueDate) < now &&
//           status !== "paid"
//         )
//       ) {
//         overdueAmount += amount;
//         overdueCount++;
//       }
//     });

//     // =========================
//     // UPCOMING BILLING
//     // =========================

//     const upcomingInvoices = await prisma.invoice.findMany({
//       where: {
//         ...userFilter,
//         dueDate: {
//           gte: now,
//         },
//       },
//       orderBy: {
//         dueDate: "asc",
//       },
//       take: 5,
//     });

//     const upcomingBilling = upcomingInvoices.map((invoice) => ({
//       _id: invoice.id,
//       invoiceNumber: invoice.invoiceNumber,
//       clientName:
//         invoice.clientName ||
//         invoice.client?.name ||
//         "Unknown Client",
//       dueDate: invoice.dueDate,
//       amount: Number(invoice.amount || 0),
//       auto: invoice.auto || false,
//     }));

//     // =========================
//     // RECENT INVOICES
//     // =========================

//     const recentInvoices = invoices.map((invoice) => ({
//       _id: invoice.id,
//       invoiceNumber: invoice.invoiceNumber,
//       clientName:
//         invoice.clientName ||
//         invoice.client?.name ||
//         "Unknown Client",
//       client: invoice.client || null,
//       date: invoice.invoiceDate || invoice.createdAt,
//       invoiceDate: invoice.invoiceDate || invoice.createdAt,
//       amount: Number(invoice.amount || 0),
//       status: invoice.status,
//     }));

//     // =========================
//     // REVENUE TRENDS
//     // =========================

//     const revenueTrends = [];

//     for (let i = 5; i >= 0; i--) {
//       const date = new Date(
//         now.getFullYear(),
//         now.getMonth() - i,
//         1
//       );

//       const month = date.toLocaleString("en-US", {
//         month: "short",
//       });

//       const monthInvoices = allInvoices.filter((invoice) => {
//         const invoiceDate = new Date(invoice.createdAt);

//         return (
//           invoiceDate.getMonth() === date.getMonth() &&
//           invoiceDate.getFullYear() === date.getFullYear()
//         );
//       });

//       let automated = 0;
//       let manual = 0;

//       monthInvoices.forEach((invoice) => {
//         const amount = Number(invoice.amount || 0);

//         if (invoice.status?.toLowerCase() === "paid") {
//           automated += amount;
//         } else {
//           manual += amount;
//         }
//       });

//       revenueTrends.push({
//         month,
//         automated,
//         manual,
//       });
//     }

//     // =========================
//     // RESPONSE
//     // =========================

//     return res.status(200).json({
//       success: true,

//       stats: {
//         totalInvoices,
//         totalClients,
//         totalProjects,
//         monthlyRevenue,
//         projectedRevenue,
//         overdueAmount,
//         overdueCount,
//       },

//       revenueTrends,

//       upcomingBilling,

//       recentInvoices,
//     });
//   } catch (error) {
//     console.error("Dashboard controller error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch dashboard",
//       error:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : undefined,
//     });
//   }
// };

// module.exports = {
//   getDashboard,
// };
const getDashboard = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,

      stats: {
        totalInvoices: 0,
        totalClients: 0,
        totalProjects: 0,
        monthlyRevenue: 0,
        projectedRevenue: 0,
        overdueAmount: 0,
        overdueCount: 0,
      },

      revenueTrends: [],

      upcomingBilling: [],

      recentInvoices: [],
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard",
    });
  }
};

module.exports = {
  getDashboard,
};