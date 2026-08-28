const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const clientRoutes = require("./src/routes/clientRoutes");
const projectRoutes = require("./src/routes/projectRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/projects", projectRoutes);
// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AutoBillr backend is running",
  });
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  console.log("404 ROUTE:", req.method, req.originalUrl);

  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(
    `AutoBillr backend running on http://localhost:${PORT}`
  );
});