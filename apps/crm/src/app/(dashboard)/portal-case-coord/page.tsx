import React from 'react';
import { prisma } from '@/lib/prisma';
import CaseCoordDashboard from '@/components/portal-case-coord/CaseCoordDashboard';

export default async function CaseCoordPortalPage() {
  const allClients = await prisma.client.findMany({
    include: {
      bcba: true,
      rbt: true,
    }
  });

  const coordinators = await prisma.user.findMany({
    where: { role: 'CASE_COORDINATOR', isActive: true },
    select: { id: true, firstName: true, lastName: true }
  });

  return (
    <CaseCoordDashboard 
      coordinators={coordinators} 
      allClients={allClients} 
    />
  );
}
