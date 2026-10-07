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
// const notificationRoutes = require("./src/routes/notificationRoutes");
// const automationRoutes = require("./src/routes/automationRoutes");
// const { initAutomationCron } = require("./src/services/automationCron");
// const analyticsRoutes = require("./src/routes/analyticsRoutes");
// const teamRoutes = require("./src/routes/teamRoutes");
// let currencyRoutes;
// try {
//   currencyRoutes = require("./src/routes/currencyRoutes");
// } catch (e) {
//   currencyRoutes = null;
// }

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
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // =====================================================
// // STATIC UPLOADS
// // =====================================================

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
// app.use("/api/v1/notifications", notificationRoutes);
// app.use("/api/v1/email-verification", emailVerificationRoutes);
// app.use("/api/v1/team", teamRoutes);
// if (currencyRoutes) {
//   app.use("/api/v1/currencies", currencyRoutes);
// } else {
//   app.get("/api/v1/currencies", (req, res) => {
//     const currencies = [
//       { code: "USD", symbol: "$", name: "US Dollar" },
//       { code: "INR", symbol: "₹", name: "Indian Rupee" },
//       { code: "EUR", symbol: "€", name: "Euro" },
//       { code: "GBP", symbol: "£", name: "British Pound" },
//       { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
//       { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
//       { code: "AUD", symbol: "AU$", name: "Australian Dollar" },
//     ];
//     return res.status(200).json({ success: true, currencies, data: currencies });
//   });
// }
// app.use("/api/v1/automation", automationRoutes);
// app.use("/api/v1/analytics", analyticsRoutes);

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
// initAutomationCron();

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




const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const clientRoutes = require("./src/routes/clientRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const invoiceRoutes = require("./src/routes/invoiceRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const emailVerificationRoutes = require("./src/routes/emailVerificationRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const automationRoutes = require("./src/routes/automationRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const teamRoutes = require("./src/routes/teamRoutes");

const { initAutomationCron } = require("./src/services/automationCron");

let currencyRoutes;

try {
  currencyRoutes = require("./src/routes/currencyRoutes");
} catch (e) {
  currencyRoutes = null;
}

const {
  initEmailVerificationSocket,
} = require("./src/websocket/emailVerificationSocket");

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://mediumseagreen-weasel-646392.hostingersite.com",
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    /*
     * Allow requests without an Origin header.
     *
     * This is useful for:
     * - Postman
     * - server-to-server requests
     * - local backend testing
     */
    if (!origin) {
      return callback(null, true);
    }

    /*
     * Allow only known frontend origins.
     */
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("CORS blocked origin:", origin);

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    );
  },

  /*
   * Required if the frontend sends credentials/cookies.
   */
  credentials: true,

  /*
   * Explicitly allow PATCH.
   */
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  /*
   * Headers used by the React frontend.
   */
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],

  /*
   * Successful response for OPTIONS preflight.
   */
  optionsSuccessStatus: 204,
};

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors(corsOptions));

/*
 * Explicitly handle CORS preflight requests.
 *
 * This is important for requests such as:
 *
 * OPTIONS /api/v1/team/roles/:id
 *
 * before the actual PATCH request.
 */
app.options(/.*/, cors(corsOptions));

/*
 * Parse JSON request bodies.
 */
app.use(
  express.json({
    limit: "10mb",
  })
);

/*
 * Parse URL-encoded request bodies.
 */
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// =====================================================
// STATIC UPLOADS
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// =====================================================
// API ROUTES
// =====================================================

/*
 * Authentication
 */
app.use(
  "/api/v1/auth",
  authRoutes
);

/*
 * Users
 */
app.use(
  "/api/v1/users",
  userRoutes
);

/*
 * Clients
 */
app.use(
  "/api/v1/clients",
  clientRoutes
);

/*
 * Projects
 */
app.use(
  "/api/v1/projects",
  projectRoutes
);

/*
 * Invoices
 */
app.use(
  "/api/v1/invoices",
  invoiceRoutes
);

/*
 * Dashboard
 */
app.use(
  "/api/v1/dashboard",
  dashboardRoutes
);

/*
 * Notifications
 */
app.use(
  "/api/v1/notifications",
  notificationRoutes
);

/*
 * Email verification
 */
app.use(
  "/api/v1/email-verification",
  emailVerificationRoutes
);

/*
 * Team & permissions
 */
app.use(
  "/api/v1/team",
  teamRoutes
);

/*
 * Currency routes
 *
 * If currencyRoutes exists, use it.
 *
 * Otherwise provide a fallback list.
 */
if (currencyRoutes) {
  app.use(
    "/api/v1/currencies",
    currencyRoutes
  );
} else {
  app.get(
    "/api/v1/currencies",
    (req, res) => {
      const currencies = [
        {
          code: "USD",
          symbol: "$",
          name: "US Dollar",
        },
        {
          code: "INR",
          symbol: "₹",
          name: "Indian Rupee",
        },
        {
          code: "EUR",
          symbol: "€",
          name: "Euro",
        },
        {
          code: "GBP",
          symbol: "£",
          name: "British Pound",
        },
        {
          code: "AED",
          symbol: "د.إ",
          name: "UAE Dirham",
        },
        {
          code: "CAD",
          symbol: "CA$",
          name: "Canadian Dollar",
        },
        {
          code: "AUD",
          symbol: "AU$",
          name: "Australian Dollar",
        },
      ];

      return res.status(200).json({
        success: true,
        currencies,
        data: currencies,
      });
    }
  );
}

/*
 * Automation
 */
app.use(
  "/api/v1/automation",
  automationRoutes
);

/*
 * Analytics
 */
app.use(
  "/api/v1/analytics",
  analyticsRoutes
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "AutoBillr backend is running",
  });
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  console.log(
    "404 ROUTE:",
    req.method,
    req.originalUrl
  );

  return res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "SERVER ERROR:",
      err
    );

    /*
     * If the error comes from the CORS
     * origin validation, return a CORS error.
     */
    if (
      err.message &&
      err.message.startsWith(
        "CORS blocked origin:"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "CORS origin not allowed",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : err.message,
    });
  }
);

// =====================================================
// HTTP SERVER
// =====================================================

const server = http.createServer(app);

// =====================================================
// WEBSOCKET
// =====================================================

initEmailVerificationSocket(server);

// =====================================================
// AUTOMATION CRON
// =====================================================

initAutomationCron();

// =====================================================
// START SERVER
// =====================================================

server.listen(PORT, () => {
  console.log(
    `AutoBillr backend running on http://localhost:${PORT}`
  );

  console.log(
    `Email verification WebSocket running on ws://localhost:${PORT}/ws/email-verification`
  );

  console.log(
    "Allowed CORS origins:",
    allowedOrigins
  );
});