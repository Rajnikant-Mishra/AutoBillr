// const express = require("express");
// const cors = require("cors");

// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");       // if you have it
// const clientRoutes = require("./routes/clientRoutes");   // if you have it
// const projectRoutes = require("./routes/projectRoutes"); // ← required

// const app = express();

// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true,
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/users", userRoutes);        // optional
// app.use("/api/v1/clients", clientRoutes);    // optional
// app.use("/api/v1/projects", projectRoutes);  // ← this was missing

// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "AutoBillr API is running",
//   });
// });

// // 404 handler (keep this last)
// app.use((req, res) => {
//   console.log("404 ROUTE:", req.method, req.originalUrl);
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//     path: req.originalUrl,
//   });
// });

// module.exports = app;



const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");
const projectRoutes = require("./routes/projectRoutes");
// add the rest of your routes as needed:
// const invoiceRoutes = require("./routes/invoiceRoutes");
// const teamRoutes = require("./routes/teamRoutes");
// const dashboardRoutes = require("./routes/dashboardRoutes");
// etc.

const app = express();

/* =====================================================
   CORS – FIXED
===================================================== */
const allowedOrigins = [
  "https://mediumseagreen-weasel-646392.hostingersite.com", // production frontend
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .forEach((origin) => {
      if (!allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
      }
    });
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman / server-to-server (no Origin header)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn("CORS BLOCKED:", origin);
    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ← PATCH required
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
  ],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight

/* =====================================================
   BODY PARSERS
===================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =====================================================
   ROUTES
===================================================== */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/projects", projectRoutes);
// app.use("/api/v1/invoices", invoiceRoutes);
// app.use("/api/v1/team", teamRoutes);
// app.use("/api/v1/dashboard", dashboardRoutes);
// ... add the rest

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AutoBillr API is running",
  });
});

/* =====================================================
   404
===================================================== */
app.use((req, res) => {
  console.log("404 ROUTE:", req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

module.exports = app;