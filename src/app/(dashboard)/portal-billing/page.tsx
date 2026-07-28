import React from 'react';
import { prisma } from '@/lib/prisma';
import BillingPaQueue from '@/components/portal-billing/BillingPaQueue';

export default async function BillingPortalPage() {
  const allClients = await prisma.client.findMany({ 
    include: { 
      paRequests: true,
      messages: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="p-8">
      <BillingPaQueue clients={allClients} />
    </div>
  );
}
