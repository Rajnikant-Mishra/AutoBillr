import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import clientRoutes from "./routes/client.routes.js";
import projectRoutes from "./routes/project.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import currencyRoutes from "./routes/currency.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import recurringBillingRoutes from "./routes/recurringBilling.routes.js";
import { startRecurringBillingJob } from "./jobs/recurringBilling.job.js";
import notificationRoutes from "./routes/notification.routes.js";


dotenv.config();

const app = express();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());


app.use("/api/v1/auth", authRoutes);
app.use("/api/currencies", currencyRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/v1/shop", shopRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use(
  "/api/recurring-billing",
  recurringBillingRoutes
);
app.use("/api/dashboard", dashboardRoutes);
app.get("/", (req, res) => {
  res.send("AutoBiller API Running...");
});

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;


const startServer = async () => {
  try {
    await connectDB();

    // Start Recurring Billing Cron
    startRecurringBillingJob();

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "DB Connection Error:",
      error
    );
    process.exit(1);
  }
};

startServer();