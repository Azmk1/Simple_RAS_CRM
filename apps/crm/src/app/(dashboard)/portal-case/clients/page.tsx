import React from 'react';
import { prisma } from '@/lib/prisma';
import IntakeQueue from '@/components/portal-case/IntakeQueue';

export default async function IntakeClientsPage() {
  const clients = await prisma.client.findMany({
    where: {
      status: {
        notIn: ['ACTIVE', 'DISCHARGED']
      }
    },
    orderBy: { updatedAt: 'asc' },
    include: {
      intakePacket: true,
      paRequests: true,
      messages: true
    }
  });

  const coordinators = await prisma.user.findMany({
    where: { role: 'CASE_COORDINATOR', isActive: true },
    select: { id: true, firstName: true, lastName: true }
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-wide">Intake Queue</h1>
          <p className="text-zinc-400 mt-1 text-sm">Manage new inquiries, track progress, and assign cases.</p>
        </div>
        
        <IntakeQueue clients={clients} coordinators={coordinators} />
      </div>
    </div>
  );
}
