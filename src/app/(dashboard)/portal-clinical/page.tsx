import React from 'react';
import { prisma } from '@/lib/prisma';
import BcbaDashboard from '@/components/portal-clinical/BcbaDashboard';

export default async function ClinicalPortalPage() {
  const allClients = await prisma.client.findMany({
    include: {
      paRequests: true,
      messages: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="p-8">
      <BcbaDashboard clients={allClients} />
    </div>
  );
}
