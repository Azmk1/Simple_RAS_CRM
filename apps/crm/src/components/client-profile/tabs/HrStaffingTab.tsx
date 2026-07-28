'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserCheck, Calendar, Clock, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { getHrStaffingOptions, assignHrStaff } from '@/app/actions/hr';
import { toast } from 'sonner';

export default function HrStaffingTab({ client }: { client: any }) {
  const [bcbas, setBcbas] = useState<any[]>([]);
  const [rbts, setRbts] = useState<any[]>([]);
  const [selectedBcba, setSelectedBcba] = useState<string>(client.bcbaId || '');
  const [selectedRbt, setSelectedRbt] = useState<string>(client.rbtId || '');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getHrStaffingOptions().then(res => {
      if (res.success) {
        setBcbas(res.bcbas);
        setRbts(res.rbts);
      }
    });
  }, []);

  let tp = client.treatmentPlan;
  if (typeof tp === 'string') {
    try { tp = JSON.parse(tp); } catch (e) {}
  }
  
  const prefs = tp?.staffingPreferences || {};
  const schedule = tp?.preferredSchedule || {};

  const packet = client.intakePacket;
  let parsedFormData: any = {};
  try {
    let parsed = typeof packet?.formData === 'string' ? JSON.parse(packet.formData) : packet?.formData;
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    parsedFormData = parsed || {};
  } catch (e) {}

  const requestedHours = parsedFormData.requestedHours || 'Not specified';
  const schoolSchedule = parsedFormData.schoolSchedule || 'Not specified';

  const handleAssignBcba = (value: string) => {
    setSelectedBcba(value);
    startTransition(async () => {
      const res = await assignHrStaff(client.id, { bcbaId: value });
      if (res.success) {
        toast.success('BCBA assignment updated!');
      } else {
        toast.error(res.error || 'Failed to assign BCBA');
      }
    });
  };

  const handleAssignRbt = (value: string) => {
    setSelectedRbt(value);
    startTransition(async () => {
      const res = await assignHrStaff(client.id, { rbtId: value });
      if (res.success) {
        toast.success('RBT Candidate assigned! Pending Case Coordinator Meet & Greet approval.');
      } else {
        toast.error(res.error || 'Failed to assign RBT Candidate');
      }
    });
  };

  const isFullyAssigned = !!selectedBcba && !!selectedRbt;

  return (
    <div className="space-y-6">
      <Card className="border-white/10 shadow-sm w-full bg-zinc-950">
        <CardHeader className="pb-4 border-b border-white/5">
          <CardTitle className="text-lg text-white flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-brand-orange-500" />
            HR Clinical Staffing Assignment
          </CardTitle>
          <p className="text-sm text-zinc-400 mt-1">Assign BCBA supervisor and RBT Candidate to this client based on staffing preferences and requested hours.</p>
        </CardHeader>
        
        <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Preferences & Schedule */}
          <div className="space-y-6">
            <div className="bg-zinc-900/50 p-5 rounded-xl border border-white/5 space-y-4">
              <h3 className="font-semibold text-white flex items-center border-b border-white/5 pb-3">
                <UserPlus className="w-4 h-4 mr-2 text-brand-orange-400" />
                Staffing Preferences & Demographics
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-zinc-950 p-3 rounded-lg border border-white/5">
                  <span className="text-zinc-500 text-xs block">Preferred Gender</span>
                  <span className="text-zinc-200 font-medium">{prefs.gender || 'No Preference'}</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-lg border border-white/5">
                  <span className="text-zinc-500 text-xs block">Preferred Language</span>
                  <span className="text-zinc-200 font-medium">{prefs.language || 'English'}</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-lg border border-white/5">
                  <span className="text-zinc-500 text-xs block">Race / Ethnicity</span>
                  <span className="text-zinc-200 font-medium">{prefs.race || 'No Preference'}</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-lg border border-white/5">
                  <span className="text-zinc-500 text-xs block">Age Preference</span>
                  <span className="text-zinc-200 font-medium">{prefs.age || 'No Preference'}</span>
                </div>
              </div>

              {prefs.notes && (
                <div className="text-xs bg-brand-blue-500/10 text-brand-blue-300 p-3 rounded-lg border border-brand-blue-500/20">
                  <strong className="block text-brand-blue-400 mb-1">Clinical Notes on Staffing:</strong>
                  {prefs.notes}
                </div>
              )}
            </div>

            <div className="bg-zinc-900/50 p-5 rounded-xl border border-white/5 space-y-3">
              <h3 className="font-semibold text-white flex items-center border-b border-white/5 pb-3">
                <Calendar className="w-4 h-4 mr-2 text-brand-gold-400" />
                Availability & Requested Schedule
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-white/5">
                  <Clock className="w-4 h-4 mr-2 text-zinc-400 shrink-0" />
                  <div>
                    <span className="text-xs text-zinc-500 block">Requested Hours</span>
                    <span>{requestedHours}</span>
                  </div>
                </div>
                <div className="text-sm text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-white/5">
                  <span className="text-xs text-zinc-500 block mb-1">School / Work Schedule</span>
                  <span>{schoolSchedule}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: HR Assignment Controls */}
          <div className="space-y-6 bg-zinc-900/50 p-6 rounded-xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="font-semibold text-white border-b border-white/5 pb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                Assign Staff
              </h3>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">BCBA Supervisor</label>
                <select
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:border-brand-orange-500 outline-none cursor-pointer text-sm"
                  value={selectedBcba}
                  onChange={(e) => handleAssignBcba(e.target.value)}
                  disabled={isPending}
                >
                  <option value="">-- Select BCBA --</option>
                  {bcbas.map(bcba => (
                    <option key={bcba.id} value={bcba.id}>{bcba.firstName} {bcba.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  RBT Candidate (Requires Meet & Greet)
                </label>
                <select
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:border-brand-orange-500 outline-none cursor-pointer text-sm"
                  value={selectedRbt}
                  onChange={(e) => handleAssignRbt(e.target.value)}
                  disabled={isPending}
                >
                  <option value="">-- Select RBT Candidate --</option>
                  {rbts.map(rbt => (
                    <option key={rbt.id} value={rbt.id}>{rbt.firstName} {rbt.lastName}</option>
                  ))}
                </select>
              </div>

              {client.rbt && (
                <div className={`p-3 rounded-lg text-xs border ${
                  client.rbtApproved 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : 'bg-brand-orange-500/10 text-brand-orange-400 border-brand-orange-500/20'
                }`}>
                  <strong>RBT Candidate Status:</strong> {client.rbtApproved ? 'Approved by Case Coordinator ✓' : 'Pending Meet & Greet Approval with Case Coordinator'}
                </div>
              )}
            </div>

            {isFullyAssigned ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-green-400 bg-green-500/10 p-4 rounded-lg border border-green-500/20 font-bold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Both BCBA & RBT assigned! Ready for Case Coordinator activation.</span>
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-2 text-sm text-brand-orange-400 bg-brand-orange-500/10 p-4 rounded-lg border border-brand-orange-500/20 font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Requires both BCBA and RBT assigned to complete HR staffing.</span>
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
