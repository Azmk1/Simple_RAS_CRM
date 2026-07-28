'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { FileText, ArrowRight, ClipboardCheck } from 'lucide-react';
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
      <Card className="bg-zinc-950 border border-white/5 hover:border-brand-blue-500/50 transition-colors cursor-pointer group mb-3 shadow-none">
        <Link href={`/client/${client.id}${mode ? `?mode=${mode}` : ''}`} className="block p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-white group-hover:text-brand-blue-400 transition-colors flex items-center gap-2">
                {client.firstName} {client.lastName}
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[16px] text-center leading-none shadow-sm">{unreadCount}</span>
                )}
              </h4>
              <p className="text-xs text-zinc-500 mt-1">{desc}</p>
            </div>
            <Icon className="w-5 h-5 text-zinc-700 group-hover:text-brand-blue-500 transition-colors" />
          </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">
            Updated {mounted ? new Date(client.updatedAt).toLocaleDateString() : ''}
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-brand-blue-500 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: P2P Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
            <h2 className="font-bold text-red-500 flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
              1. P2P Action Required
            </h2>
            <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-xs font-bold">
              {p2pQueue.length}
            </span>
          </div>
          <div className="space-y-3">
            {p2pQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">No clinical denials</div>}
            {p2pQueue.map(c => (
              <QueueCard key={c.id} client={c} title="Overturn Denial" icon={FileText} desc="Call insurance medical director" mode="bcba" />
            ))}
          </div>
        </div>
        
        {/* Column 1: Assessment Prep */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-brand-blue-500/30 pb-3">
            <h2 className="font-bold text-white flex items-center">
              <ClipboardCheck className="w-5 h-5 text-brand-blue-500 mr-2" />
              2. Assessment Prep (Waitlist)
            </h2>
            <span className="bg-brand-blue-500/10 text-brand-blue-500 px-2 py-0.5 rounded-full text-xs font-bold">
              {prepQueue.length}
            </span>
          </div>
          <div className="space-y-3">
            {prepQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">No clients in queue</div>}
            {prepQueue.map(c => (
              <QueueCard key={c.id} client={c} title="Prep Tools" icon={ClipboardCheck} desc="Prep ABLLS/VB-MAPP while billing pends" mode="bcba" />
            ))}
          </div>
        </div>

        {/* Column 2: Treatment Planning */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
            <h2 className="font-bold text-white flex items-center">
              <FileText className="w-5 h-5 text-purple-500 mr-2" />
              3. Treatment Planning
            </h2>
            <span className="bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full text-xs font-bold">
              {txPlanQueue.length}
            </span>
          </div>
          <div className="space-y-3">
            {txPlanQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">No clients in queue</div>}
            {txPlanQueue.map(c => (
              <QueueCard key={c.id} client={c} title="Write TX Plan" icon={FileText} desc="Assessment complete. Write Tx Plan." mode="bcba" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
