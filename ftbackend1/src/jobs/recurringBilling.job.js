import cron from "node-cron";
import RecurringBilling from "../models/RecurringBilling.model.js";
import Invoice from "../models/invoice.model.js";

export const startRecurringBillingJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      console.log("Checking recurring billings...");

      const now = new Date();

      const records = await RecurringBilling.find({
        active: true,
        nextRunDate: {
          $lte: now,
        },
      })
        .populate("client")
        .populate("project");

      for (const recurring of records) {
        console.log(
          "Creating Invoice For:",
          recurring.client?.name
        );

        // Create Invoice
        await Invoice.create({
          invoiceNumber:
            "INV-" + Date.now(),

          client: recurring.client._id,

          project: recurring.project._id,

          invoiceDate: new Date(),

          dueDate: new Date(),

          status: "Pending",

          subtotal: recurring.amount,

          total: recurring.amount,
        });

        // Calculate Next Run
        const nextDate = new Date(
          recurring.nextRunDate
        );

        if (
          recurring.frequency === "Monthly"
        ) {
          nextDate.setMonth(
            nextDate.getMonth() + 1
          );
        }

        if (
          recurring.frequency ===
          "Quarterly"
        ) {
          nextDate.setMonth(
            nextDate.getMonth() + 3
          );
        }

        if (
          recurring.frequency === "Annual"
        ) {
          nextDate.setFullYear(
            nextDate.getFullYear() + 1
          );
        }

        recurring.nextRunDate =
          nextDate;

        await recurring.save();

        console.log(
          "Next Run:",
          nextDate
        );
      }
    } catch (error) {
      console.log(error);
    }
  });
};