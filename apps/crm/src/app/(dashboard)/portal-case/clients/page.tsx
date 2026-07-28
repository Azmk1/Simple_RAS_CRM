import React from 'react';
import { prisma } from '@/lib/prisma';
import IntakeQueue from '@/components/portal-case/IntakeQueue';

export default async function IntakeClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      intakePacket: true,
      paRequests: true,
      messages: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  const coordinators = await prisma.user.findMany({
    where: { role: 'CASE_COORDINATOR', isActive: true },
    select: { id: true, firstName: true, lastName: true }
  });

  return (
    <div className="p-8">
      <IntakeQueue clients={clients} coordinators={coordinators} />
    </div>
  );
}
