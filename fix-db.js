const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany({
    include: { intakePacket: true }
  });

  for (const client of clients) {
    if (client.intakePacket?.status === 'SUBMITTED' && client.status === 'MAGIC_LINK_SENT') {
      await prisma.client.update({
        where: { id: client.id },
        data: { status: 'DOCS_SUBMITTED' }
      });
      console.log(`Updated client ${client.id} to DOCS_SUBMITTED`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
