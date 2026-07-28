import React from 'react';
import { prisma } from '@/lib/prisma';
import ClinicalSupportDashboard from '@/components/clinical-support/ClinicalSupportDashboard';

export const dynamic = 'force-dynamic';

export default async function ClinicalSupportDashboardPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <ClinicalSupportDashboard clients={clients} />
    </div>
  );
}
