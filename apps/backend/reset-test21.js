// Run: node reset-test21.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test21@gmail.com' }
    });

    if (!user) {
      console.log('❌ User test21@gmail.com not found');
      return;
    }

    console.log('🔍 Found user:', user.id);
    console.log('🗑️  Deleting all data...');

    // Delete in correct order
    const screenshots = await prisma.screenshot.deleteMany({ where: { userId: user.id } });
    console.log(`  ✅ Deleted ${screenshots.count} screenshots`);

    const manualRequests = await prisma.manualTimeRequest.deleteMany({ where: { userId: user.id } });
    console.log(`  ✅ Deleted ${manualRequests.count} manual time requests`);

    const timeEntries = await prisma.timeEntry.deleteMany({ where: { userId: user.id } });
    console.log(`  ✅ Deleted ${timeEntries.count} time entries`);

    const activitySamples = await prisma.activitySample.deleteMany({ where: { userId: user.id } });
    console.log(`  ✅ Deleted ${activitySamples.count} activity samples`);

    const deviceSessions = await prisma.deviceSession.deleteMany({ where: { userId: user.id } });
    console.log(`  ✅ Deleted ${deviceSessions.count} device sessions`);

    const adjustments = await prisma.adjustment.deleteMany({ where: { userId: user.id } });
    console.log(`  ✅ Deleted ${adjustments.count} adjustments`);

    const refreshTokens = await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    console.log(`  ✅ Deleted ${refreshTokens.count} refresh tokens`);

    console.log('✅ All data deleted successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetUser();
