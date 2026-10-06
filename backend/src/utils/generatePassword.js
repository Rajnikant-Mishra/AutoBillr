const crypto = require("crypto");

function generateRandomPassword(length = 16) {
  if (length < 4) {
    throw new Error("Password length must be at least 4.");
  }

  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*";

  const all = uppercase + lowercase + numbers + symbols;

  const password = [
    uppercase[crypto.randomInt(uppercase.length)],
    lowercase[crypto.randomInt(lowercase.length)],
    numbers[crypto.randomInt(numbers.length)],
    symbols[crypto.randomInt(symbols.length)],
  ];

  while (password.length < length) {
    password.push(all[crypto.randomInt(all.length)]);
  }

  // Securely shuffle the password
  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);

    [password[i], password[j]] = [
      password[j],
      password[i],
    ];
  }

  return password.join("");
}

module.exports = {
  generateRandomPassword,
};