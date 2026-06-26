import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Currency from "../models/currency.model.js";

dotenv.config();

await connectDB();
 const currencies = [
  { code: "INR", flag: "🇮🇳", name: "Indian Rupee", symbol: "₹", rate: 1, isSelected: true },
  { code: "USD", flag: "🇺🇸", name: "US Dollar", symbol: "$", rate: 0.01199 },
  { code: "EUR", flag: "🇪🇺", name: "Euro", symbol: "€", rate: 0.01108 },
  { code: "GBP", flag: "🇬🇧", name: "British Pound", symbol: "£", rate: 0.00946 },
  { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar", symbol: "C$", rate: 0.01648 },
  { code: "AUD", flag: "🇦🇺", name: "Australian Dollar", symbol: "A$", rate: 0.01801 },
  { code: "JPY", flag: "🇯🇵", name: "Japanese Yen", symbol: "¥", rate: 1.88 },
  { code: "SGD", flag: "🇸🇬", name: "Singapore Dollar", symbol: "S$", rate: 0.01616 }
];

await Currency.deleteMany({});
await Currency.insertMany(currencies);

console.log("Currencies Seeded Successfully");

process.exit();