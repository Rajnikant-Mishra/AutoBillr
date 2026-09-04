const Joi = require("joi");

const registerSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "First name is required",
      "string.min": "First name must be at least 2 characters",
      "any.required": "First name is required",
    }),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Last name is required",
      "string.min": "Last name must be at least 2 characters",
      "any.required": "Last name is required",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .max(254)
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(12)
    .max(128)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 12 characters",
      "string.max": "Password is too long",
      "any.required": "Password is required",
    }),

  companyName: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .required()
    .messages({
      "string.empty": "Company name is required",
      "string.min": "Company name must be at least 2 characters",
      "any.required": "Company name is required",
    }),

  role: Joi.string()
    .valid(
      "Owner",
      "CFO / VP Finance",
      "Controller",
      "Finance Manager",
      "Other"
    )
    .default("Owner"),

  companySize: Joi.string()
    .valid(
      "1-10",
      "11-50",
      "51-250",
      "251-1000",
      "1000+"
    )
    .default("1-10"),

    industry: Joi.string()
    .valid(
      "SaaS / Software",
      "Agency / Consulting",
      "Professional Services",
      "E-commerce",
      "Finance & Banking",
      "Healthcare",
      "Other"
    )
    .default("SaaS / Software"),

    planId: Joi.string()
    .valid("starter", "professional", "enterprise")
    .required()
    .messages({
      "string.empty": "Subscription plan is required",
      "any.only": "Invalid subscription plan",
      "any.required": "Subscription plan is required",
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});



const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .max(254)
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .required()
    .messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

module.exports = {
  registerSchema,
  loginSchema,
};