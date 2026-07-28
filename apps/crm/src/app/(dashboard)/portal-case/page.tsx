import React from 'react';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Link as LinkIcon, Clock, CheckCircle } from 'lucide-react';

export default async function CasePortalPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Calculate Metrics
  const totalInquiries = clients.filter(c => c.status === 'INQUIRY').length;
  const magicLinksSent = clients.filter(c => c.status === 'MAGIC_LINK_SENT').length;
  const pendingIntakeReview = clients.filter(c => c.status === 'DOCS_SUBMITTED').length;
  const approvedIntake = clients.filter(c => c.status === 'DOCS_APPROVED_INTAKE').length;

  return (
    <div className="flex flex-col h-full animate-slide-up">

      <div className="px-[30px] pt-[28px] pb-[50px]">

        <h1 className="font-heading text-[29px] font-semibold m-0 mb-[6px] text-[var(--ink-100)]">
          Intake Portal
        </h1>
        <div className="text-[var(--ink-500)] text-[13.5px] mb-[26px]">
          Add new clients, generate magic links, and collect initial data.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-[16px]">
          <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
            <div className="flex items-center justify-between mb-[22px]">
              <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--ink-500)] uppercase">New Inquiries</div>
              <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">◍</div>
            </div>
            <div className="font-heading text-[38px] font-semibold leading-none">{totalInquiries}</div>
            <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
              <div className="h-full bg-[var(--grad-horizon)]" style={{ width: '0%' }}></div>
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">{totalInquiries} in last 24h</div>
          </div>

          <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
            <div className="flex items-center justify-between mb-[22px]">
              <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--dawn-hot)] uppercase">Links Sent</div>
              <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">↗</div>
            </div>
            <div className="font-heading text-[38px] font-semibold leading-none">{magicLinksSent}</div>
            <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
              <div className="h-full bg-[var(--grad-horizon)]" style={{ width: magicLinksSent > 0 ? '16%' : '0%' }}></div>
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">{magicLinksSent} awaiting response</div>
          </div>

          <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
            <div className="flex items-center justify-between mb-[22px]">
              <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--ink-500)] uppercase">Pending Review</div>
              <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">◷</div>
            </div>
            <div className="font-heading text-[38px] font-semibold leading-none">{pendingIntakeReview}</div>
            <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
              <div className="h-full bg-[var(--grad-horizon)]" style={{ width: pendingIntakeReview > 0 ? '50%' : '0%' }}></div>
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">{pendingIntakeReview === 0 ? 'queue empty' : `${pendingIntakeReview} to review`}</div>
          </div>

          <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
            <div className="flex items-center justify-between mb-[22px]">
              <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--teal)] uppercase">Approved</div>
              <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">✓</div>
            </div>
            <div className="font-heading text-[38px] font-semibold leading-none">{approvedIntake}</div>
            <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
              <div className="h-full bg-[var(--grad-horizon)]" style={{ width: approvedIntake > 0 ? '100%' : '0%' }}></div>
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">{approvedIntake} this week</div>
          </div>
        </div>
      </div>
    </div>
  );
}
