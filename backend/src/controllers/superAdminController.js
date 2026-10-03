const prisma = require("../../config/prisma");

const getPlatformStats = async (req, res) => {
  try {
    const [totalCompanies, totalUsers, totalInvoices, invoiceAggregates] =
      await Promise.all([
        prisma.company.count(),
        prisma.user.count(),
        prisma.invoice.count(),
        prisma.invoice.aggregate({
          _sum: {
            totalAmount: true,
          },
        }),
      ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalCompanies,
        totalUsers,
        totalInvoices,
        totalVolume: invoiceAggregates._sum.totalAmount || 0,
      },
    });
  } catch (error) {
    console.error("Superadmin Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch platform metrics",
    });
  }
};


const getAllCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        industry: true,
        companySize: true,
        createdAt: true,
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        _count: {
          select: {
            invoices: true,
            clients: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    console.error("Superadmin Companies Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies list",
    });
  }
};

module.exports = {
  getPlatformStats,
  getAllCompanies,
};