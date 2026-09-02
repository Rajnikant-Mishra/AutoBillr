const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const clientRoutes = require("./src/routes/clientRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes"); 
const invoiceRoutes = require("./src/routes/invoiceRoutes");
const currencyRoutes = require("./src/routes/currencyRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;



app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/dashboard", dashboardRoutes); 
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/currencies", currencyRoutes);
app.use("/api/v1/notifications", notificationRoutes);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AutoBillr backend is running",
  });
});



app.use((req, res) => {
  console.log("404 ROUTE:", req.method, req.originalUrl);

  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});



app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});



app.listen(PORT, () => {
  console.log(
    `AutoBillr backend running on http://localhost:${PORT}`
  );
});