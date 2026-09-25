const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");       // if you have it
const clientRoutes = require("./routes/clientRoutes");   // if you have it
const projectRoutes = require("./routes/projectRoutes"); // ← required

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);        // optional
app.use("/api/v1/clients", clientRoutes);    // optional
app.use("/api/v1/projects", projectRoutes);  // ← this was missing

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AutoBillr API is running",
  });
});

// 404 handler (keep this last)
app.use((req, res) => {
  console.log("404 ROUTE:", req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

module.exports = app;