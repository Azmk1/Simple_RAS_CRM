'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Activity, Calendar, CheckCircle2, Clock, Users, ArrowRight, ShieldAlert, AlertTriangle, UserCheck } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Top Banner & Coordinator Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-black-800 p-6 rounded-xl border border-white/5">
        <div>
          <h1 className="text-3xl font-heading font-black text-brand-orange-500">CASE COORDINATION ANALYTICS</h1>
          <p className="text-brand-blue-400">High-level caseload progress, staffing ratios, and activation analytics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-zinc-900 p-2.5 rounded-xl flex items-center border border-white/10">
            <Users className="w-4 h-4 text-brand-orange-400 mr-2" />
            <select
              className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
              value={selectedCoordId}
              onChange={e => setSelectedCoordId(e.target.value)}
            >
              <option value="">All Coordinators (Master View)</option>
              {coordinators.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>

          <Link href="/portal-case-coord/clients">
            <Button className="bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold text-xs px-4 h-10">
              Open Workflows & Roster <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. High-Level KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-zinc-950 shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Active Therapy Cases</p>
                <h3 className="text-3xl font-black text-white mt-2">{activeCases}</h3>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950 shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-brand-orange-400 font-bold uppercase tracking-wider">Staffing Pending</p>
                <h3 className="text-3xl font-black text-white mt-2">{staffingPending}</h3>
              </div>
              <div className="p-3 bg-brand-orange-500/10 border border-brand-orange-500/20 rounded-xl text-brand-orange-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950 shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Pending Meet & Greets</p>
                <h3 className="text-3xl font-black text-white mt-2">{meetAndGreetsPending}</h3>
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950 shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-brand-gold-400 font-bold uppercase tracking-wider">Total Assigned Cases</p>
                <h3 className="text-3xl font-black text-white mt-2">{totalCaseload}</h3>
              </div>
              <div className="p-3 bg-brand-gold-500/10 border border-brand-gold-500/20 rounded-xl text-brand-gold-400">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Visual Metric Progress Bars & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/10 bg-zinc-950 shadow-lg">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-orange-400" />
              Caseload Activation Progress Ratio
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-1">Percentage of clients successfully converted from Staffing to Active therapy.</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-green-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Active Cases ({activeCases})
                </span>
                <span className="text-white">{activePercentage}%</span>
              </div>
              <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/5 flex">
                <div 
                  className="bg-gradient-to-r from-green-600 to-green-400 h-full transition-all duration-500" 
                  style={{ width: `${activePercentage}%` }} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-brand-orange-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-orange-500"></span> Staffing Pending ({staffingPending})
                </span>
                <span className="text-white">{staffingPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/5 flex">
                <div 
                  className="bg-gradient-to-r from-brand-orange-600 to-brand-orange-400 h-full transition-all duration-500" 
                  style={{ width: `${staffingPercentage}%` }} 
                />
              </div>
            </div>

            <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/5 text-xs text-zinc-400 flex items-center justify-between">
              <span>Overall Caseload Health Score</span>
              <span className="font-bold text-green-400 text-sm">
                {activePercentage > 75 ? 'Optimal (High Conversion)' : 'Staffing Attention Needed'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950 shadow-lg">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-brand-gold-400" />
              Operational Summary & Shortcuts
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-1">Direct access to operational queues and field tickets.</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Link href="/portal-case-coord/clients" className="block">
              <div className="p-4 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-brand-orange-500/30 rounded-xl transition-all flex items-center justify-between group">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-orange-400 transition-colors">Action Items & Field Tickets</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Manage schedule changes, parent flags, and call-outs.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-brand-orange-400 transition-colors" />
              </div>
            </Link>

            <Link href="/portal-case-coord/clients" className="block">
              <div className="p-4 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-brand-orange-500/30 rounded-xl transition-all flex items-center justify-between group">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-orange-400 transition-colors">RBT Meet & Greet Queue ({meetAndGreetsPending})</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Approve or reject candidates assigned by HR.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-brand-orange-400 transition-colors" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
