'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserCheck, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getClinicalStaff, assignCaseCoordinator } from '@/app/(dashboard)/portal-case/actions';

export default function ClientAssignmentsTab({ client }: { client: any }) {
  const router = useRouter();
  const [caseCoordinators, setCaseCoordinators] = useState<any[]>([]);
  const [selectedCoordinator, setSelectedCoordinator] = useState<string>(client.caseCoordinatorId || '');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getClinicalStaff().then(res => {
      setCaseCoordinators(res.caseCoordinators);
    });
  }, []);

  const packet = client.intakePacket;
  let parsedFormData: any = {};
  try {
    let parsed = typeof packet?.formData === 'string' ? JSON.parse(packet.formData) : packet?.formData;
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    parsedFormData = parsed || {};
  } catch (e) {}

  const requestedHours = parsedFormData.requestedHours || 'Not specified';
  const schoolSchedule = parsedFormData.schoolSchedule || 'Not specified';

  const handleAssign = () => {
    if (!selectedCoordinator) {
      alert('Please select a Case Coordinator.');
      return;
    }
    startTransition(async () => {
      await assignCaseCoordinator(client.id, selectedCoordinator);
      router.push('/portal-case');
    });
  };

  const isAssigned = !!client.caseCoordinatorId;

  return (
    <div className="space-y-6">
      <Card className="border-white/10 shadow-sm w-full bg-zinc-950">
        <CardHeader className="pb-4 border-b border-white/5">
          <CardTitle className="text-lg text-white flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-cyan-500" />
            Team Assignments
          </CardTitle>
          <p className="text-sm text-zinc-400 mt-1">Review clinical assignments from HR and assign a Case Coordinator to activate.</p>
        </CardHeader>
        
        <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Availability Info & HR Context */}
          <div className="space-y-6">
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
              <h3 className="font-semibold text-white flex items-center border-b border-white/5 pb-3">
                <Calendar className="w-4 h-4 mr-2 text-brand-gold-500" />
                Client Schedule Requirements
              </h3>
              
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Requested Hours for ABA</label>
                <div className="bg-zinc-800/50 p-3 rounded-lg text-zinc-300 text-sm flex items-start">
                  <Clock className="w-4 h-4 mr-2 mt-0.5 text-zinc-400 shrink-0" />
                  <span>{requestedHours}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">School Schedule</label>
                <div className="bg-zinc-800/50 p-3 rounded-lg text-zinc-300 text-sm">
                  {schoolSchedule}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
              <h3 className="font-semibold text-white flex items-center border-b border-white/5 pb-3">
                <UserCheck className="w-4 h-4 mr-2 text-cyan-500" />
                HR Staffing Status
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Assigned BCBA</label>
                  <div className={`p-3 rounded-lg text-sm font-medium ${client.bcba ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' : 'bg-zinc-800/50 text-zinc-500'}`}>
                    {client.bcba ? `${client.bcba.firstName} ${client.bcba.lastName}` : 'Pending Assignment...'}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Assigned RBT</label>
                  <div className={`p-3 rounded-lg text-sm font-medium ${
                    client.rbt 
                      ? client.rbtApproved 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                        : 'bg-brand-orange-500/10 text-brand-orange-500 border border-brand-orange-500/20' 
                      : 'bg-zinc-800/50 text-zinc-500'
                  }`}>
                    {client.rbt 
                      ? `${client.rbt.firstName} ${client.rbt.lastName}${client.rbtApproved ? ' (Approved)' : ' (Candidate - Meet & Greet Pending)'}` 
                      : 'Pending Assignment...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
 
          {/* Assignment Form */}
          <div className="space-y-6 p-6">
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">Select Case Coordinator</label>
              <select 
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-cyan-500 outline-none transition-colors"
                value={selectedCoordinator}
                onChange={e => setSelectedCoordinator(e.target.value)}
              >
                <option value="">-- Choose Coordinator --</option>
                {caseCoordinators.map(user => (
                  <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                ))}
              </select>
            </div>
 
            <Button 
              className={`w-full h-12 font-bold mt-4 transition-colors ${isAssigned ? 'bg-green-600 hover:bg-green-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white`}
              onClick={handleAssign}
              disabled={isPending || !selectedCoordinator}
            >
              {isPending ? 'Assigning...' : isAssigned ? 'Update Coordinator' : 'Assign Case Coordinator'}
            </Button>
            
            {client.status === 'STAFFING_PENDING' && (
              <div className="mt-4 flex flex-col gap-2 text-xs text-zinc-400 bg-zinc-900 p-4 rounded-lg border border-white/5">
                <p className="font-bold text-white uppercase text-[10px] tracking-wider mb-1">Activation Checklist</p>
                <div className="flex items-center gap-2">
                  <span className={client.bcbaId ? 'text-green-500 font-bold' : 'text-zinc-500'}>
                    {client.bcbaId ? '✓' : '○'}
                  </span>
                  <span>BCBA Assigned: {client.bcba ? `${client.bcba.firstName} ${client.bcba.lastName}` : 'Pending'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={client.rbtId ? 'text-green-500 font-bold' : 'text-zinc-500'}>
                    {client.rbtId ? '✓' : '○'}
                  </span>
                  <span>RBT Candidate Assigned: {client.rbt ? `${client.rbt.firstName} ${client.rbt.lastName}` : 'Pending'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={client.rbtApproved ? 'text-green-500 font-bold' : 'text-zinc-500'}>
                    {client.rbtApproved ? '✓' : '○'}
                  </span>
                  <span>RBT Meet & Greet Approved by Case Coordinator: {client.rbtApproved ? 'Approved' : 'Pending Approval'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={isAssigned ? 'text-green-500 font-bold' : 'text-zinc-500'}>
                    {isAssigned ? '✓' : '○'}
                  </span>
                  <span>Case Coordinator Assigned: {isAssigned ? 'Yes' : 'No'}</span>
                </div>
              </div>
            )}
            
            {client.status === 'ACTIVE' && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-500 bg-green-500/10 p-4 rounded-lg border border-green-500/20 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Client is Fully Active</span>
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
