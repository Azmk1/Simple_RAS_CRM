'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { UserPlus, Mail, FileCheck, ArrowRight, Loader2, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { generateMagicLink } from '@/app/(dashboard)/portal-case/actions';
import { Button } from '@/components/ui/Button';

import { assignCaseCoordinator } from '@/app/(dashboard)/portal-case/actions';

export default function IntakeQueue({ clients, coordinators }: { clients: any[], coordinators?: any[] }) {
  const [mounted, setMounted] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  React.useEffect(() => setMounted(true), []);
  
  const inquiryQueue = clients.filter(c => c.status === 'INQUIRY');
  const waitingQueue = clients.filter(c => c.status === 'MAGIC_LINK_SENT');
  const reviewQueue = clients.filter(c => c.status === 'DOCS_SUBMITTED');
  const inProgressQueue = clients.filter(c => [
    'DOCS_APPROVED_INTAKE', 
    'CLINICAL_REVIEW_APPROVED', 
    'VOB_COMPLETED', 
    'PA_SUBMITTED', 
    'PA_APPROVED', 
    'ASSESSMENT_SCHEDULED', 
    'REPORT_ASSEMBLED', 
    'TX_PA_SUBMITTED', 
    'TX_PA_APPROVED'
  ].includes(c.status));
  const readyQueue = clients.filter(c => c.status === 'STAFFING_PENDING' && !c.caseCoordinatorId);

  const QueueCard = ({ client, title, icon: Icon, desc, action, badge }: { client: any, title: string, icon: any, desc: string, action?: React.ReactNode, badge?: string }) => {
    const unreadCount = client.messages?.filter((m: any) => m.isFromClient && !m.readAt).length || 0;
    
    return (
      <Card className="bg-zinc-950 border border-white/5 hover:border-brand-gold-500/50 transition-colors cursor-pointer group mb-3 shadow-none">
        <Link href={`/client/${client.id}`} className="block p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-white group-hover:text-brand-gold-400 transition-colors flex items-center gap-2">
                {client.firstName} {client.lastName}
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[16px] text-center leading-none shadow-sm">{unreadCount}</span>
                )}
              </h4>
              <p className="text-xs text-zinc-500 mt-1">{desc}</p>
              {badge && (
                <div className="mt-2 text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/10 inline-block uppercase tracking-wider">
                  {badge}
                </div>
              )}
            </div>
            <Icon className="w-5 h-5 text-zinc-700 group-hover:text-brand-gold-500 transition-colors shrink-0 ml-2" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">
              Updated {mounted ? new Date(client.updatedAt).toLocaleDateString() : ''}
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-brand-gold-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        {action && (
          <div className="px-4 pb-4">
            {action}
          </div>
        )}
      </Card>
    );
  };

  const getInProgressBadge = (status: string) => {
    switch (status) {
      case 'DOCS_APPROVED_INTAKE': return 'At Clinical Review';
      case 'CLINICAL_REVIEW_APPROVED': return 'Waiting on VOB';
      case 'VOB_COMPLETED': return 'Preparing Initial PA';
      case 'PA_SUBMITTED': return 'Initial PA Pending';
      case 'PA_APPROVED': return 'Ready for Assessment';
      case 'ASSESSMENT_SCHEDULED': return 'Assessment Ongoing';
      case 'REPORT_ASSEMBLED': return 'Report Under Review';
      case 'TX_PA_SUBMITTED': return 'Auth PA Pending';
      case 'TX_PA_APPROVED': return 'Awaiting Parent Schedule';
      case 'STAFFING_PENDING': return 'Final Staffing Approval';
      default: return 'Processing';
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
      
      {/* Column 1: New Inquiries */}
      <div className="w-[320px] shrink-0 snap-start space-y-4">
        <div className="flex items-center justify-between border-b border-brand-gold-500/30 pb-3">
          <h2 className="font-bold text-white flex items-center">
            <UserPlus className="w-5 h-5 text-brand-gold-500 mr-2" />
            1. New Inquiries
          </h2>
          <span className="bg-brand-gold-500/10 text-brand-gold-500 px-2 py-0.5 rounded-full text-xs font-bold">
            {inquiryQueue.length}
          </span>
        </div>
        <div className="space-y-3">
          {inquiryQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">Empty</div>}
          {inquiryQueue.map(c => (
            <QueueCard 
              key={c.id} 
              client={c} 
              title="Send Intake Packet" 
              icon={UserPlus} 
              desc="Needs magic link sent to parent." 
              action={
                <form action={generateMagicLink}>
                  <input type="hidden" name="clientId" value={c.id} />
                  <Button type="submit" size="sm" className="w-full h-8 text-xs bg-brand-gold-600 hover:bg-brand-gold-700 text-black font-semibold">
                    Send Magic Link
                  </Button>
                </form>
              }
            />
          ))}
        </div>
      </div>

      {/* Column 2: Waiting on Client */}
      <div className="w-[320px] shrink-0 snap-start space-y-4">
        <div className="flex items-center justify-between border-b border-blue-500/30 pb-3">
          <h2 className="font-bold text-white flex items-center">
            <Mail className="w-5 h-5 text-blue-500 mr-2" />
            2. Waiting on Client
          </h2>
          <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full text-xs font-bold">
            {waitingQueue.length}
          </span>
        </div>
        <div className="space-y-3">
          {waitingQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">Empty</div>}
          {waitingQueue.map(c => (
            <QueueCard 
              key={c.id} 
              client={c} 
              title="Awaiting Forms" 
              icon={Mail} 
              desc="Magic link sent. Waiting for submission." 
              action={
                <form action={generateMagicLink}>
                  <input type="hidden" name="clientId" value={c.id} />
                  <Button type="submit" variant="outline" size="sm" className="w-full h-8 text-xs border-white/10 hover:bg-white/5 text-zinc-300">
                    Resend Link
                  </Button>
                </form>
              }
            />
          ))}
        </div>
      </div>

      {/* Column 3: Needs Review */}
      <div className="w-[320px] shrink-0 snap-start space-y-4">
        <div className="flex items-center justify-between border-b border-green-500/30 pb-3">
          <h2 className="font-bold text-white flex items-center">
            <FileCheck className="w-5 h-5 text-green-500 mr-2" />
            3. Needs Review
          </h2>
          <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-xs font-bold">
            {reviewQueue.length}
          </span>
        </div>
        <div className="space-y-3">
          {reviewQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">Empty</div>}
          {reviewQueue.map(c => (
            <QueueCard 
              key={c.id} 
              client={c} 
              title="Review Documents" 
              icon={FileCheck} 
              desc="Forms submitted. Review and approve." 
              action={
                <Link href={`/client/${c.id}?tab=intake`} className="block">
                  <Button size="sm" className="w-full h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold">
                    Review Packet
                  </Button>
                </Link>
              }
            />
          ))}
        </div>
      </div>

      {/* Column 4: In Progress */}
      <div className="w-[320px] shrink-0 snap-start space-y-4">
        <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
          <h2 className="font-bold text-white flex items-center">
            <Loader2 className="w-5 h-5 text-purple-500 mr-2 animate-spin-slow" />
            4. In Progress
          </h2>
          <span className="bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full text-xs font-bold">
            {inProgressQueue.length}
          </span>
        </div>
        <div className="space-y-3">
          {inProgressQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">Empty</div>}
          {inProgressQueue.map(c => (
            <QueueCard 
              key={c.id} 
              client={c} 
              title="Track Status" 
              icon={Loader2} 
              desc="Being processed by Clinical or Auth team." 
              badge={getInProgressBadge(c.status)}
            />
          ))}
        </div>
      </div>

      {/* Column 5: Ready to be Assigned */}
      <div className="w-[320px] shrink-0 snap-start space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
          <h2 className="font-bold text-white flex items-center">
            <UserCheck className="w-5 h-5 text-cyan-500 mr-2" />
            5. Ready to Assign
          </h2>
          <span className="bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded-full text-xs font-bold">
            {readyQueue.length}
          </span>
        </div>
        <div className="space-y-3">
          {readyQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">Empty</div>}
          {readyQueue.map(c => (
            <QueueCard 
              key={c.id} 
              client={c} 
              title="Assign Team" 
              icon={UserCheck} 
              desc={c.bcbaId && c.rbtId ? "HR Assigned. Needs Coordinator to activate." : "Waiting on HR for BCBA/RBT."} 
              action={
                <Link href={`/client/${c.id}?tab=assignments`} className="block">
                  <Button size="sm" className="w-full h-8 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-semibold">
                    Open Assignments
                  </Button>
                </Link>
              }
            />
          ))}
        </div>
      </div>

    </div>
  );
}
