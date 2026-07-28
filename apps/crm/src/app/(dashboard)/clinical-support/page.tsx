import React from 'react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ClinicalSupportDashboardPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Calculate Metrics
  const docsCrossCheck = clients.filter(c => c.status === 'DOCS_APPROVED_INTAKE').length;
  const assessmentScheduling = clients.filter(c => c.status === 'PA_APPROVED').length;
  const reportAssembly = clients.filter(c => c.status === 'ASSESSMENT_SCHEDULED').length;
  const completedReports = clients.filter(c => c.status === 'REPORT_ASSEMBLED' || c.status === 'ACTIVE').length;

  return (
    <div className="flex flex-col h-full animate-slide-up">
      <div className="px-[30px] pt-[28px] pb-[50px]">
        <h1 className="font-heading text-[29px] font-semibold m-0 mb-[6px] text-[var(--ink-100)]">
          Clinical Support Dashboard
        </h1>
        <div className="text-[var(--ink-500)] text-[13.5px] mb-[26px]">
          Metrics and statistics for assessment logistics and report assembly.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-[16px]">
          <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
            <div className="flex items-center justify-between mb-[22px]">
              <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--ink-500)] uppercase">Docs to Check</div>
              <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">◍</div>
            </div>
            <div className="font-heading text-[38px] font-semibold leading-none">{docsCrossCheck}</div>
            <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
              <div className="h-full bg-[var(--grad-horizon)]" style={{ width: docsCrossCheck > 0 ? '25%' : '0%' }}></div>
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">{docsCrossCheck} waiting</div>
          </div>

          <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
            <div className="flex items-center justify-between mb-[22px]">
              <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--dawn-hot)] uppercase">To Schedule</div>
              <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">📅</div>
            </div>
            <div className="font-heading text-[38px] font-semibold leading-none">{assessmentScheduling}</div>
            <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
              <div className="h-full bg-[var(--grad-horizon)]" style={{ width: assessmentScheduling > 0 ? '25%' : '0%' }}></div>
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">{assessmentScheduling} waiting</div>
          </div>

          <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
            <div className="flex items-center justify-between mb-[22px]">
              <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--ink-500)] uppercase">To Assemble</div>
              <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">📑</div>
            </div>
            <div className="font-heading text-[38px] font-semibold leading-none">{reportAssembly}</div>
            <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
              <div className="h-full bg-[var(--grad-horizon)]" style={{ width: reportAssembly > 0 ? '50%' : '0%' }}></div>
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">{reportAssembly} waiting</div>
          </div>

          <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
            <div className="flex items-center justify-between mb-[22px]">
              <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--teal)] uppercase">Routed</div>
              <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">✓</div>
            </div>
            <div className="font-heading text-[38px] font-semibold leading-none">{completedReports}</div>
            <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
              <div className="h-full bg-[var(--grad-horizon)]" style={{ width: completedReports > 0 ? '100%' : '0%' }}></div>
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">{completedReports} total reports</div>
          </div>
        </div>
      </div>
    </div>
  );
}
