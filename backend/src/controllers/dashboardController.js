// const prisma = require("../../config/prisma"); 

// const getDashboard = async (req, res) => {
//   try {
//     let companyId = req.user?.companyId || req.user?.company?.id;

//     if (!companyId) {
//       const userId = req.user?.id || req.user?.userId;
//       if (userId) {
//         const userWithCompany = await prisma.user.findUnique({
//           where: { id: userId },
//           select: { companyId: true },
//         });
//         companyId = userWithCompany?.companyId;
//       }
//     }

//     if (!companyId) {
//       const firstCompany = await prisma.company.findFirst();
//       companyId = firstCompany?.id;
//     }

//     if (!companyId) {
//       const newCompany = await prisma.company.create({
//         data: {
//           name: "My Company",
//         },
//       });
//       companyId = newCompany.id;
//     }

   
//     const [totalClients, totalInvoices, totalProjects] = await Promise.all([
//       prisma.client.count({ where: { companyId } }),
//       prisma.invoice.count({ where: { companyId } }),
//       prisma.project.count({ where: { companyId } }),
//     ]);

   
//     const allInvoices = await prisma.invoice.findMany({
//       where: { companyId },
//       include: {
//         client: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     });

   
//     let monthlyRevenue = 0;
//     let projectedRevenue = 0;
//     let overdueAmount = 0;
//     let overdueCount = 0;

//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const endOfMonth = new Date(
//       now.getFullYear(),
//       now.getMonth() + 1,
//       0,
//       23,
//       59,
//       59
//     );

//     allInvoices.forEach((invoice) => {
//       const amount = Number(invoice.total || 0);
//       const status = (invoice.status || "").toLowerCase();

//       if (
//         status === "paid" &&
//         invoice.createdAt >= startOfMonth &&
//         invoice.createdAt <= endOfMonth
//       ) {
//         monthlyRevenue += amount;
//       }

//       if (status === "pending" || status === "scheduled") {
//         projectedRevenue += amount;
//       }

//       // Overdue
//       const isOverdue =
//         status === "overdue" ||
//         (invoice.dueDate &&
//           new Date(invoice.dueDate) < now &&
//           status !== "paid");

//       if (isOverdue) {
//         overdueAmount += amount;
//         overdueCount += 1;
//       }
//     });

   
//     const upcomingBilling = allInvoices
//       .filter((inv) => inv.dueDate && new Date(inv.dueDate) >= now)
//       .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
//       .slice(0, 5)
//       .map((invoice) => ({
//         _id: invoice.id,
//         invoiceNumber: invoice.invoiceNumber,
//         clientName: invoice.client?.name || "Unknown Client",
//         dueDate: invoice.dueDate,
//         amount: Number(invoice.total || 0),
//         auto: false,
//       }));

  
//     const recentInvoices = allInvoices.slice(0, 5).map((invoice) => ({
//       _id: invoice.id,
//       invoiceNumber: invoice.invoiceNumber,
//       clientName: invoice.client?.name || "Unknown Client",
//       client: invoice.client || null,
//       date: invoice.issueDate || invoice.createdAt,
//       invoiceDate: invoice.issueDate || invoice.createdAt,
//       amount: Number(invoice.total || 0),
//       status: invoice.status,
//     }));

   
//     const revenueTrends = [];

//     for (let i = 5; i >= 0; i--) {
//       const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       const month = date.toLocaleString("en-US", { month: "short" });

//       const monthInvoices = allInvoices.filter((invoice) => {
//         const d = new Date(invoice.createdAt);
//         return (
//           d.getMonth() === date.getMonth() &&
//           d.getFullYear() === date.getFullYear()
//         );
//       });

//       let automated = 0;
//       let manual = 0;

//       monthInvoices.forEach((invoice) => {
//         const amount = Number(invoice.total || 0);
//         if ((invoice.status || "").toLowerCase() === "paid") {
//           automated += amount;
//         } else {
//           manual += amount;
//         }
//       });

//       const total = automated + manual || 1;
//       revenueTrends.push({
//         month,
//         automated: Math.round((automated / total) * 100),
//         manual: Math.round((manual / total) * 100),
//       });
//     }

   
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
//         process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// module.exports = {
//   getDashboard,
// };

const prisma = require("../../config/prisma");
const jwt = require("jsonwebtoken");

// Helper: Token se direct logged-in user ki company nikalna
const getCompanyId = async (req) => {
  // 1. Agar middleware ne req.user set kiya ho
  if (req.user?.companyId) return req.user.companyId;
  if (req.user?.company?.id) return req.user.company.id;

  // 2. Token header se decode karein (Bulletproof)
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

        if (user?.companyId) return user.companyId;
      }
    } catch (err) {
      console.error("Token decode failed:", err);
    }
  }

  // 3. Fallback: Latest client ki real companyId (Dummy pehli company nahi)
  const latestClient = await prisma.client.findFirst({
    orderBy: { createdAt: "desc" },
    select: { companyId: true },
  });

  return latestClient?.companyId;
};

const getDashboard = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company not found",
      });
    }

    // Counts for Stats
    const [totalClients, totalInvoices, totalProjects] = await Promise.all([
      prisma.client.count({ where: { companyId } }),
      prisma.invoice.count({ where: { companyId } }),
      prisma.project.count({ where: { companyId } }),
    ]);

    // Fetch invoices with client & client projects
    const allInvoices = await prisma.invoice.findMany({
      where: { companyId },
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
      },
      orderBy: { createdAt: "desc" },
    });

    let monthlyRevenue = 0;
    let projectedRevenue = 0;
    let overdueAmount = 0;
    let overdueCount = 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    allInvoices.forEach((invoice) => {
      const amount = Number(invoice.total || 0);
      const status = (invoice.status || "").toLowerCase();

      if (
        status === "paid" &&
        invoice.createdAt >= startOfMonth &&
        invoice.createdAt <= endOfMonth
      ) {
        monthlyRevenue += amount;
      }

      if (status === "pending" || status === "scheduled") {
        projectedRevenue += amount;
      }

      const isOverdue =
        status === "overdue" ||
        (invoice.dueDate &&
          new Date(invoice.dueDate) < now &&
          status !== "paid");

      if (isOverdue) {
        overdueAmount += amount;
        overdueCount += 1;
      }
    });

    const upcomingBilling = allInvoices
      .filter((inv) => inv.dueDate && new Date(inv.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
      .map((invoice) => ({
        _id: invoice.id,
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.client?.name || "Unknown Client",
        dueDate: invoice.dueDate,
        amount: Number(invoice.total || 0),
        auto: false,
      }));

    // Recent Invoices - Maps both frontend naming conventions
    const recentInvoices = allInvoices.slice(0, 5).map((invoice) => ({
      _id: invoice.id,
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.client?.name || "Unknown Client",
      client: invoice.client || null,
      projectName: invoice.client?.projects?.[0]?.title || "—",
      date: invoice.issueDate || invoice.createdAt,
      invoiceDate: invoice.issueDate || invoice.createdAt,
      amount: Number(invoice.total || 0),
      total: Number(invoice.total || 0),
      status: invoice.status,
    }));

    const revenueTrends = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleString("en-US", { month: "short" });

      const monthInvoices = allInvoices.filter((invoice) => {
        const d = new Date(invoice.createdAt);
        return (
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
        );
      });

      let automated = 0;
      let manual = 0;

      monthInvoices.forEach((invoice) => {
        const amount = Number(invoice.total || 0);
        if ((invoice.status || "").toLowerCase() === "paid") {
          automated += amount;
        } else {
          manual += amount;
        }
      });

      const total = automated + manual || 1;
      revenueTrends.push({
        month,
        automated: Math.round((automated / total) * 100),
        manual: Math.round((manual / total) * 100),
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalInvoices,
        totalClients,
        totalProjects,
        monthlyRevenue,
        projectedRevenue,
        overdueAmount,
        overdueCount,
      },
      revenueTrends,
      upcomingBilling,
      recentInvoices,
    });
  } catch (error) {
    console.error("Dashboard controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getDashboard,
};