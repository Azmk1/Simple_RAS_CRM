'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileCheck, Calendar, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ClinicalSupportDashboard({ clients }: { clients: any[] }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  
  const docsQueue = clients.filter(c => c.status === 'DOCS_APPROVED_INTAKE');
  const schedulingQueue = clients.filter(c => c.status === 'PA_APPROVED');
  const assemblyQueue = clients.filter(c => c.status === 'ASSESSMENT_SCHEDULED');

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
      
      {/* Column 1: Document Cross-Check */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-brand-blue-500/30 pb-3">
          <h2 className="font-bold text-white flex items-center">
            <FileCheck className="w-5 h-5 text-brand-blue-500 mr-2" />
            1. Document Cross-Check
          </h2>
          <span className="bg-brand-blue-500/10 text-brand-blue-500 px-2 py-0.5 rounded-full text-xs font-bold">
            {docsQueue.length}
          </span>
        </div>
        <div className="space-y-3">
          {docsQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">No clients in queue</div>}
          {docsQueue.map(c => (
            <QueueCard key={c.id} client={c} title="Check Documents" icon={FileCheck} desc="Cross-check eval and referral" mode="clinical" />
          ))}
        </div>
      </div>

      {/* Column 2: Assessment Scheduling */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-brand-orange-500/30 pb-3">
          <h2 className="font-bold text-white flex items-center">
            <Calendar className="w-5 h-5 text-brand-orange-500 mr-2" />
            2. Assessment Scheduling
          </h2>
          <span className="bg-brand-orange-500/10 text-brand-orange-500 px-2 py-0.5 rounded-full text-xs font-bold">
            {schedulingQueue.length}
          </span>
        </div>
        <div className="space-y-3">
          {schedulingQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">No clients in queue</div>}
          {schedulingQueue.map(c => (
            <QueueCard key={c.id} client={c} title="Schedule Assessment" icon={Calendar} desc="Auth approved. Schedule BCBA." mode="clinical" />
          ))}
        </div>
      </div>

      {/* Column 3: Report Assembly */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
          <h2 className="font-bold text-white flex items-center">
            <FileText className="w-5 h-5 text-purple-500 mr-2" />
            3. Report Assembly
          </h2>
          <span className="bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full text-xs font-bold">
            {assemblyQueue.length}
          </span>
        </div>
        <div className="space-y-3">
          {assemblyQueue.length === 0 && <div className="text-zinc-600 text-sm text-center py-8 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">No clients in queue</div>}
          {assemblyQueue.map(c => {
            const plan = c.treatmentPlan as any;
            const isCompleted = plan?.status === 'COMPLETED';
            const hasSignature = !!plan?.parentSignature;
            
            let cardTitle = "Waiting on BCBA";
            let cardDesc = "BCBA is writing Treatment Plan";
            
            if (isCompleted && !hasSignature) {
              cardTitle = "Waiting on Parent";
              cardDesc = "Plan finalized, waiting for parent signature";
            } else if (isCompleted && hasSignature) {
              cardTitle = "Assemble Report";
              cardDesc = "Compile packet & send to Auth";
            }

            return (
              <QueueCard 
                key={c.id} 
                client={c} 
                title={cardTitle} 
                icon={FileText} 
                desc={cardDesc} 
                mode="clinical" 
              />
            );
          })}
        </div>
      </div>

      </div>
    </div>
  );
}
