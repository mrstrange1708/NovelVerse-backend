const { PrismaClient } = require("../generated/prisma");

// Singleton pattern for Prisma Client
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error", "warn"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  // In development, use a global variable to prevent multiple instances during hot reload
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "error", "warn"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  prisma = global.prisma;
}

// Handle connection errors gracefully
prisma.$connect().catch((err) => {
  console.error("Failed to connect to database:", err);
});

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
