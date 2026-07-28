'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Users, 
  FileText, 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw,
  TrendingUp,
  Layers,
  Sparkles,
  Zap,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import OpsAuditReportCompiler from './OpsAuditReportCompiler';
import { getOpsDepartmentMetrics } from '@/app/(dashboard)/ops/actions';
import Link from 'next/link';

export default function OpsDashboardClient({ agedSessions, atRiskAuths }: any) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOpsDepartmentMetrics().then(res => {
      if (res.success) {
        setMetrics(res.metrics);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 mt-6 pb-12">
      {/* Hero Master Operations Command Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-white/10 shadow-2xl backdrop-blur-2xl group">
        {/* Ambient Radial Background Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange-500/10 border border-brand-orange-500/20 text-brand-orange-400 font-mono text-[11px] font-bold">
              <span className="dot-live"></span>
              <span>OPERATIONS COMMAND CENTER • REAL-TIME DEPT SYNC</span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white font-heading tracking-tight leading-tight">
              Master Operations <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-400 via-amber-300 to-teal-300">&amp; Executive Supervision</span>
            </h1>
            
            <p className="text-sm text-zinc-400 max-w-2xl font-sans leading-relaxed">
              Real-time throughput monitoring across Intake, Billing, Clinical, and Case Coordination. Supervise departmental SLAs, clear operational bottlenecks, and generate executive audit reports.
            </p>
          </div>

          {/* KPI Snapshot Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-shrink-0">
            <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-white/10 backdrop-blur-md shadow-sm">
              <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase block">TOTAL CLIENTS</span>
              <p className="text-xl font-black text-white font-mono mt-1">{metrics?.totalClients || 0}</p>
            </div>
            <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-white/10 backdrop-blur-md shadow-sm">
              <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block">ACTIVE CASELOAD</span>
              <p className="text-xl font-black text-emerald-400 font-mono mt-1">{metrics?.activeClientsCount || 0}</p>
            </div>
            <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-white/10 backdrop-blur-md shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[10px] text-teal-400 font-mono font-bold uppercase block">SLA HEALTH INDEX</span>
              <p className="text-xl font-black text-teal-400 font-mono mt-1">98.4%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Department Bottleneck & SLA Supervision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Intake Department */}
        <Card className="relative overflow-hidden bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:border-brand-orange-500/50 hover:shadow-[0_0_30px_rgba(255,122,69,0.15)] group cursor-pointer">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-orange-500/10 border border-brand-orange-500/20 flex items-center justify-center text-brand-orange-400 font-bold text-xs">
                  01
                </div>
                <span className="text-xs font-mono font-bold text-brand-orange-400 uppercase tracking-wider">INTAKE DEPT</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-brand-orange-500/10 text-brand-orange-400 border border-brand-orange-500/20">
                {metrics?.intakePendingDocs || 0} PENDING
              </span>
            </div>

            <div>
              <h3 className="text-3xl font-black text-white font-mono tracking-tight">{metrics?.intakePendingDocs || 0}</h3>
              <p className="text-xs text-zinc-400 mt-1">Unprocessed Intake Packets (&gt;48 hrs)</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Review SLA Rate</span>
                <span className="text-white font-bold">96.2%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-orange-500 h-full w-[96%] rounded-full"></div>
              </div>
            </div>

            <Link href="/portal-case" className="pt-2 text-xs font-bold text-brand-orange-400 hover:text-white flex items-center justify-between group-hover:translate-x-1 transition-transform">
              <span>Supervise Intake Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        {/* 2. Billing Department */}
        <Card className="relative overflow-hidden bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] group cursor-pointer">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  02
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">BILLING DEPT</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {metrics?.billingExpiringPas || 0} EXPIRING PAs
              </span>
            </div>

            <div>
              <h3 className="text-3xl font-black text-white font-mono tracking-tight">{metrics?.billingPendingVob || 0}</h3>
              <p className="text-xs text-zinc-400 mt-1">Pending VOBs &amp; PA Renewals</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-500">VOB Turnaround SLA</span>
                <span className="text-white font-bold">98.1%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98%] rounded-full"></div>
              </div>
            </div>

            <Link href="/portal-billing" className="pt-2 text-xs font-bold text-emerald-400 hover:text-white flex items-center justify-between group-hover:translate-x-1 transition-transform">
              <span>Supervise Billing Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        {/* 3. Clinical Department */}
        <Card className="relative overflow-hidden bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group cursor-pointer">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                  03
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">CLINICAL DEPT</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {metrics?.clinicalPendingReports || 0} OVERDUE
              </span>
            </div>

            <div>
              <h3 className="text-3xl font-black text-white font-mono tracking-tight">{metrics?.clinicalPendingReports || 0}</h3>
              <p className="text-xs text-zinc-400 mt-1">Pending BCBA Assessment Reports</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-500">BCBA Assembly SLA</span>
                <span className="text-white font-bold">94.8%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full w-[95%] rounded-full"></div>
              </div>
            </div>

            <Link href="/portal-clinical" className="pt-2 text-xs font-bold text-cyan-400 hover:text-white flex items-center justify-between group-hover:translate-x-1 transition-transform">
              <span>Supervise BCBA Suite</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        {/* 4. Case Coordination */}
        <Card className="relative overflow-hidden bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] group cursor-pointer">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                  04
                </div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">CASE COORD</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {metrics?.caseCoordActionItems || 0} TICKETS
              </span>
            </div>

            <div>
              <h3 className="text-3xl font-black text-white font-mono tracking-tight">{metrics?.activeClientsCount || 0}</h3>
              <p className="text-xs text-zinc-400 mt-1">Active Client Caseload Monitoring</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Ticket Resolution Rate</span>
                <span className="text-white font-bold">99.1%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[99%] rounded-full"></div>
              </div>
            </div>

            <Link href="/portal-case-coord" className="pt-2 text-xs font-bold text-purple-400 hover:text-white flex items-center justify-between group-hover:translate-x-1 transition-transform">
              <span>Supervise Case Coordination</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Executive Multi-Portal Audit Report Compiler */}
      <OpsAuditReportCompiler metrics={metrics} />

      {/* Aged Session Notes & Prior Auth Expiration Risk Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Aged Session Notes Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white font-heading tracking-wide">
                Aged Unconverted Session Notes
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              HIGH PRIORITY
            </span>
          </div>

          <div className="space-y-3">
            {agedSessions?.map((note: any) => {
              const ageInDays = Math.floor((new Date().getTime() - new Date(note.createdAt).getTime()) / (1000 * 3600 * 24));
              
              return (
                <div key={note.id} className="p-4 bg-zinc-950/80 backdrop-blur-xl rounded-2xl border border-rose-500/20 hover:border-rose-500/50 transition-all space-y-3 shadow-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold text-rose-400 text-xs">
                        {note.session.client.firstName[0]}{note.session.client.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{note.session.client.firstName} {note.session.client.lastName}</p>
                        <p className="text-xs text-zinc-400 font-mono">Session Date: {new Date(note.session.scheduledStart).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {ageInDays} Days Old
                    </span>
                  </div>
                  
                  <div className="p-3 bg-zinc-900/90 rounded-xl border border-white/5 text-xs text-zinc-300 space-y-1 font-sans">
                    <p className="font-semibold text-white text-[11px] uppercase tracking-wider font-mono">Missing Signatures / Flags:</p>
                    {!note.rbtSigned && <p className="text-rose-400 flex items-center gap-1">• Missing RBT Signature</p>}
                    {!note.parentSigned && <p className="text-rose-400 flex items-center gap-1">• Missing Parent Signature</p>}
                    {!note.bcbaSigned && <p className="text-rose-400 flex items-center gap-1">• Missing BCBA Signature</p>}
                  </div>
                </div>
              );
            })}

            {(!agedSessions || agedSessions.length === 0) && (
              <div className="p-10 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-zinc-950/50">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400/50 mb-2" />
                <p className="font-semibold text-white">Pipeline 100% Clean</p>
                <p className="text-zinc-500 mt-0.5">Zero aged unconverted session notes flagged in system.</p>
              </div>
            )}
          </div>
        </div>

        {/* Prior Auth Expiration Risk Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white font-heading tracking-wide">
                Prior Authorization Expiration Risk
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              RENEWAL MONITOR
            </span>
          </div>

          <div className="space-y-3">
            {atRiskAuths?.map((auth: any) => (
              <div key={auth.id} className="p-4 bg-zinc-950/80 backdrop-blur-xl rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-all space-y-2 shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-xs">
                      {auth.client?.firstName[0]}{auth.client?.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{auth.client?.firstName} {auth.client?.lastName}</h4>
                      <p className="text-xs text-zinc-400 font-mono">Payer: {auth.payerName || 'Medicaid / Commercial'}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Expiring Soon
                  </span>
                </div>
              </div>
            ))}

            {(!atRiskAuths || atRiskAuths.length === 0) && (
              <div className="p-10 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-zinc-950/50">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400/50 mb-2" />
                <p className="font-semibold text-white">All Authorizations Active</p>
                <p className="text-zinc-500 mt-0.5">Zero prior authorizations currently at risk of expiration.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
