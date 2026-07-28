const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const packet = await prisma.intakePacket.findUnique({
    where: { magicLinkToken: '42c739ef-0dab-4b3e-ad0c-ca581e9b22a6' },
    include: { client: true }
  });
  console.log("Packet Status:", packet.status);
  console.log("Client Status:", packet.client.status);
  console.log("Rejections:", packet.rejectionDetails);
}
main().catch(console.error).finally(() => prisma.$disconnect());
