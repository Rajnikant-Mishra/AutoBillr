const crypto = require("crypto");

const generateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");

  const hash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  return {
    token,
    hash,
  };
};

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

module.exports = {
  generateVerificationToken,
  hashToken,
};