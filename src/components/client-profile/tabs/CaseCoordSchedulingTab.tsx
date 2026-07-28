'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, UserCheck, UserX, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { approveRbtCandidate, rejectRbtCandidate } from '@/app/(dashboard)/portal-case/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CaseCoordSchedulingTab({ client }: { client: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [startDate, setStartDate] = useState<string>('');
  const [scheduleNotes, setScheduleNotes] = useState<string>('');

  const isRbtPending = client.rbtId && !client.rbtApproved;
  const isReadyToActivate = client.bcbaId && client.rbtId && client.rbtApproved && client.caseCoordinatorId;
  const isActive = client.status === 'ACTIVE';

  const handleApproveRbt = () => {
    startTransition(async () => {
      const res = await approveRbtCandidate(client.id);
      if (res.success) {
        toast.success('RBT Candidate approved!');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to approve RBT');
      }
    });
  };

  const handleRejectRbt = () => {
    startTransition(async () => {
      const res = await rejectRbtCandidate(client.id);
      if (res.success) {
        toast.success('RBT Candidate rejected. HR notified for re-assignment.');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to reject RBT');
      }
    });
  };

  const handleActivateCase = () => {
    startTransition(async () => {
      const res = await approveRbtCandidate(client.id);
      if (res.success) {
        toast.success('Client status updated! Case is active.');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to activate client');
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-white/10 shadow-sm w-full bg-zinc-950">
        <CardHeader className="pb-4 border-b border-white/5">
          <CardTitle className="text-lg text-white flex items-center gap-3">
            <Calendar className="w-5 h-5 text-brand-blue-400" />
            Case Coordinator Scheduling & Activation
          </CardTitle>
          <p className="text-sm text-zinc-400 mt-1">
            Conduct the RBT Meet & Greet, establish session schedules, and mark the client as active.
          </p>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-8">
          
          {/* Step 1: Meet & Greet Verification */}
          <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
            <h3 className="font-semibold text-white flex items-center justify-between border-b border-white/5 pb-3">
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand-orange-400" />
                1. RBT Candidate Meet & Greet
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded uppercase ${
                client.rbtApproved 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : client.rbt 
                    ? 'bg-brand-orange-500/10 text-brand-orange-400 border border-brand-orange-500/20' 
                    : 'bg-zinc-800 text-zinc-400'
              }`}>
                {client.rbtApproved ? 'Approved ✓' : client.rbt ? 'Pending Meet & Greet' : 'Awaiting HR Assignment'}
              </span>
            </h3>

            {client.rbt ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-950 p-4 rounded-lg border border-white/5">
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold">Assigned Candidate</p>
                  <p className="text-base font-semibold text-white mt-0.5">{client.rbt.firstName} {client.rbt.lastName}</p>
                  <p className="text-xs text-zinc-400">{client.rbt.email}</p>
                </div>

                {isRbtPending && (
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      disabled={isPending}
                      onClick={handleApproveRbt}
                      className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white font-bold text-xs"
                    >
                      <UserCheck className="w-4 h-4 mr-1" /> Approve Candidate
                    </Button>
                    <Button
                      disabled={isPending}
                      onClick={handleRejectRbt}
                      variant="secondary"
                      className="flex-1 sm:flex-initial bg-red-950 hover:bg-red-900 border border-red-500/20 text-red-400 font-bold text-xs"
                    >
                      <UserX className="w-4 h-4 mr-1" /> Reject & Re-assign
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-400 italic">HR has not assigned an RBT Candidate yet.</p>
            )}
          </div>

          {/* Step 2: Schedule & Therapy Start Date */}
          <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-6">
            <h3 className="font-semibold text-white border-b border-white/5 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-blue-400" />
              2. Therapy Schedule & Start Date
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Therapy Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:border-brand-blue-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Weekly Recurring Hours / Slot Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Mon-Fri 3:30 PM - 6:30 PM"
                  value={scheduleNotes}
                  onChange={e => setScheduleNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:border-brand-blue-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Final Activation */}
          <div className="pt-4 border-t border-white/5">
            {isActive ? (
              <div className="flex items-center gap-3 bg-green-500/10 p-5 rounded-xl border border-green-500/20 text-green-400 font-bold">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-green-500" />
                <div>
                  <p className="text-base">Client is Fully Active!</p>
                  <p className="text-xs text-green-500/80 font-normal">Staffing, Meet & Greet, and Case Coordinator assignments are completed.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900 p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3 text-zinc-300">
                  <AlertCircle className={`w-5 h-5 shrink-0 ${isReadyToActivate ? 'text-green-500' : 'text-brand-orange-400'}`} />
                  <span className="text-sm">
                    {isReadyToActivate 
                      ? 'All requirements met! Click to activate client.' 
                      : 'Requires BCBA, RBT Meet & Greet Approval, and Case Coordinator assignment to activate.'}
                  </span>
                </div>

                <Button
                  onClick={handleActivateCase}
                  disabled={isPending || !isReadyToActivate}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-6 h-11"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Activate Client
                </Button>
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
