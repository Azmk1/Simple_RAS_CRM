import React from 'react';
import { prisma } from '@/lib/prisma';

export default async function BillingPortalPage() {
  const allClients = await prisma.client.findMany({ include: { paRequests: true } });

  // Calculate Metrics
  const pendingVob = allClients.filter(c => c.status === 'CLINICAL_REVIEW_APPROVED').length;
  const submittedPas = allClients.filter(c => c.status === 'PA_SUBMITTED').length;
  const approvedPas = allClients.filter(c => c.status === 'PA_APPROVED').length;
  
  // Total Auth Units logic (just a simple reduction for the dashboard)
  const totalApprovedUnits = allClients.reduce((acc, client) => {
    const pa = client.paRequests?.find(p => p.status === 'APPROVED');
    return acc + (pa?.approvedUnits || 0);
  }, 0);

  return (
    <div className="flex flex-col h-full animate-slide-up">
      <div className="px-[30px] pt-[28px] pb-[50px]">
        <h1 className="font-heading text-[29px] font-semibold m-0 mb-[6px] text-[var(--ink-100)]">
          Billing Portal
        </h1>
        <div className="text-[var(--ink-500)] text-[13.5px] mb-[26px]">
          Process Prior Authorizations, manage VOBs, and track unit approvals.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-[16px]">
          <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
            <div className="flex items-center justify-between mb-[22px]">
              <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--ink-500)] uppercase">Pending VOB</div>
              <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">◍</div>
            </div>
            <div className="font-heading text-[38px] font-semibold leading-none">{pendingVob}</div>
            <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
              <div className="h-full bg-[var(--grad-horizon)]" style={{ width: pendingVob > 0 ? '50%' : '0%' }}></div>
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">{pendingVob} to verify</div>
          </div>

          <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
            <div className="flex items-center justify-between mb-[22px]">
              <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--dawn-hot)] uppercase">PAs Submitted</div>
              <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">↗</div>
            </div>
            <div className="font-heading text-[38px] font-semibold leading-none">{submittedPas}</div>
            <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
              <div className="h-full bg-[var(--grad-horizon)]" style={{ width: submittedPas > 0 ? '30%' : '0%' }}></div>
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">{submittedPas} waiting on payer</div>
          </div>

          <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
            <div className="flex items-center justify-between mb-[22px]">
              <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--teal)] uppercase">PAs Approved</div>
              <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">✓</div>
            </div>
            <div className="font-heading text-[38px] font-semibold leading-none">{approvedPas}</div>
            <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
              <div className="h-full bg-[var(--grad-horizon)]" style={{ width: approvedPas > 0 ? '100%' : '0%' }}></div>
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">{approvedPas} ready for scheduling</div>
          </div>

          <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
            <div className="flex items-center justify-between mb-[22px]">
              <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-purple-400 uppercase">Total Units</div>
              <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">◷</div>
            </div>
            <div className="font-heading text-[38px] font-semibold leading-none">{totalApprovedUnits}</div>
            <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
              <div className="h-full bg-[var(--grad-horizon)]" style={{ width: totalApprovedUnits > 0 ? '100%' : '0%' }}></div>
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">Active auth units</div>
          </div>
        </div>
      </div>
    </div>
  );
}
