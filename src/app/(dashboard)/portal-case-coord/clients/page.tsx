import React from 'react';
import { prisma } from '@/lib/prisma';
import CaseCoordClientsView from '@/components/portal-case-coord/CaseCoordClientsView';

export default async function CaseCoordClientsPage() {
  const allClients = await prisma.client.findMany({
    include: {
      bcba: true,
      rbt: true,
    },
    orderBy: { updatedAt: 'desc' }
  });

  const coordinators = await prisma.user.findMany({
    where: { role: 'CASE_COORDINATOR', isActive: true },
    select: { id: true, firstName: true, lastName: true }
  });

  return (
    <CaseCoordClientsView 
      coordinators={coordinators} 
      allClients={allClients} 
    />
  );
}
