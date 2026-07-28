import React from 'react';
import { prisma } from '@/lib/prisma';
import HrStaffingQueue from '@/components/portal-hr/HrStaffingQueue';
import { UserPlus } from 'lucide-react';

export default async function HrClientsPage() {
  const staffingClients = await prisma.client.findMany({
    where: { status: 'STAFFING_PENDING' },
    orderBy: { updatedAt: 'desc' }
  });

  const allBcbas = await prisma.user.findMany({
    where: { role: 'BCBA', isActive: true },
    select: { id: true, firstName: true, lastName: true }
  });

  const allRbts = await prisma.user.findMany({
    where: { role: 'RBT', isActive: true },
    select: { id: true, firstName: true, lastName: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-black-800 p-6 rounded-xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-brand-orange-500" />
            HR Staffing Queue & Assignments
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Assign BCBA supervisors and RBT Candidates to incoming clients.
          </p>
        </div>
      </div>

      <HrStaffingQueue 
        clients={staffingClients} 
        bcbas={allBcbas} 
        rbts={allRbts} 
      />
    </div>
  );
}
