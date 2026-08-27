import mongoose from "mongoose";
import dotenv from "dotenv";
import {Project} from "../models/project.model.js";

dotenv.config();

const projects = [
  {
    title: "Q4 Marketing Campaign",
    client: "Acme Dynamics",
    dueDate: new Date("2024-12-15"),
    budget: 86500,
    billed: 64200,
    progress: 74,
    status: "ACTIVE",
    members: 8,
    icon: "folder",
    milestones: [
      {
        title: "Discovery & Strategy",
        dueDate: new Date("2024-09-10"),
        amount: 12500,
        status: "paid",
      },
      {
        title: "Creative Production",
        dueDate: new Date("2024-10-15"),
        amount: 26800,
        status: "paid",
      },
      {
        title: "Campaign Launch",
        dueDate: new Date("2024-11-22"),
        amount: 24900,
        status: "pending",
      },
      {
        title: "Performance & Optimization",
        dueDate: new Date("2024-12-15"),
        amount: 22300,
        status: "scheduled",
      },
    ],
  },

  {
    title: "Brand Identity Refresh",
    client: "Stellar Designs",
    dueDate: new Date("2024-11-30"),
    budget: 32000,
    billed: 18400,
    progress: 58,
    status: "ACTIVE",
    members: 4,
    icon: "palette",
    milestones: [],
  },

  {
    title: "Website Overhaul",
    client: "Cobalt Studios",
    dueDate: new Date("2024-10-18"),
    budget: 124000,
    billed: 124000,
    progress: 100,
    status: "PAID",
    members: 12,
    icon: "web",
    milestones: [],
  },

  {
    title: "Mobile App Redesign",
    client: "Nova Labs",
    dueDate: new Date("2025-01-15"),
    budget: 95000,
    billed: 42000,
    progress: 45,
    status: "ACTIVE",
    members: 6,
    icon: "smartphone",
    milestones: [],
  },

  {
    title: "CRM Migration",
    client: "Apex Partners",
    dueDate: new Date("2024-12-01"),
    budget: 54000,
    billed: 31000,
    progress: 62,
    status: "ACTIVE",
    members: 5,
    icon: "database",
    milestones: [],
  },

  {
    title: "SEO Optimization",
    client: "Cloud Labs",
    dueDate: new Date("2024-11-10"),
    budget: 28000,
    billed: 17000,
    progress: 70,
    status: "AT_RISK",
    members: 3,
    icon: "trending_up",
    milestones: [],
  },
];

const seedProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas Connected");

   await Project.deleteMany({});
await Project.insertMany(projects);

    console.log("Projects Inserted Successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProjects();