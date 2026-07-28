'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Activity, Calendar, CheckCircle2, Clock, Users, ArrowRight, ShieldAlert, AlertTriangle, UserCheck, Sparkles, Layers, Zap, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function CaseCoordDashboard({ 
  coordinators, 
  allClients 
}: { 
  coordinators: any[];
  allClients: any[]; 
}) {
  const [selectedCoordId, setSelectedCoordId] = useState<string>(coordinators[0]?.id || '');

  const myClients = selectedCoordId 
    ? allClients.filter(c => c.caseCoordinatorId === selectedCoordId)
    : allClients;

  const activeCases = myClients.filter(c => c.status === 'ACTIVE').length;
  const staffingPending = myClients.filter(c => c.status === 'STAFFING_PENDING').length;
  const meetAndGreetsPending = myClients.filter(c => c.rbtId && !c.rbtApproved).length;
  const totalCaseload = myClients.length;

  const activePercentage = totalCaseload > 0 ? Math.round((activeCases / totalCaseload) * 100) : 0;
  const staffingPercentage = totalCaseload > 0 ? Math.round((staffingPending / totalCaseload) * 100) : 0;

  return (
    <div className="space-y-8 mt-6 pb-12 animate-fade-in-up">
      {/* Hero Master Case Coordinator Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-white/10 shadow-2xl backdrop-blur-2xl group">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange-500/10 border border-brand-orange-500/20 text-brand-orange-400 font-mono text-[11px] font-bold">
              <span className="dot-live"></span>
              <span>CASE COORDINATION COMMAND CENTER • ACTIVE CASELOAD SYNC</span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white font-heading tracking-tight leading-tight">
              Case Coordinator <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-400 via-amber-300 to-teal-300">Analytics &amp; Roster</span>
            </h1>
            
            <p className="text-sm text-zinc-400 max-w-2xl font-sans leading-relaxed">
              Supervise client activations, track RBT candidate Meet &amp; Greet approvals, manage operational event tickets, and maintain staffing conversion SLAs.
            </p>
          </div>

          {/* Right Controls: Coordinator Selector & Roster Link */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-zinc-900/90 backdrop-blur-md px-3 py-2 rounded-xl flex items-center border border-white/10 shadow-sm">
              <Users className="w-4 h-4 text-brand-orange-400 mr-2.5" />
              <select
                className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer pr-2"
                value={selectedCoordId}
                onChange={e => setSelectedCoordId(e.target.value)}
              >
                <option value="" className="bg-zinc-950 text-white">All Coordinators (Master View)</option>
                {coordinators.map(c => (
                  <option key={c.id} value={c.id} className="bg-zinc-950 text-white">{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </div>

            <Link href="/portal-case-coord/clients">
              <Button className="bg-gradient-to-r from-brand-orange-500 to-orange-600 hover:from-brand-orange-600 hover:to-orange-700 text-white font-bold text-xs px-4 h-10 rounded-xl shadow-[0_0_20px_rgba(255,107,0,0.3)] transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5">
                <span>View Full Roster</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Caseload Analytics Snapshot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* 1. Active Caseload Ratio */}
        <Card className="relative overflow-hidden bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] group">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">ACTIVE CASELOAD</span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {activePercentage}% ACTIVE
              </span>
            </div>

            <div>
              <h3 className="text-3xl font-black text-white font-mono tracking-tight">{activeCases} / {totalCaseload}</h3>
              <p className="text-xs text-zinc-400 mt-1">Clients in Active Direct Services</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${activePercentage}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. RBT Meet & Greets Pending */}
        <Card className="relative overflow-hidden bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] group">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">MEET &amp; GREETS</span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ACTION REQ
              </span>
            </div>

            <div>
              <h3 className="text-3xl font-black text-white font-mono tracking-tight">{meetAndGreetsPending}</h3>
              <p className="text-xs text-zinc-400 mt-1">RBT Dispatches Awaiting Parent Approval</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <p className="text-[11px] text-zinc-400 font-mono">Dispatched from HRM Portal</p>
            </div>
          </CardContent>
        </Card>

        {/* 3. Staffing Queue Pending */}
        <Card className="relative overflow-hidden bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:border-brand-orange-500/50 hover:shadow-[0_0_30px_rgba(255,122,69,0.15)] group">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-brand-orange-400 uppercase tracking-wider">STAFFING QUEUE</span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-brand-orange-500/10 text-brand-orange-400 border border-brand-orange-500/20">
                {staffingPercentage}% QUEUE
              </span>
            </div>

            <div>
              <h3 className="text-3xl font-black text-white font-mono tracking-tight">{staffingPending}</h3>
              <p className="text-xs text-zinc-400 mt-1">Clients Awaiting RBT Assignment</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${staffingPercentage}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Total Caseload Assigned */}
        <Card className="relative overflow-hidden bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] group">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">TOTAL CASELOAD</span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                MONITORED
              </span>
            </div>

            <div>
              <h3 className="text-3xl font-black text-white font-mono tracking-tight">{totalCaseload}</h3>
              <p className="text-xs text-zinc-400 mt-1">Total Client Records Managed</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <p className="text-[11px] text-zinc-400 font-mono">100% Operational Transparency</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roster & Active Clients Panel */}
      <Card className="border border-white/10 bg-zinc-950/90 backdrop-blur-2xl shadow-2xl rounded-2xl">
        <CardHeader className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange-500/10 border border-brand-orange-500/20 flex items-center justify-center text-brand-orange-400 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold font-heading text-white">Active Case Coordination Roster</CardTitle>
              <p className="text-xs text-zinc-400 mt-0.5">Direct overview of assigned client pipelines and RBT staffing statuses</p>
            </div>
          </div>

          <Link href="/portal-case-coord/clients">
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-3.5 h-9 rounded-xl border border-white/10 transition-all cursor-pointer">
              View Operational Clients List →
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClients.map(client => (
              <div key={client.id} className="p-4 bg-zinc-900/80 rounded-2xl border border-white/5 hover:border-brand-orange-500/30 transition-all duration-300 space-y-3 shadow-md group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange-500/10 border border-brand-orange-500/20 flex items-center justify-center font-bold text-brand-orange-400 text-xs">
                      {client.firstName[0]}{client.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-brand-orange-400 transition-colors">{client.firstName} {client.lastName}</h4>
                      <p className="text-xs text-zinc-400 font-mono">ID: {client.id.substring(0, 8)}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                    client.status === 'ACTIVE' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-brand-orange-500/10 text-brand-orange-400 border-brand-orange-500/20'
                  }`}>
                    {client.status}
                  </span>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 text-xs text-zinc-400 space-y-1 font-sans">
                  <p><strong className="text-zinc-300">Case Coordinator:</strong> {client.caseCoordinator?.firstName ? `${client.caseCoordinator.firstName} ${client.caseCoordinator.lastName}` : 'Unassigned'}</p>
                  <p><strong className="text-zinc-300">RBT Assigned:</strong> {client.rbt ? `${client.rbt.firstName} ${client.rbt.lastName}` : 'Awaiting HR Dispatch'}</p>
                </div>

                <Link href={`/client/${client.id}`} className="block pt-1">
                  <Button className="w-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs h-8 rounded-xl border border-white/5 transition-all cursor-pointer flex items-center justify-center gap-1.5">
                    <span>Manage Client Command Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
