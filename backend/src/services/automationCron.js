const cron = require("node-cron");
const prisma = require("../../config/prisma");

const initAutomationCron = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running AutoBillr Recurring Billing Cron...");

    try {
      const now = new Date();

      const clients = await prisma.client.findMany({
        where: {
          nextInvoice: { lte: now },
        },
      });

      for (const client of clients) {
        const config = client.automation;
        if (!config || !config.isActive) continue;

        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-RECUR`;
        const totalAmount = Number(config.amount) || 0;

        // Auto create invoice
        await prisma.invoice.create({
          data: {
            companyId: client.companyId,
            clientId: client.id,
            invoiceNumber,
            status: config.autoSubmit ? "pending" : "draft",
            subtotal: totalAmount,
            total: totalAmount,
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days due
            items: {
              create: [
                {
                  description: `Recurring Subscription (${config.frequency || "Monthly"})`,
                  quantity: 1,
                  unitPrice: totalAmount,
                  amount: totalAmount,
                },
              ],
            },
          },
        });

        let nextDate = new Date();
        if (config.frequency === "Quarterly") {
          nextDate.setMonth(nextDate.getMonth() + 3);
        } else if (config.frequency === "Annual") {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        } else {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }

        await prisma.client.update({
          where: { id: client.id },
          data: { nextInvoice: nextDate },
        });

        console.log(`Automated Invoice ${invoiceNumber} created for ${client.name}`);
      }
    } catch (err) {
      console.error("Error running automation cron:", err);
    }
  });
};

module.exports = { initAutomationCron };