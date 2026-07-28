'use client';

import React, { useState } from 'react';
import { UserCircle2, X, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useHrmRole, HrmRole } from '@/lib/useHrmRole';

export function HrmDevToolsUI() {
  const [isOpen, setIsOpen] = useState(false);
  const { role, setRole } = useHrmRole();

  const hrmRoles: { role: HrmRole; label: string; desc: string }[] = [
    { role: 'HEAD_HR', label: 'Head HR (Staffing Dispatch & Case Sync)', desc: 'Assigns RBT candidates & dispatches to CRM Case Coordinators' },
    { role: 'HR_AGENT', label: 'HR Agent (Recruiter / Onboarding)', desc: 'Manages ATS pipeline, interviews, and 6-point compliance' },
    { role: 'FINANCE', label: 'Finance (Payroll & Compensation)', desc: 'Manages timesheets, billable therapy hours, and direct deposit' },
    { role: 'RBT', label: 'RBT Therapy Staff (Session EMR)', desc: 'Records trial data, BRP timers, and digital SOAP notes' },
  ];

  const handleSwitchRole = (newRole: HrmRole, label: string) => {
    setRole(newRole);
    toast.success(`Switched HRM Portal View to: ${label}`);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold text-xs px-3.5 py-2 rounded-full shadow-xl flex items-center gap-2 border border-white/20 transition-all hover:scale-105 cursor-pointer"
        >
          <UserCircle2 className="w-4 h-4" />
          <span>Portal View: <strong className="text-white">{role}</strong></span>
        </button>
      ) : (
        <div className="bg-zinc-950 border border-brand-orange-500/30 rounded-xl p-4 shadow-2xl w-80 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-orange-400" /> HRM Role Portal Switcher
            </h4>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {hrmRoles.map(r => (
              <button
                key={r.role}
                onClick={() => handleSwitchRole(r.role, r.label)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col gap-0.5 border cursor-pointer ${
                  role === r.role 
                    ? 'bg-brand-orange-500/20 text-brand-orange-300 border-brand-orange-500/40 font-bold' 
                    : 'bg-zinc-900 text-zinc-300 border-white/5 hover:border-white/20'
                }`}
              >
                <span className="font-semibold text-white">{r.label}</span>
                <span className="text-[10px] text-zinc-400 font-normal">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
