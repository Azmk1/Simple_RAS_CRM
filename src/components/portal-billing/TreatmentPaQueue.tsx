'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, Clock, FileCheck, ArrowRight, FilePlus } from 'lucide-react';
import Link from 'next/link';

export default function TreatmentPaQueue({ clients }: { clients: any[] }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  
  const pendingTxPaQueue = clients.filter(c => {
    const pa = c.paRequests?.find((p: any) => p.type === 'TREATMENT');
    if (pa) return pa.status === 'NOT_STARTED';
    
    // Only show in PA queue if parent has signed the Treatment Plan
    const hasParentSig = c.treatmentPlan && typeof c.treatmentPlan === 'object' && !!(c.treatmentPlan as any).parentSignature;
    return c.status === 'REPORT_ASSEMBLED' && hasParentSig;
  });

  const submittedQueue = clients.filter(c => {
    const pa = c.paRequests?.find((p: any) => p.type === 'TREATMENT');
    if (pa) return pa.status === 'SUBMITTED' || pa.status === 'DENIED_CLERICAL' || pa.status === 'DENIED_CLINICAL';
    return c.status === 'TX_PA_SUBMITTED';
  });

  const expiringQueue = clients.filter(c => {
    const pa = c.paRequests?.find((p: any) => p.type === 'TREATMENT');
    if (!pa || pa.status !== 'APPROVED' || !pa.expirationDate) return false;
    
    // Check if expiration is within 45 days (or past)
    const daysUntilExp = (new Date(pa.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return daysUntilExp <= 45;
  });

  const QueueCard = ({ client, title, icon: Icon, desc, mode }: { client: any, title: string, icon: any, desc: string, mode?: string }) => {
    const unreadCount = client.messages?.filter((m: any) => m.isFromClient && !m.readAt).length || 0;

    return (
      <Card className="bg-zinc-950 border border-white/5 hover:border-brand-gold-500/50 transition-colors cursor-pointer group mb-3 shadow-none">
        <Link href={`/client/${client.id}${mode ? `?mode=${mode}` : ''}`} className="block p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white group-hover:text-brand-gold-400 transition-colors flex items-center gap-2">
                  {client.firstName} {client.lastName}
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[16px] text-center leading-none shadow-sm">{unreadCount}</span>
                  )}
                </h4>
              </div>
              <p className="text-xs text-zinc-500 mt-1">{desc}</p>
              
              {(() => {
                const pa = client.paRequests?.find((p: any) => p.type === 'TREATMENT');
                if (pa?.status === 'DENIED_CLINICAL') {
                  return (
                    <div className="mt-3 inline-block bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase px-2 py-1 rounded">
                      🔴 Clinical Denial - P2P Required
                    </div>
                  );
                }
                if (pa?.status === 'DENIED_CLERICAL') {
                  return (
                    <div className="mt-3 inline-block bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase px-2 py-1 rounded">
                      🟠 Clerical Denial - Action Needed
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <Icon className="w-5 h-5 text-zinc-700 group-hover:text-brand-gold-500 transition-colors" />
          </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">
            Updated {mounted ? new Date(client.updatedAt).toLocaleDateString() : ''}
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-brand-gold-500 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
      
      {/* Column 1: Pending Submission */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-brand-orange-500/30 pb-3">
          <h2 className="font-bold text-white flex items-center">
            <FilePlus className="w-5 h-5 text-brand-orange-500 mr-2" />
            1. Submit Treatment PA
          </h2>
          <span className="bg-brand-orange-500/10 text-brand-orange-500 px-2 py-0.5 rounded-full text-xs font-bold">
            {pendingTxPaQueue.length}
          </span>
        </div>
        <div className="space-y-3">
          {pendingTxPaQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">No clients in queue</div>}
          {pendingTxPaQueue.map(c => (
            <QueueCard key={c.id} client={c} title="Submit PA" icon={FilePlus} desc="Ready to submit 97153, 97155, 97156" mode="billing" />
          ))}
        </div>
      </div>

      {/* Column 2: PA Tracking */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-brand-blue-500/30 pb-3">
          <h2 className="font-bold text-white flex items-center">
            <Clock className="w-5 h-5 text-brand-blue-500 mr-2" />
            2. PA Tracking
          </h2>
          <span className="bg-brand-blue-500/10 text-brand-blue-500 px-2 py-0.5 rounded-full text-xs font-bold">
            {submittedQueue.length}
          </span>
        </div>
        <div className="space-y-3">
          {submittedQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">No clients in queue</div>}
          {submittedQueue.map(c => (
            <QueueCard key={c.id} client={c} title="Tracking PA" icon={Clock} desc="Awaiting payer decision" mode="billing" />
          ))}
        </div>
      </div>

      {/* Column 3: Re-Authorization Needed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
          <h2 className="font-bold text-white flex items-center">
            <Clock className="w-5 h-5 text-red-500 mr-2" />
            3. Re-Authorization Needed
          </h2>
          <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-xs font-bold">
            {expiringQueue.length}
          </span>
        </div>
        <div className="space-y-3">
          {expiringQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed opacity-60">No expiring auths</div>}
          {expiringQueue.map(c => {
            const pa = c.paRequests?.find((p: any) => p.type === 'TREATMENT');
            const daysExp = pa?.expirationDate ? Math.max(0, Math.ceil((new Date(pa.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))) : 0;
            return (
              <QueueCard key={c.id} client={c} title="Expiring Soon" icon={Clock} desc={`Expires in ${daysExp} days`} mode="billing" />
            );
          })}
        </div>
      </div>

    </div>
  );
}
