const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

async function fixStreaks() {
  console.log("🔍 Checking reading streaks...");

  try {
    // Get all streaks with raw query to see actual data
    const streaks = await prisma.$queryRaw`
      SELECT id, userId, date, createdAt 
      FROM ReadingStreak 
      ORDER BY userId, date
    `;

    console.log(`Total streaks: ${streaks.length}`);

    if (streaks.length > 0) {
      console.log("Sample data:", streaks.slice(0, 3));
    }

    // Try to find duplicates by converting dates to strings
    const dateMap = new Map();
    const duplicates = [];

    for (const streak of streaks) {
      const dateStr = streak.date.toISOString().split("T")[0];
      const key = `${streak.userId}-${dateStr}`;

      if (dateMap.has(key)) {
        duplicates.push({ existing: dateMap.get(key), duplicate: streak });
      } else {
        dateMap.set(key, streak);
      }
    }

    console.log(`Found ${duplicates.length} duplicates by date comparison`);

    if (duplicates.length > 0) {
      console.log("Removing duplicates...");

      for (const dup of duplicates) {
        console.log(`Deleting duplicate: ${dup.duplicate.id}`);
        await prisma.$executeRaw`DELETE FROM ReadingStreak WHERE id = ${dup.duplicate.id}`;
      }

      console.log("✅ Duplicates removed!");
    } else {
      console.log("✅ No duplicates found!");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStreaks();
