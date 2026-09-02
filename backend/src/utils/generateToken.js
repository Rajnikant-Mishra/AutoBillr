const jwt = require("jsonwebtoken");
const JWT_SECRET = "GOAU7sTpPlGNrm/oKhVMXUser0SbsfXolZ+g5QtJsyo4g2VYLHq/U+UYfzQVpAuj";

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

module.exports = generateToken;