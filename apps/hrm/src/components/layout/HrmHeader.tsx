'use client';

import React from 'react';
import NotificationBell from '@/components/layout/NotificationBell';
import { Search, ShieldCheck } from 'lucide-react';
import { useHrmRole } from '@/lib/useHrmRole';

export function HrmHeader() {
  const { role } = useHrmRole();

  const userProfiles = {
    HEAD_HR: { name: 'Eleanor Vance', title: 'Head of HR & Dispatch Lead', badge: 'HEAD HR' },
    HR_AGENT: { name: 'Samantha Reed', title: 'ATS Recruiter & Compliance', badge: 'HR AGENT' },
    FINANCE: { name: 'Robert Sterling', title: 'Payroll & Compensation Lead', badge: 'FINANCE' },
    RBT: { name: 'Sarah Jenkins, RBT', title: 'Registered Behavior Technician', badge: 'RBT EMR' },
  };

  const currentProfile = userProfiles[role] || userProfiles.HEAD_HR;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[var(--line)] bg-[rgba(8,10,18,0.8)] backdrop-blur-[24px] px-6">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--ink-500)]" />
          <input
            type="text"
            placeholder="Search candidates, timesheets, or session logs..."
            className="w-64 rounded-xl bg-white/[0.04] border border-white/[0.08] pl-9 pr-4 py-2 text-xs text-[var(--ink-100)] placeholder-[var(--ink-500)] focus:border-brand-orange-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls: Notifications & Active User Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <NotificationBell />

        {/* User Profile & Role Badge */}
        <div className="flex items-center gap-3 pl-4 border-l border-[var(--line)]">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-white">{currentProfile.name}</span>
            <span className="text-[10px] text-green-400 font-mono flex items-center justify-end gap-1">
              <ShieldCheck className="w-3 h-3" /> {currentProfile.badge} ACTIVE
            </span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-brand-orange-500/20 border border-brand-orange-500/30 flex items-center justify-center text-brand-orange-400 font-bold text-xs shadow-md">
            {role.substring(0, 2)}
          </div>
        </div>
      </div>
    </header>
  );
}
