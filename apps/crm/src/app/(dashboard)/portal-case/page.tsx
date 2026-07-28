import React from 'react';
import { prisma } from '@/lib/prisma';
import IntakeDashboard from '@/components/portal-case/IntakeDashboard';

export default async function CasePortalPage() {
  const clients = await prisma.client.findMany({
    include: {
      messages: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="p-8">
      <IntakeDashboard clients={clients} />
    </div>
  );
}
