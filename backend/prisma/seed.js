require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 29.00,
    currency: "USD",
    interval: "month",
    description: "For small businesses getting started",
    isActive: true,
  },
  {
    id: "professional",
    name: "Professional",
    price: 79.00,
    currency: "USD",
    interval: "month",
    description: "For growing businesses",
    isActive: true,
  },
  {
    id: "business",
    name: "Business",
    price: 149.00,
    currency: "USD",
    interval: "month",
    description: "For established businesses",
    isActive: true,
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

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

  console.log("✅ Plans seeded successfully");

  const allPlans = await prisma.plan.findMany({
    orderBy: {
      price: "asc",
    },
  });

  console.table(allPlans);
}

main()
  .catch((error) => {
    console.error("❌ SEED ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });