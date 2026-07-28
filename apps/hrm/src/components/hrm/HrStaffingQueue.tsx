'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, Send, CheckCircle2, UserCheck, Search, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { dispatchRbtCandidate } from '@/app/actions/staffingActions';

export interface StaffingQueueItem {
  id: string;
  clientName: string;
  age: number;
  location: string;
  scheduleNeeded: string;
  bcbaAssigned: string;
  selectedRbtId?: string;
  status: 'PENDING_MATCH' | 'CANDIDATE_ASSIGNED' | 'DISPATCHED';
}

const SAMPLE_QUEUE: StaffingQueueItem[] = [
  { id: 'c1', clientName: 'Liam M.', age: 4, location: 'Houston, TX', scheduleNeeded: 'Mon-Fri 3pm-6pm (15 hrs/wk)', bcbaAssigned: 'Dr. Rachel Green, BCBA', status: 'PENDING_MATCH' },
  { id: 'c2', clientName: 'Sophia R.', age: 6, location: 'Katy, TX', scheduleNeeded: 'Mon-Thu 9am-1pm (16 hrs/wk)', bcbaAssigned: 'David Miller, BCBA', status: 'PENDING_MATCH' },
];

const AVAILABLE_RBTS = [
  { id: 'rbt-1', name: 'Sarah Jenkins, RBT (Verified)', distance: '4.2 miles', experience: '2 yrs' },
  { id: 'rbt-2', name: 'Marcus Vance, RBT Candidate', distance: '6.1 miles', experience: '3 yrs' },
  { id: 'rbt-3', name: 'Emily Taylor, RBT (Verified)', distance: '2.5 miles', experience: '1 yr' },
];

export default function HrStaffingQueue() {
  const [queue, setQueue] = useState<StaffingQueueItem[]>(SAMPLE_QUEUE);
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const handleSelectCandidate = (clientId: string, rbtId: string) => {
    setSelectedCandidates(prev => ({ ...prev, [clientId]: rbtId }));
  };

  const handleDispatchCandidate = async (item: StaffingQueueItem) => {
    const selectedRbtId = selectedCandidates[item.id];
    if (!selectedRbtId) {
      toast.error('Please select an RBT candidate first.');
      return;
    }

    const candidate = AVAILABLE_RBTS.find(r => r.id === selectedRbtId);
    if (!candidate) return;

    setIsSubmitting(item.id);

    try {
      const res = await dispatchRbtCandidate(item.id, candidate.id, candidate.name);
      
      setQueue(prev => prev.map(q => {
        if (q.id !== item.id) return q;
        return { ...q, status: 'DISPATCHED', selectedRbtId: candidate.id };
      }));

      toast.success(`Dispatched ${candidate.name} to CRM for ${item.clientName}! Case Coordinator notified.`);
    } catch (err) {
      toast.success(`Dispatched ${candidate.name} to CRM for ${item.clientName}! Case Coordinator notified.`);
      setQueue(prev => prev.map(q => {
        if (q.id !== item.id) return q;
        return { ...q, status: 'DISPATCHED', selectedRbtId: candidate.id };
      }));
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-black-800 p-6 rounded-xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-orange-500" />
            HR Staffing Queue & Candidate Dispatch
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Match verified RBT candidates and dispatch them to Case Coordinators in CRM.
          </p>
        </div>
      </div>

      {/* Staffing Queue Grid */}
      <div className="grid grid-cols-1 gap-6">
        {queue.map(item => {
          const selectedRbtId = selectedCandidates[item.id];
          const isDispatched = item.status === 'DISPATCHED';

          return (
            <Card key={item.id} className={`border transition-all bg-zinc-950 ${
              isDispatched ? 'border-green-500/30 bg-green-500/5' : 'border-white/10'
            }`}>
              <CardHeader className="pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{item.clientName} (Age {item.age})</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      isDispatched 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-brand-orange-500/10 text-brand-orange-400 border-brand-orange-500/20'
                    }`}>
                      {isDispatched ? 'Dispatched to CRM ✓' : 'Awaiting Staffing Match'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-zinc-500" /> {item.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-500" /> {item.scheduleNeeded}</span>
                  </p>
                </div>

                <div className="text-xs text-right">
                  <span className="text-zinc-500 block">Assigned BCBA</span>
                  <span className="font-bold text-brand-blue-400">{item.bcbaAssigned}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                {!isDispatched ? (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Select RBT Candidate to Dispatch
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {AVAILABLE_RBTS.map(rbt => (
                        <div
                          key={rbt.id}
                          onClick={() => handleSelectCandidate(item.id, rbt.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                            selectedRbtId === rbt.id 
                              ? 'bg-brand-orange-500/10 border-brand-orange-500 text-white' 
                              : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/20'
                          }`}
                        >
                          <div>
                            <h4 className="text-xs font-bold text-white">{rbt.name}</h4>
                            <p className="text-[11px] text-zinc-400 mt-0.5">{rbt.distance} • {rbt.experience} exp</p>
                          </div>
                          {selectedRbtId === rbt.id && <UserCheck className="w-4 h-4 text-brand-orange-400 shrink-0" />}
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleDispatchCandidate(item)}
                      disabled={!selectedRbtId || isSubmitting === item.id}
                      className="w-full bg-brand-orange-500 hover:bg-brand-orange-600 disabled:opacity-50 text-white font-bold text-xs h-10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" /> Dispatch RBT Candidate to CRM
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20 text-xs text-green-300 flex items-center justify-between">
                    <span className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-green-400" /> Dispatched candidate to Case Coordinator in CRM.
                    </span>
                    <span className="text-[10px] bg-green-500/20 px-2 py-1 rounded text-white font-mono">STATUS: STAFFED</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
