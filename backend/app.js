const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Authentication routes
app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "AutoBillr API is running",
  });
});

module.exports = app;