'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { FileText, ArrowRight, ClipboardCheck, Sparkles, Layers, ShieldAlert, Zap, Stethoscope, Activity } from 'lucide-react';
import Link from 'next/link';

export default function BcbaDashboard({ clients }: { clients: any[] }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  
  // BCBA Queue Logic
  const p2pQueue = clients.filter(c => c.paRequests?.some((pa: any) => pa.status === 'DENIED_CLINICAL' && !pa.p2pResolved));
  const prepQueue = clients.filter(c => ['PA_SUBMITTED', 'PA_APPROVED'].includes(c.status) && !p2pQueue.includes(c));
  const txPlanQueue = clients.filter(c => c.status === 'ASSESSMENT_SCHEDULED' && !p2pQueue.includes(c));

  const QueueCard = ({ client, title, icon: Icon, desc, mode }: { client: any, title: string, icon: any, desc: string, mode?: string }) => {
    const unreadCount = client.messages?.filter((m: any) => m.isFromClient && !m.readAt).length || 0;

    return (
      <Card className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group mb-3 shadow-xl rounded-2xl overflow-hidden hover:scale-[1.01]">
        <Link href={`/client/${client.id}${mode ? `?mode=${mode}` : ''}`} className="block p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm">
                {client.firstName} {client.lastName}
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full text-center leading-none shadow-md animate-pulse">
                    {unreadCount} new
                  </span>
                )}
              </h4>
              <p className="text-xs text-zinc-400 font-sans">{desc}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all shrink-0 ml-2 shadow-sm">
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <div className="text-[10px] text-zinc-500 font-mono uppercase font-bold tracking-wider">
              Updated {mounted ? new Date(client.updatedAt).toLocaleDateString() : ''}
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </Card>
    );
  };

  return (
    <div className="space-y-8 mt-6 pb-12 animate-fade-in-up">
      {/* Hero Master BCBA Command Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-white/10 shadow-2xl backdrop-blur-2xl group">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[11px] font-bold">
              <span className="dot-live"></span>
              <span>BCBA CLINICAL SUITE • TREATMENT PLAN GENERATOR ACTIVE</span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white font-heading tracking-tight leading-tight">
              BCBA Clinical Suite <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-brand-orange-300">&amp; Assessment Hub</span>
            </h1>
            
            <p className="text-sm text-zinc-400 max-w-2xl font-sans leading-relaxed">
              Conduct clinical assessments, build automated PDF Treatment Plans, resolve P2P authorization denial alerts, and oversee RBT clinical progress.
            </p>
          </div>

          {/* BCBA Snapshot Pills */}
          <div className="grid grid-cols-3 gap-2.5 flex-shrink-0 font-mono">
            <div className="p-3 bg-zinc-900/90 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-rose-400 font-bold block">P2P ALERTS</span>
              <span className="text-lg font-black text-white mt-0.5 block">{p2pQueue.length}</span>
            </div>
            <div className="p-3 bg-zinc-900/90 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-amber-400 font-bold block">PREP QUEUE</span>
              <span className="text-lg font-black text-white mt-0.5 block">{prepQueue.length}</span>
            </div>
            <div className="p-3 bg-zinc-900/90 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-cyan-400 font-bold block">TX PLANS</span>
              <span className="text-lg font-black text-white mt-0.5 block">{txPlanQueue.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 BCBA Queue Stage Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Column 1: P2P Action Required */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1 border-b border-rose-500/20 pb-3">
            <h3 className="font-bold text-rose-400 text-sm flex items-center gap-2 font-heading">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" /> 1. P2P Action Required
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {p2pQueue.length}
            </span>
          </div>

          <div>
            {p2pQueue.map(c => (
              <QueueCard
                key={c.id}
                client={c}
                title="P2P Meeting Needed"
                icon={ShieldAlert}
                desc="Insurer requested BCBA Peer-to-Peer review conference call."
                mode="p2p"
              />
            ))}

            {p2pQueue.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-zinc-950/40">
                Zero clinical P2P authorization alerts active.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Assessment Prep */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1 border-b border-amber-500/20 pb-3">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 font-heading">
              <ClipboardCheck className="w-4 h-4 text-amber-400" /> 2. Assessment Prep Queue
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {prepQueue.length}
            </span>
          </div>

          <div>
            {prepQueue.map(c => (
              <QueueCard
                key={c.id}
                client={c}
                title="Prepare Assessment"
                icon={ClipboardCheck}
                desc="VOB verified. Prepare initial evaluation &amp; assessment date."
                mode="assessment_prep"
              />
            ))}

            {prepQueue.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-zinc-950/40">
                No clients currently in assessment preparation.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Treatment Plan Builder */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1 border-b border-cyan-500/20 pb-3">
            <h3 className="font-bold text-cyan-400 text-sm flex items-center gap-2 font-heading">
              <FileText className="w-4 h-4 text-cyan-400" /> 3. Treatment Plan Builder
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {txPlanQueue.length}
            </span>
          </div>

          <div>
            {txPlanQueue.map(c => (
              <QueueCard
                key={c.id}
                client={c}
                title="Build Treatment Plan PDF"
                icon={FileText}
                desc="Assessment complete. Assemble treatment plan &amp; submit to Billing."
                mode="treatment_plan"
              />
            ))}

            {txPlanQueue.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-zinc-950/40">
                No treatment plans currently undergoing report assembly.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
