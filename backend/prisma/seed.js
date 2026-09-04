require("dotenv").config();

const prisma = require("../config/prisma");

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 49.0,
    currency: "USD",
    interval: "month",
    description: "Up to 100 invoices/mo",
    isActive: true,
  },
  {
    id: "professional",
    name: "Professional",
    price: 199.0,
    currency: "USD",
    interval: "month",
    description: "Unlimited invoices",
    isActive: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 0.0,
    currency: "USD",
    interval: "month",
    description: "Everything + SSO + SLA",
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
        price: plan.price,
        currency: plan.currency,
        interval: plan.interval,
        description: plan.description,
        isActive: plan.isActive,
      },
      create: plan,
    });
  }

  console.log("✅ Subscription plans seeded successfully");

  const savedPlans = await prisma.plan.findMany({
    orderBy: {
      price: "asc",
    },
  });

  console.table(
    savedPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: plan.price.toString(),
      currency: plan.currency,
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