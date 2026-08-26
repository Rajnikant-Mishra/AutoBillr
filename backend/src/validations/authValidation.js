const { z } = require("zod");

const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address")
      .max(254),

    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(128),

    companyName: z
      .string()
      .trim()
      .min(2, "Company name is required")
      .max(150),

    companySize: z.enum([
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "501-1000",
      "1000+",
    ]),

    industry: z
      .string()
      .trim()
      .min(2)
      .max(100),

    role: z.enum([
      "Owner",
      "CFO / VP Finance",
      "Controller",
      "Finance Manager",
      "Other",
    ]),

    plan: z.enum([
      "starter",
      "professional",
      "enterprise",
    ]),
  })
  .strict();

const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(),

    password: z
      .string()
      .min(1)
      .max(128),
  })
  .strict();

module.exports = {
  registerSchema,
  loginSchema,
};