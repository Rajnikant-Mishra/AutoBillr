const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const clientRoutes = require("./src/routes/clientRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");

const app = express();


// =========================
// MIDDLEWARE
// =========================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// =========================
// API ROUTES
// =========================

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);


// =========================
// TEST ROUTE
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AutoBillr API is running",
  });
});


// =========================
// 404
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AutoBillr server running on port ${PORT}`);
});