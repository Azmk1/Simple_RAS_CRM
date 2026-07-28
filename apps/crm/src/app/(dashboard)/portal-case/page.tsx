import React from 'react';
import { prisma } from '@/lib/prisma';
import IntakeQueue from '@/components/portal-case/IntakeQueue';

export default async function CasePortalPage() {
  const clients = await prisma.client.findMany({
    include: {
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
