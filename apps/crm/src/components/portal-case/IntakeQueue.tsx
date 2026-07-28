'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { UserPlus, Mail, FileCheck, ArrowRight, Loader2, UserCheck, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { generateMagicLink } from '@/app/(dashboard)/portal-case/actions';
import { Button } from '@/components/ui/Button';

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

  const QueueCard = ({ client, title, icon: Icon, desc, action, badge }: { client: any, title: string, icon: any, desc: string, action?: React.ReactNode, badge?: string }) => {
    const unreadCount = client.messages?.filter((m: any) => m.isFromClient && !m.readAt).length || 0;
    
    return (
      <Card className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 hover:border-brand-orange-500/50 transition-all duration-300 cursor-pointer group mb-3 shadow-xl rounded-2xl overflow-hidden hover:scale-[1.01]">
        <Link href={`/client/${client.id}`} className="block p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="font-bold text-white group-hover:text-brand-orange-400 transition-colors flex items-center gap-2 text-sm">
                {client.firstName} {client.lastName}
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full text-center leading-none shadow-md animate-pulse">
                    {unreadCount} new
                  </span>
                )}
              </h4>
              <p className="text-xs text-zinc-400 font-sans">{desc}</p>
              {badge && (
                <div className="mt-2 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-brand-orange-500/10 text-brand-orange-400 border border-brand-orange-500/20 inline-block uppercase tracking-wider">
                  {badge}
                </div>
              )}
            </div>
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-brand-orange-400 group-hover:border-brand-orange-500/30 transition-all shrink-0 ml-2 shadow-sm">
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <div className="text-[10px] text-zinc-500 font-mono uppercase font-bold tracking-wider">
              Updated {mounted ? new Date(client.updatedAt).toLocaleDateString() : ''}
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-brand-orange-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        {action && (
          <div className="p-3 bg-zinc-900/90 border-t border-white/5" onClick={e => e.stopPropagation()}>
            {action}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Intake Operational Queue</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Manage intake stages, deliver magic links, and verify client packets</p>
        </div>
        <Link href="/portal-case">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs px-3.5 h-9 rounded-xl border border-white/10 transition-all cursor-pointer">
            ← Back to Intake Dashboard
          </Button>
        </Link>
      </div>

      {/* 4 Pipeline Stage Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stage 1: New Inquiries */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 font-heading">
              <UserPlus className="w-4 h-4 text-brand-orange-400" /> New Inquiries
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-orange-500/10 text-brand-orange-400 border border-brand-orange-500/20">
              {inquiryQueue.length}
            </span>
          </div>

          <div>
            {inquiryQueue.map(c => (
              <QueueCard
                key={c.id}
                client={c}
                title="Send Onboarding Magic Link"
                icon={Mail}
                desc="New client lead added. Magic link needed."
                badge="Inquiry Lead"
                action={
                  <Button 
                    disabled={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        await generateMagicLink(c.id);
                      });
                    }}
                    className="w-full bg-gradient-to-r from-brand-orange-500 to-orange-600 hover:from-brand-orange-600 hover:to-orange-700 text-white font-bold text-xs h-9 rounded-xl shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    <span>Send Parent Magic Link</span>
                  </Button>
                }
              />
            ))}

            {inquiryQueue.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-zinc-950/40">
                No new client inquiries pending.
              </div>
            )}
          </div>
        </div>

        {/* Stage 2: Parent Magic Links Sent */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 font-heading">
              <Mail className="w-4 h-4 text-amber-400" /> Parent Magic Link Sent
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {waitingQueue.length}
            </span>
          </div>

          <div>
            {waitingQueue.map(c => (
              <QueueCard
                key={c.id}
                client={c}
                title="Awaiting Parent Completion"
                icon={Mail}
                desc="Magic link delivered to parent email."
                badge="Portal Active"
              />
            ))}

            {waitingQueue.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-zinc-950/40">
                No magic links awaiting parent submission.
              </div>
            )}
          </div>
        </div>

        {/* Stage 3: Documents Submitted for Review */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 font-heading">
              <FileCheck className="w-4 h-4 text-rose-400" /> Docs Submitted for Review
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {reviewQueue.length}
            </span>
          </div>

          <div>
            {reviewQueue.map(c => (
              <QueueCard
                key={c.id}
                client={c}
                title="Review Documents"
                icon={FileCheck}
                desc="Parent completed packet. Verify docs."
                badge="Action Needed"
              />
            ))}

            {reviewQueue.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-zinc-950/40">
                No client packets awaiting document review.
              </div>
            )}
          </div>
        </div>

        {/* Stage 4: In Progress (VOB / Assessment / PA) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 font-heading">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Handed Off to Billing
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {inProgressQueue.length}
            </span>
          </div>

          <div>
            {inProgressQueue.map(c => (
              <QueueCard
                key={c.id}
                client={c}
                title="In Progress"
                icon={ShieldCheck}
                desc={`Current Status: ${c.status}`}
                badge="Billing Active"
              />
            ))}

            {inProgressQueue.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-zinc-950/40">
                No clients currently in active billing handoff.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
