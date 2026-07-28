'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, Clock, FileCheck, ArrowRight, Sparkles, Layers, ShieldAlert, Zap, CreditCard, Activity } from 'lucide-react';
import Link from 'next/link';

export default function BillingPaQueue({ clients }: { clients: any[] }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  
  const pendingVobQueue = clients.filter(c => {
    const pa = c.paRequests?.[0];
    if (pa) return !pa.vobCompleted || !pa.providerCredentialed;
    return c.status === 'CLINICAL_REVIEW_APPROVED';
  });

  const submittedQueue = clients.filter(c => {
    const pa = c.paRequests?.find((p: any) => p.type === 'ASSESSMENT') || c.paRequests?.[0];
    if (pa) return pa.vobCompleted && pa.providerCredentialed && pa.status !== 'APPROVED';
    return c.status === 'VOB_COMPLETED' || c.status === 'PA_SUBMITTED';
  });

  const expiringQueue = clients.filter(c => {
    const pa = c.paRequests?.find((p: any) => p.type === 'ASSESSMENT') || c.paRequests?.[0];
    if (!pa || pa.status !== 'APPROVED' || !pa.expirationDate) return false;
    
    const daysUntilExp = (new Date(pa.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return daysUntilExp <= 45;
  });

  const QueueCard = ({ client, title, icon: Icon, desc, mode }: { client: any, title: string, icon: any, desc: string, mode?: string }) => {
    const unreadCount = client.messages?.filter((m: any) => m.isFromClient && !m.readAt).length || 0;

    return (
      <Card className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group mb-3 shadow-xl rounded-2xl overflow-hidden hover:scale-[1.01]">
        <Link href={`/client/${client.id}${mode ? `?mode=${mode}` : ''}`} className="block p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2 text-sm">
                  {client.firstName} {client.lastName}
                  {unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full text-center leading-none shadow-md animate-pulse">
                      {unreadCount} new
                    </span>
                  )}
                </h4>
              </div>
              <p className="text-xs text-zinc-400 font-sans">{desc}</p>
              
              {(() => {
                const pa = client.paRequests?.find((p: any) => p.type === 'ASSESSMENT') || client.paRequests?.[0];
                if (pa?.status === 'DENIED_CLINICAL') {
                  return (
                    <div className="mt-3 inline-block bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full shadow-sm">
                      🔴 Clinical Denial - P2P Required
                    </div>
                  );
                }
                if (pa?.expirationDate) {
                  const days = Math.round((new Date(pa.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  return (
                    <div className={`mt-3 inline-block text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border shadow-sm ${
                      days <= 15 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      ⏳ Expires in {days} Days ({new Date(pa.expirationDate).toLocaleDateString()})
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all shrink-0 ml-2 shadow-sm">
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <div className="text-[10px] text-zinc-500 font-mono uppercase font-bold tracking-wider">
              Updated {mounted ? new Date(client.updatedAt).toLocaleDateString() : ''}
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </Card>
    );
  };

  return (
    <div className="space-y-8 mt-6 pb-12 animate-fade-in-up">
      {/* Hero Master Billing Command Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-white/10 shadow-2xl backdrop-blur-2xl group">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
              <span className="dot-live"></span>
              <span>BILLING &amp; CLAIMS COMMAND CENTER • CPT CODE ENGINE</span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white font-heading tracking-tight leading-tight">
              Medical Billing <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">&amp; VOB Queue</span>
            </h1>
            
            <p className="text-sm text-zinc-400 max-w-2xl font-sans leading-relaxed">
              Perform Verification of Benefits (VOB), check copays/deductibles, track Initial Assessment (97151) and Treatment (97153/97155) Prior Authorizations, and resolve P2P denials.
            </p>
          </div>

          {/* CPT Code Badge Snapshot */}
          <div className="grid grid-cols-3 gap-2.5 flex-shrink-0">
            <div className="p-3 bg-zinc-900/90 rounded-2xl border border-white/10 text-center font-mono">
              <span className="text-[10px] text-emerald-400 font-bold block">CPT 97151</span>
              <span className="text-xs text-zinc-300 font-bold mt-1 block">Assessment</span>
            </div>
            <div className="p-3 bg-zinc-900/90 rounded-2xl border border-white/10 text-center font-mono">
              <span className="text-[10px] text-teal-400 font-bold block">CPT 97153</span>
              <span className="text-xs text-zinc-300 font-bold mt-1 block">Direct RBT</span>
            </div>
            <div className="p-3 bg-zinc-900/90 rounded-2xl border border-white/10 text-center font-mono">
              <span className="text-[10px] text-purple-400 font-bold block">CPT 97155</span>
              <span className="text-xs text-zinc-300 font-bold mt-1 block">BCBA Supervision</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Billing Queue Stage Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Pending VOB / Credentialing */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 font-heading">
              <Clock className="w-4 h-4 text-emerald-400" /> Pending VOB / Credentialing
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {pendingVobQueue.length}
            </span>
          </div>

          <div>
            {pendingVobQueue.map(c => (
              <QueueCard
                key={c.id}
                client={c}
                title="Perform VOB"
                icon={Clock}
                desc="Verify benefits, copay, deductible, and provider credentialing."
              />
            ))}

            {pendingVobQueue.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-zinc-950/40">
                No clients currently awaiting VOB verification.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Submitted / Pending PAs */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 font-heading">
              <FileCheck className="w-4 h-4 text-teal-400" /> Submitted / Pending PAs
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              {submittedQueue.length}
            </span>
          </div>

          <div>
            {submittedQueue.map(c => (
              <QueueCard
                key={c.id}
                client={c}
                title="Check PA Status"
                icon={FileCheck}
                desc="PA request submitted to insurer. Awaiting authorization decision."
              />
            ))}

            {submittedQueue.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-zinc-950/40">
                No pending Prior Authorizations awaiting insurer response.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Expiring PAs (<45 Days) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 font-heading">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Expiring PAs (&lt;45 Days)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {expiringQueue.length}
            </span>
          </div>

          <div>
            {expiringQueue.map(c => (
              <QueueCard
                key={c.id}
                client={c}
                title="Renew PA Authorization"
                icon={ShieldAlert}
                desc="Authorization expiring soon. Re-assess units and renew PA."
              />
            ))}

            {expiringQueue.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-zinc-950/40">
                Zero authorizations currently expiring within 45 days.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
