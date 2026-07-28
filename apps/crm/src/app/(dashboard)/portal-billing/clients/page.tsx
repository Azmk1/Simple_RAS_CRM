import React from 'react';
import { prisma } from '@/lib/prisma';
import BillingQueueTabs from '@/components/portal-billing/BillingQueueTabs';

export const dynamic = 'force-dynamic';

export default async function BillingClientsPage() {
  const assessmentClients = await prisma.client.findMany({
    where: { 
      status: { in: ['CLINICAL_REVIEW_APPROVED', 'VOB_COMPLETED', 'PA_SUBMITTED', 'PA_APPROVED', 'ASSESSMENT_SCHEDULED', 'REPORT_ASSEMBLED'] }
    },
    include: { paRequests: true },
    orderBy: { updatedAt: 'desc' }
  });

  const treatmentClients = await prisma.client.findMany({
    where: { 
      status: { in: ['REPORT_ASSEMBLED', 'TX_PA_SUBMITTED', 'TX_PA_APPROVED', 'ACTIVE'] }
    },
    include: { paRequests: true },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-wide">Billing & PA Queue</h1>
          <p className="text-zinc-400 mt-1 text-sm">Manage Prior Authorizations, VOBs, and track unit approvals.</p>
        </div>
        
        <BillingQueueTabs assessmentClients={assessmentClients} treatmentClients={treatmentClients} />
      </div>
    </div>
  );
}
