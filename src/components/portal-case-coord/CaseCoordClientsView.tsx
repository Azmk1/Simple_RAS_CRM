'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, Search, UserCheck, UserX, AlertCircle, ExternalLink, Calendar, Filter } from 'lucide-react';
import Link from 'next/link';
import CaseCoordActionItems from './CaseCoordActionItems';
import { approveRbtCandidate, rejectRbtCandidate } from '@/app/(dashboard)/portal-case/actions';
import { toast } from 'sonner';

export default function CaseCoordClientsView({
  coordinators,
  allClients
}: {
  coordinators: any[];
  allClients: any[];
}) {
  const [selectedCoordId, setSelectedCoordId] = useState<string>(coordinators[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isPending, startTransition] = useTransition();

  const myClients = selectedCoordId
    ? allClients.filter(c => c.caseCoordinatorId === selectedCoordId)
    : allClients;

  const meetAndGreetQueue = myClients.filter(c => c.rbtId && !c.rbtApproved);

  const filteredClients = myClients.filter(client => {
    const matchesSearch = `${client.firstName} ${client.lastName} ${client.guardianName || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && client.status === statusFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header & Coordinator Identity Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-black-800 p-6 rounded-xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-orange-500" />
            Case Coordinator Workflows & Roster
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage field tickets, RBT meet & greets, and individual client schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-950 px-3 py-2 rounded-lg border border-white/10 flex items-center">
            <span className="text-xs text-zinc-400 mr-2 font-bold uppercase">Coordinator:</span>
            <select
              className="bg-transparent text-white font-semibold text-xs outline-none cursor-pointer"
              value={selectedCoordId}
              onChange={e => setSelectedCoordId(e.target.value)}
            >
              <option value="">All Coordinators (Master View)</option>
              {coordinators.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 1. Action Items / Field Tickets Inbox */}
      <CaseCoordActionItems coordinatorId={selectedCoordId} />

      {/* 2. Pending RBT Meet & Greet Queue */}
      {meetAndGreetQueue.length > 0 && (
        <Card className="border-brand-orange-500/30 bg-zinc-950">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-brand-orange-400" />
              Pending RBT Meet & Greets ({meetAndGreetQueue.length})
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-1">HR has assigned an RBT Candidate. Conduct the Meet & Greet to approve or request re-assignment.</p>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetAndGreetQueue.map(client => (
              <Card key={client.id} className="bg-zinc-900 border-white/10">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white text-base">{client.firstName} {client.lastName}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-orange-500/10 text-brand-orange-400 uppercase">
                        Candidate Assigned
                      </span>
                    </div>
                    <div className="mt-3 bg-zinc-950 p-3 rounded-lg border border-white/5 space-y-1 text-xs">
                      <p className="text-zinc-500 font-semibold uppercase text-[10px]">RBT Candidate</p>
                      <p className="text-white font-medium">{client.rbt?.firstName} {client.rbt?.lastName}</p>
                      <p className="text-zinc-400">{client.rbt?.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <Button
                      disabled={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          const res = await approveRbtCandidate(client.id);
                          if (res.success) {
                            toast.success('RBT Candidate Approved!');
                          } else {
                            toast.error(res.error || 'Failed to approve');
                          }
                        });
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                    <Button
                      disabled={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          const res = await rejectRbtCandidate(client.id);
                          if (res.success) {
                            toast.success('RBT Candidate Rejected. HR notified.');
                          } else {
                            toast.error(res.error || 'Failed to reject');
                          }
                        });
                      }}
                      variant="secondary"
                      className="bg-red-950 hover:bg-red-900 border border-red-500/20 text-red-400 font-bold text-xs"
                    >
                      <UserX className="w-3.5 h-3.5 mr-1" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 3. Searchable & Filterable Client Roster */}
      <Card className="border-white/10 bg-zinc-950">
        <CardHeader className="pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-blue-400" />
              Assigned Caseload Roster
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-1">Browse, filter, and open client profiles for schedule activation.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search client or parent..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-brand-orange-500 w-56"
              />
            </div>

            {/* Status Filter */}
            <div className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 flex items-center text-xs text-zinc-400">
              <Filter className="w-3.5 h-3.5 mr-1 text-zinc-500" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="STAFFING_PENDING">STAFFING PENDING</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {filteredClients.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 border border-dashed border-white/5 rounded-xl">
              No clients match the specified filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map(client => (
                <Link key={client.id} href={`/client/${client.id}?mode=case-coord`} className="block group">
                  <Card className="bg-zinc-900 border-white/10 group-hover:border-brand-orange-500/40 transition-colors">
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-white text-base group-hover:text-brand-orange-400 transition-colors">
                            {client.firstName} {client.lastName}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            client.status === 'ACTIVE' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-brand-orange-500/10 text-brand-orange-400 border border-brand-orange-500/20'
                          }`}>
                            {client.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 mt-1">Parent: {client.guardianName || 'N/A'}</p>

                        <div className="mt-3 bg-zinc-950 p-3 rounded-lg border border-white/5 space-y-1 text-xs text-zinc-300">
                          <p><span className="text-zinc-500">BCBA:</span> {client.bcba ? `${client.bcba.firstName} ${client.bcba.lastName}` : 'Unassigned'}</p>
                          <p><span className="text-zinc-500">RBT:</span> {client.rbt ? `${client.rbt.firstName} ${client.rbt.lastName}` : 'Unassigned'}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-brand-orange-400 group-hover:text-brand-orange-300">
                        <span>Open Scheduling Tab</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
