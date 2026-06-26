import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Client from "../models/client.model.js";

dotenv.config();

const clients = [
  {
    initials: "AD",
    name: "Acme Dynamics Corp",
    email: "sarah@acmedynamics.com",
    billing: "Monthly",
    status: "active",
    mrr: 0,
    nextInvoice: "Pending setup",
    color: "bg-teal-100 text-teal-700",
  },
  {
    initials: "AC",
    name: "Acme Corporation",
    email: "billing@acme.com",
    billing: "Monthly",
    status: "active",
    mrr: 4200,
    nextInvoice: "Oct 24, 2024",
    color: "bg-teal-100 text-teal-700",
  },
  {
    initials: "GT",
    name: "Global Tech Solutions",
    email: "finance@globaltech.io",
    billing: "Annual",
    status: "active",
    mrr: 12400,
    nextInvoice: "Jan 12, 2025",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    initials: "UD",
    name: "Urban Design Co.",
    email: "accounts@urbandesign.com",
    billing: "Monthly",
    status: "pending",
    mrr: 1900,
    nextInvoice: "Not scheduled",
    color: "bg-amber-100 text-amber-700",
  },
  {
    initials: "HP",
    name: "Health Plus Medical",
    email: "invoice@healthplus.org",
    billing: "Annual",
    status: "active",
    mrr: 6720,
    nextInvoice: "Nov 05, 2024",
    color: "bg-teal-100 text-teal-700",
  },
  {
    initials: "MB",
    name: "Meridian Bank",
    email: "ap-team@meridian.com",
    billing: "Monthly",
    status: "active",
    mrr: 48200,
    nextInvoice: "Nov 12, 2024",
    color: "bg-rose-100 text-rose-700",
  },
  {
    initials: "CS",
    name: "Cobalt Studios",
    email: "ap@cobalt.studio",
    billing: "Monthly",
    status: "active",
    mrr: 1900,
    nextInvoice: "Nov 18, 2024",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    initials: "PH",
    name: "Pioneer Health",
    email: "acct@pioneer.org",
    billing: "Quarterly",
    status: "active",
    mrr: 6720,
    nextInvoice: "Dec 01, 2024",
    color: "bg-amber-100 text-amber-700",
  },
  {
    initials: "VA",
    name: "Vector Aerospace",
    email: "ap@vectoraero.com",
    billing: "Monthly",
    status: "inactive",
    mrr: 26500,
    nextInvoice: "Not scheduled",
    color: "bg-slate-100 text-slate-600",
  },
];

const seed = async () => {
  try {
    await connectDB();

    await Client.deleteMany();
    await Client.insertMany(clients);

    console.log("Clients inserted successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();