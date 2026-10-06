const prisma = require("../config/prisma");

async function main() {
  console.log("========================================");
  console.log("FIX PRODUCTION TEAM MEMBER ROLE");
  console.log("========================================");

  console.log("Checking TeamMember.roleId...");

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "TeamMember"
    ADD COLUMN IF NOT EXISTS "roleId" TEXT;
  `);

  console.log("✅ TeamMember.roleId column checked/added.");

  console.log("Checking foreign key...");

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'TeamMember_roleId_fkey'
      ) THEN
        ALTER TABLE "TeamMember"
        ADD CONSTRAINT "TeamMember_roleId_fkey"
        FOREIGN KEY ("roleId")
        REFERENCES "Role"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
      END IF;
    END
    $$;
  `);

  console.log("✅ TeamMember.roleId foreign key checked/added.");

  const result = await prisma.$queryRawUnsafe(`
    SELECT
      column_name,
      data_type
    FROM information_schema.columns
    WHERE table_name = 'TeamMember'
      AND column_name = 'roleId';
  `);

  console.log("Verification:", result);

  console.log("========================================");
  console.log("TEAM MEMBER DATABASE FIX COMPLETE");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("❌ TEAM MEMBER DATABASE FIX FAILED:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });