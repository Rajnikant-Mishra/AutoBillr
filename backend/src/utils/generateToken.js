const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is missing from environment variables"
    );
  }

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

module.exports = generateToken;