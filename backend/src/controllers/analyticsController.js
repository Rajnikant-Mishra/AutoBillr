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

        if (user?.companyId) return user.companyId;
      }
    } catch (err) {
      console.error("Token decode failed:", err);
    }
  }

  const latestClient = await prisma.client.findFirst({
    orderBy: { createdAt: "desc" },
    select: { companyId: true },
  });

  return latestClient?.companyId;
};

const getAnalyticsData = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ success: false, message: "Company not found" });
    }

    const [invoices, clients] = await Promise.all([
      prisma.invoice.findMany({
        where: { companyId },
        include: {
          client: { select: { id: true, name: true } },
        },
        orderBy: { issueDate: "asc" },
      }),
      prisma.client.findMany({
        where: { companyId },
        select: { id: true, name: true, mrr: true },
      }),
    ]);

    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    const now = new Date();

    const clientRevenueMap = {};

    invoices.forEach((inv) => {
      const amt = Number(inv.total) || 0;
      totalInvoiced += amt;

      const status = (inv.status || "").toLowerCase();

      if (status === "paid") {
        totalCollected += amt;
      } else {
        totalPending += amt;
        if (inv.dueDate && new Date(inv.dueDate) < now) {
          totalOverdue += amt;
        }
      }

      const cName = inv.client?.name || "Other";
      clientRevenueMap[cName] = (clientRevenueMap[cName] || 0) + amt;
    });

    const collectionRate =
      totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

    const revenueByClient = Object.keys(clientRevenueMap).map((name) => ({
      name,
      amount: clientRevenueMap[name],
      percentage:
        totalInvoiced > 0
          ? Math.round((clientRevenueMap[name] / totalInvoiced) * 100)
          : 0,
    }));

    const agingReport = {
      current: 0, // 0 - 30 days
      thirtyToSixty: 0, // 31 - 60 days
      sixtyPlus: 0, // 61+ days
    };

    invoices
      .filter((inv) => (inv.status || "").toLowerCase() !== "paid")
      .forEach((inv) => {
        const amt = Number(inv.total) || 0;
        const diffDays = Math.floor(
          (now - new Date(inv.dueDate || inv.issueDate)) / (1000 * 60 * 60 * 24)
        );

        if (diffDays <= 30) {
          agingReport.current += amt;
        } else if (diffDays <= 60) {
          agingReport.thirtyToSixty += amt;
        } else {
          agingReport.sixtyPlus += amt;
        }
      });

    const totalMRR = clients.reduce((acc, c) => acc + (Number(c.mrr) || 0), 0);

    return res.status(200).json({
      success: true,
      stats: {
        totalInvoiced,
        totalCollected,
        totalPending,
        totalOverdue,
        collectionRate,
        totalMRR,
        totalInvoicesCount: invoices.length,
        totalClientsCount: clients.length,
      },
      revenueByClient,
      agingReport,
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load analytics data" });
  }
};

module.exports = { getAnalyticsData };