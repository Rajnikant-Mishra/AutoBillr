const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");

// =====================================================
// ROUTES
// =====================================================

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

const {
  initEmailVerificationSocket,
} = require("./src/websocket/emailVerificationSocket");

// Currency routes are optional
let currencyRoutes;

try {
  currencyRoutes = require("./src/routes/currencyRoutes");
} catch (error) {
  console.warn(
    "Currency routes could not be loaded. Using fallback currency endpoint."
  );

  currencyRoutes = null;
}

// =====================================================
// APP
// =====================================================

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// CORS CONFIGURATION
// =====================================================

/*
|--------------------------------------------------------------------------
| Allowed Frontend Origins
|--------------------------------------------------------------------------
|
| Production:
| https://mediumseagreen-weasel-646392.hostingersite.com
|
| Local development:
| http://localhost:5173
|
| You can also provide additional origins through:
|
| FRONTEND_URL=https://mediumseagreen-weasel-646392.hostingersite.com
|
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  "https://mediumseagreen-weasel-646392.hostingersite.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

// Add FRONTEND_URL from environment if it exists
if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  envOrigins.forEach((origin) => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

console.log("========================================");
console.log("CORS CONFIGURATION");
console.log("Allowed origins:");
console.log(allowedOrigins);
console.log("========================================");

const corsOptions = {
  origin: function (origin, callback) {
    /*
     * Allow requests without Origin.
     *
     * This is useful for:
     * - Postman
     * - server-to-server requests
     * - health checks
     */

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn("CORS BLOCKED ORIGIN:", origin);

    return callback(
      new Error(`CORS not allowed for origin: ${origin}`)
    );
  },

  credentials: true,

  /*
   * IMPORTANT:
   * PATCH must be explicitly allowed.
   */
  methods: [
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  /*
   * Headers sent by the frontend.
   */
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
  ],

  exposedHeaders: [
    "Content-Length",
    "Content-Type",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};

// =====================================================
// CORS MIDDLEWARE
// =====================================================

/*
|--------------------------------------------------------------------------
| IMPORTANT
|--------------------------------------------------------------------------
|
| CORS must be registered BEFORE:
|
| - express.json()
| - routes
| - authentication middleware
| - 404 handler
|
|--------------------------------------------------------------------------
*/

app.use(cors(corsOptions));

/*
 * Explicitly handle OPTIONS preflight requests.
 *
 * This is especially important for:
 *
 * PATCH
 * DELETE
 * Authorization header
 * Content-Type: application/json
 *
 */
app.options(/.*/, cors(corsOptions));

// =====================================================
// BODY PARSING
// =====================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

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
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/auth",
  authRoutes
);

/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/users",
  userRoutes
);

/*
|--------------------------------------------------------------------------
| CLIENTS
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/clients",
  clientRoutes
);

/*
|--------------------------------------------------------------------------
| PROJECTS
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/projects",
  projectRoutes
);

/*
|--------------------------------------------------------------------------
| INVOICES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/invoices",
  invoiceRoutes
);

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/dashboard",
  dashboardRoutes
);

/*
|--------------------------------------------------------------------------
| NOTIFICATIONS
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/notifications",
  notificationRoutes
);

/*
|--------------------------------------------------------------------------
| EMAIL VERIFICATION
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/email-verification",
  emailVerificationRoutes
);

/*
|--------------------------------------------------------------------------
| TEAM
|--------------------------------------------------------------------------
|
| Includes:
|
| GET    /api/v1/team
| GET    /api/v1/team/me
| GET    /api/v1/team/roles
| POST   /api/v1/team/roles
| PATCH  /api/v1/team/roles/:id
| DELETE /api/v1/team/roles/:id
| PATCH  /api/v1/team/:id/permissions
| PATCH  /api/v1/team/:id/role
| DELETE /api/v1/team/:id
|
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/team",
  teamRoutes
);

/*
|--------------------------------------------------------------------------
| CURRENCIES
|--------------------------------------------------------------------------
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
|--------------------------------------------------------------------------
| AUTOMATION
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/automation",
  automationRoutes
);

/*
|--------------------------------------------------------------------------
| ANALYTICS
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/analytics",
  analyticsRoutes
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AutoBillr backend is running",
    environment:
      process.env.NODE_ENV || "development",
  });
});

// =====================================================
// CORS TEST ENDPOINT
// =====================================================

/*
|--------------------------------------------------------------------------
| Temporary/Useful CORS diagnostic endpoint
|--------------------------------------------------------------------------
|
| Open:
|
| https://moccasin-oryx-880509.hostingersite.com/api/v1/cors-test
|
|--------------------------------------------------------------------------
*/

app.get(
  "/api/v1/cors-test",
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "CORS is working",
      origin:
        req.headers.origin || null,
      method: req.method,
    });
  }
);

// =====================================================
// 404 HANDLER
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
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "========================================"
    );

    console.error("SERVER ERROR:");
    console.error(err);

    console.error(
      "========================================"
    );

    /*
     * Handle CORS errors explicitly.
     */
    if (
      err.message &&
      err.message.startsWith("CORS not allowed")
    ) {
      return res.status(403).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(
      err.statusCode || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal server error",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : err.stack,
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

try {
  initEmailVerificationSocket(server);

  console.log(
    "Email verification WebSocket initialized."
  );
} catch (error) {
  console.error(
    "Failed to initialize email verification WebSocket:",
    error
  );
}

try {
  initAutomationCron();

  console.log(
    "Automation cron initialized."
  );
} catch (error) {
  console.error(
    "Failed to initialize automation cron:",
    error
  );
}

// =====================================================
// START SERVER
// =====================================================

server.listen(PORT, () => {
  console.log(
    "========================================"
  );

  console.log(
    `AutoBillr backend running on port ${PORT}`
  );

  console.log(
    `Environment: ${
      process.env.NODE_ENV || "development"
    }`
  );

  console.log(
    `Frontend URL: ${
      process.env.FRONTEND_URL || "Not configured"
    }`
  );

  console.log(
    `Email verification WebSocket: ws://localhost:${PORT}/ws/email-verification`
  );

  console.log(
    "========================================"
  );
});