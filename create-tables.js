const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function createTables() {
    try {
        console.log('Creating ReadingProgress table...');

        // Create ReadingProgress table
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`ReadingProgress\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`bookId\` VARCHAR(191) NOT NULL,
        \`currentPage\` INTEGER NOT NULL,
        \`totalPages\` INTEGER NOT NULL,
        \`progressPercent\` DOUBLE NOT NULL,
        \`lastReadAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`isCompleted\` BOOLEAN NOT NULL DEFAULT false,
        \`completedAt\` DATETIME(3) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`ReadingProgress_userId_bookId_key\`(\`userId\`, \`bookId\`),
        INDEX \`ReadingProgress_userId_idx\`(\`userId\`),
        INDEX \`ReadingProgress_lastReadAt_idx\`(\`lastReadAt\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

        console.log('ReadingProgress table created successfully!');

        console.log('Creating ReadingStreak table...');

        // Create ReadingStreak table
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`ReadingStreak\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`date\` DATETIME(3) NOT NULL,
        \`pagesRead\` INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`ReadingStreak_userId_date_key\`(\`userId\`, \`date\`),
        INDEX \`ReadingStreak_userId_date_idx\`(\`userId\`, \`date\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

        console.log('ReadingStreak table created successfully!');

        console.log('Adding foreign key constraints...');

        // Add foreign keys for ReadingProgress
        try {
            await prisma.$executeRawUnsafe(`
        ALTER TABLE \`ReadingProgress\` 
        ADD CONSTRAINT \`ReadingProgress_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      `);
        } catch (e) {
            console.log('Foreign key ReadingProgress_userId_fkey may already exist, skipping...');
        }

        try {
            await prisma.$executeRawUnsafe(`
        ALTER TABLE \`ReadingProgress\` 
        ADD CONSTRAINT \`ReadingProgress_bookId_fkey\` FOREIGN KEY (\`bookId\`) REFERENCES \`Books\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      `);
        } catch (e) {
            console.log('Foreign key ReadingProgress_bookId_fkey may already exist, skipping...');
        }

        // Add foreign key for ReadingStreak
        try {
            await prisma.$executeRawUnsafe(`
        ALTER TABLE \`ReadingStreak\` 
        ADD CONSTRAINT \`ReadingStreak_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      `);
        } catch (e) {
            console.log('Foreign key ReadingStreak_userId_fkey may already exist, skipping...');
        }

        console.log('✅ All tables created successfully!');
        console.log('✅ Migration complete!');

    } catch (error) {
        console.error('Error creating tables:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createTables();
