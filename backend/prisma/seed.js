require("dotenv").config();

const prisma = require("../config/prisma");

const plans = [
  {
    id: "starter",
    name: "Starter",

    monthlyPrice: "0.00",
    yearlyPrice: "0.00",

    currency: "INR",

    description: "Up to 10 invoices",

    trialDays: 14,
    invoiceLimit: 10,

    isActive: true,
  },

  {
    id: "professional",
    name: "Professional",

    monthlyPrice: "2599.00",
    yearlyPrice: "25990.00",

    currency: "INR",

    description: "Unlimited invoices",

    trialDays: 14,
    invoiceLimit: null,

    isActive: true,
  },

  {
    id: "enterprise",
    name: "Enterprise",

    monthlyPrice: null,
    yearlyPrice: null,

    currency: "INR",

    description: "Everything + SSO + SLA",

    trialDays: 14,
    invoiceLimit: null,

    isActive: true,
  },
];

async function main() {
  console.log("🌱 Seeding subscription plans...");

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: {
        id: plan.id,
      },

      update: {
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        currency: plan.currency,
        description: plan.description,
        trialDays: plan.trialDays,
        invoiceLimit: plan.invoiceLimit,
        isActive: plan.isActive,
      },

      create: plan,
    });
  }

  console.log("✅ Subscription plans seeded successfully");

  const savedPlans = await prisma.plan.findMany({
    orderBy: {
      id: "asc",
    },
  });

  console.table(
    savedPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,

      monthly:
        plan.monthlyPrice === null
          ? "Custom"
          : `₹${plan.monthlyPrice.toString()}`,

      yearly:
        plan.yearlyPrice === null
          ? "Custom"
          : `₹${plan.yearlyPrice.toString()}`,

      currency: plan.currency,

      trial: `${plan.trialDays} days`,

      invoices:
        plan.invoiceLimit === null
          ? "Unlimited"
          : plan.invoiceLimit,

      active: plan.isActive,
    }))
  );
}

main()
  .catch((error) => {
    console.error("❌ SEED ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });