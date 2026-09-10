const prisma = require("../../config/prisma"); // same path used by clients/invoices/projects

const getDashboard = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "No company associated with the authenticated user",
      });
    }

    // =========================
    // COUNTS
    // =========================
    const [totalClients, totalInvoices, totalProjects] = await Promise.all([
      prisma.client.count({ where: { companyId } }),
      prisma.invoice.count({ where: { companyId } }),
      prisma.project.count({ where: { companyId } }),
    ]);

    // =========================
    // ALL INVOICES (for calculations + recent list)
    // =========================
    const allInvoices = await prisma.invoice.findMany({
      where: { companyId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // =========================
    // REVENUE CALCULATIONS
    // =========================
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

      // Monthly revenue = paid invoices created this month
      if (
        status === "paid" &&
        invoice.createdAt >= startOfMonth &&
        invoice.createdAt <= endOfMonth
      ) {
        monthlyRevenue += amount;
      }

      // Projected = pending + scheduled
      if (status === "pending" || status === "scheduled") {
        projectedRevenue += amount;
      }

      // Overdue
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

    // =========================
    // UPCOMING BILLING (next 5 due invoices)
    // =========================
    const upcomingBilling = allInvoices
      .filter((inv) => inv.dueDate && new Date(inv.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
      .map((invoice) => ({
        _id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.client?.name || "Unknown Client",
        dueDate: invoice.dueDate,
        amount: Number(invoice.total || 0),
        auto: false, // you don't have an `auto` field yet
      }));

    // =========================
    // RECENT INVOICES (last 5)
    // =========================
    const recentInvoices = allInvoices.slice(0, 5).map((invoice) => ({
      _id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.client?.name || "Unknown Client",
      client: invoice.client || null,
      date: invoice.issueDate || invoice.createdAt,
      invoiceDate: invoice.issueDate || invoice.createdAt,
      amount: Number(invoice.total || 0),
      status: invoice.status,
    }));

    // =========================
    // REVENUE TRENDS (last 6 months)
    // =========================
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

      let automated = 0; // paid
      let manual = 0;    // everything else

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

    // =========================
    // RESPONSE
    // =========================
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