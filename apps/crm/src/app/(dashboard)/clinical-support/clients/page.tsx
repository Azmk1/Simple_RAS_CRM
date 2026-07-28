import React from 'react';
import { prisma } from '@/lib/prisma';
import ClinicalSupportDashboard from '@/components/clinical-support/ClinicalSupportDashboard';

export const dynamic = 'force-dynamic';

export default async function ClinicalSupportClientsPage() {
  // Fetch clients that are in the 3 Clinical Support phases
  const clients = await prisma.client.findMany({
    where: {
      status: { in: ['DOCS_APPROVED_INTAKE', 'PA_APPROVED', 'ASSESSMENT_SCHEDULED'] }
    },
    include: {
      intakePacket: true,
      paRequests: true,
      messages: true
    },
    orderBy: {
      updatedAt: 'asc' // Oldest first
    }
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-wide">Clinical Support Queue</h1>
          <p className="text-zinc-400 mt-1 text-sm">Manage Document Cross-Checks, Assessment Prep, and Report Assembly.</p>
        </div>
        
        <ClinicalSupportDashboard clients={clients} />
      </div>
    </div>
  );
}
