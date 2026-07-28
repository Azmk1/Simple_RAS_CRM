import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.client.updateMany({
    where: { status: 'REPORT_ASSEMBLED' },
    data: { status: 'ASSESSMENT_SCHEDULED' }
  });
  console.log('Fixed client statuses');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
