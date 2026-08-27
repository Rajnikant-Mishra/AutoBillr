// controllers/dashboard.controller.js

import Invoice from "../models/invoice.model.js";
import Client from "../models/client.model.js";
import { Project } from "../models/project.model.js";
import RecurringBilling from "../models/recurringBilling.model.js";

export const getDashboard = async (req, res) => {
  try {
    const [
  invoices,
  clients,
  projects,
  recurringBillings,
] = await Promise.all([
  Invoice.find()
    .populate("client")
    .sort({ createdAt: -1 }),

  Client.find(),

  Project.find(),

  RecurringBilling.find()
    .populate("client", "name initials")
    .populate("project", "title"),
]);

    const totalInvoices = invoices.length;

    const paidInvoices = invoices.filter(
      (i) => i.status === "Paid"
    );

    const overdueInvoices = invoices.filter(
      (i) => i.status === "Overdue"
    );

    const monthlyRevenue = paidInvoices.reduce(
      (sum, inv) => sum + (inv.total || 0),
      0
    );

    const overdueAmount = overdueInvoices.reduce(
      (sum, inv) => sum + (inv.total || 0),
      0
    );

    const projectedRevenue =
      monthlyRevenue + monthlyRevenue * 0.13;

    const recentInvoices = invoices
  .slice(0, 10)
  .map((invoice) => ({
    _id: invoice._id,
    invoiceNumber: invoice.invoiceNumber,

    client: {
      _id: invoice.client?._id,
      name:
        invoice.client?.companyName ||
        invoice.client?.name ||
        "Unknown",
      initials:
        invoice.client?.initials || "NA",
    },

    date: invoice.invoiceDate,
    amount: invoice.total,
    status: invoice.status,
  }));

    const upcomingBilling = recurringBillings
  .slice(0, 5)
  .map((item) => ({
    _id: item._id,
    clientName:
      item.client?.name ||
      "Unknown Client",
    initials:
      item.client?.initials || "NA",
    amount: item.amount,
    auto: item.autoCharge,
    dueDate: item.nextRunDate,
    frequency: item.frequency,
    project:
      item.project?.title || "",
  }));

    const revenueTrends = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
    ].map((month) => ({
      month,
      automated: Math.floor(
        Math.random() * 40 + 60
      ),
      manual: Math.floor(
        Math.random() * 30 + 30
      ),
    }));

    res.json({
      stats: {
        totalInvoices,
        totalClients: clients.length,
        totalProjects: projects.length,
        monthlyRevenue,
        projectedRevenue,
        overdueAmount,
        overdueCount: overdueInvoices.length,
      },

      revenueTrends,

      upcomingBilling,

      recentInvoices,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};