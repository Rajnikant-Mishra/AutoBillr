<<<<<<< HEAD
// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const path = require("path");

// const authRoutes = require("./src/routes/authRoutes");
// const userRoutes = require("./src/routes/userRoutes");
// const clientRoutes = require("./src/routes/clientRoutes");
// const projectRoutes = require("./src/routes/projectRoutes");
// const invoiceRoutes = require("./src/routes/invoiceRoutes");
// const dashboardRoutes = require("./src/routes/dashboardRoutes");
// const emailVerificationRoutes = require("./src/routes/emailVerificationRoutes");
// const currencyRoutes = require("./src/routes/currencyRoutes");

// const {
//   initEmailVerificationSocket,
// } = require("./src/websocket/emailVerificationSocket");

// const app = express();

// const PORT = process.env.PORT || 5000;

// // =====================================================
// // MIDDLEWARE
// // =====================================================

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // =====================================================
// // STATIC UPLOADS
// // =====================================================

// // IMPORTANT:
// // Avatar files are stored in:
// // backend/uploads/avatars
// //
// // They will be accessible as:
// // http://localhost:5000/uploads/avatars/filename.jpg

// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "uploads"))
// );

// // =====================================================
// // API ROUTES
// // =====================================================

// app.use("/api/v1/auth", authRoutes);

// app.use("/api/v1/users", userRoutes);

// app.use("/api/v1/clients", clientRoutes);

// app.use("/api/v1/projects", projectRoutes);

// app.use("/api/v1/invoices", invoiceRoutes);

// app.use("/api/v1/dashboard", dashboardRoutes);

// app.use(
//   "/api/v1/email-verification",
//   emailVerificationRoutes
// );
// app.use(
//   "/api/v1/currencies",
//   currencyRoutes
// );
// // =====================================================
// // HEALTH CHECK
// // =====================================================

// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "AutoBillr backend is running",
//   });
// });

// // =====================================================
// // 404
// // =====================================================

// app.use((req, res) => {
//   console.log(
//     "404 ROUTE:",
//     req.method,
//     req.originalUrl
//   );

//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//     path: req.originalUrl,
//   });
// });

// // =====================================================
// // ERROR HANDLER
// // =====================================================

// app.use((err, req, res, next) => {
//   console.error("SERVER ERROR:", err);

//   res.status(500).json({
//     success: false,
//     message: "Internal server error",
//     error: err.message,
//   });
// });

// // =====================================================
// // HTTP SERVER
// // =====================================================

// const server = http.createServer(app);

// // =====================================================
// // WEBSOCKET
// // =====================================================

// initEmailVerificationSocket(server);

// // =====================================================
// // START
// // =====================================================

// server.listen(PORT, () => {
//   console.log(
//     `AutoBillr backend running on http://localhost:${PORT}`
//   );

//   console.log(
//     `Email verification WebSocket running on ws://localhost:${PORT}/ws/email-verification`
//   );
// });

=======
>>>>>>> update
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
<<<<<<< HEAD
=======

>>>>>>> update
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const clientRoutes = require("./src/routes/clientRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const invoiceRoutes = require("./src/routes/invoiceRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const emailVerificationRoutes = require("./src/routes/emailVerificationRoutes");
<<<<<<< HEAD
const {
  initEmailVerificationSocket,
} = require("./src/websocket/emailVerificationSocket");
const notificationRoutes = require("./src/routes/notificationRoutes");
=======
const currencyRoutes = require("./src/routes/currencyRoutes");

const {
  initEmailVerificationSocket,
} = require("./src/websocket/emailVerificationSocket");
>>>>>>> update

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
<<<<<<< HEAD
=======
// STATIC UPLOADS
// =====================================================

// IMPORTANT:
// Avatar files are stored in:
// backend/uploads/avatars
//
// They will be accessible as:
// http://localhost:5000/uploads/avatars/filename.jpg

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// =====================================================
>>>>>>> update
// API ROUTES
// =====================================================

app.use("/api/v1/auth", authRoutes);
<<<<<<< HEAD
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.get("/api/v1/currencies", (req, res) => {
  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
    { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "AU$", name: "Australian Dollar" },
  ];
  return res.status(200).json({ success: true, currencies, data: currencies });
});
=======

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/clients", clientRoutes);

app.use("/api/v1/projects", projectRoutes);

app.use("/api/v1/invoices", invoiceRoutes);

app.use("/api/v1/dashboard", dashboardRoutes);
>>>>>>> update

app.use(
  "/api/v1/email-verification",
  emailVerificationRoutes
);
<<<<<<< HEAD


app.use("/uploads", express.static(path.join(__dirname, "uploads")));
=======
app.use(
  "/api/v1/currencies",
  currencyRoutes
);
>>>>>>> update
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
// 404
// =====================================================

app.use((req, res) => {
  console.log(
    "404 ROUTE:",
    req.method,
    req.originalUrl
  );

  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// =====================================================
<<<<<<< HEAD
// ERROR
=======
// ERROR HANDLER
>>>>>>> update
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
// HTTP SERVER
// =====================================================
<<<<<<< HEAD
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
=======

>>>>>>> update
const server = http.createServer(app);

// =====================================================
// WEBSOCKET
// =====================================================

initEmailVerificationSocket(server);

// =====================================================
// START
// =====================================================

server.listen(PORT, () => {
  console.log(
    `AutoBillr backend running on http://localhost:${PORT}`
  );

  console.log(
    `Email verification WebSocket running on ws://localhost:${PORT}/ws/email-verification`
  );
});