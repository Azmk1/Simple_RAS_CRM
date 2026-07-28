'use client';

import React from 'react';
import Link from 'next/link';
import { useHrmRole, HrmRole } from '@/lib/useHrmRole';

interface NavItem {
  name: string;
  href?: string;
  icon?: string;
  isHeader?: boolean;
}

export function HrmSidebar() {
  const { role } = useHrmRole();

  const roleNavItems: Record<HrmRole, NavItem[]> = {
    HEAD_HR: [
      { name: 'Head HR Command', isHeader: true },
      { name: 'Analytics Dashboard', href: '/', icon: '▦' },
      { name: 'Staffing Requests Queue', href: '/clients', icon: '👥' },
      { name: 'ATS Recruitment', href: '/ats', icon: '🎯' },
      { name: 'RBT Onboarding Checklist', href: '/onboarding', icon: '🛡️' },
      { name: 'RBT Session EMR', href: '/session-emr', icon: '⚡' },
      { name: 'Payroll & Benefits', href: '/payroll', icon: '💳' },
    ],
    HR_AGENT: [
      { name: 'Recruitment & Compliance', isHeader: true },
      { name: 'ATS Applicant Pipeline', href: '/ats', icon: '🎯' },
      { name: 'RBT Onboarding Checklist', href: '/onboarding', icon: '🛡️' },
      { name: 'Staffing Requests Queue', href: '/clients', icon: '👥' },
    ],
    FINANCE: [
      { name: 'Finance & Compensation', isHeader: true },
      { name: 'Payroll & Compensation', href: '/payroll', icon: '💳' },
      { name: 'Financial Analytics', href: '/', icon: '📊' },
    ],
    RBT: [
      { name: 'RBT Clinical EMR Portal', isHeader: true },
      { name: 'De-Identified Session EMR', href: '/session-emr', icon: '⚡' },
      { name: 'My Timesheets & Payroll', href: '/payroll', icon: '💳' },
    ],
  };

  const navItems = roleNavItems[role] || roleNavItems.HEAD_HR;

  return (
    <>
      <div className="w-[76px] flex-shrink-0 transition-all duration-300 hidden md:block border-r border-[var(--line)] bg-[rgba(8,10,18,0.7)]" />
      <div className="group fixed top-0 left-0 h-full w-[76px] hover:w-[252px] bg-[rgba(8,10,18,0.8)] hover:bg-[rgba(8,10,18,0.95)] backdrop-blur-[24px] border-r border-[var(--line)] py-[20px] px-[14px] flex flex-col z-50 transition-all duration-300 ease-in-out overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0)] hover:shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        
        {/* Brand Header */}
        <div className="flex items-center gap-[12px] px-[4px] pb-[24px] mb-[16px] border-b border-[var(--line)] whitespace-nowrap min-w-[220px]">
          <div className="w-11 h-11 rounded-xl bg-brand-orange-500/10 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(255,107,0,0.3)] border border-brand-orange-500/20">
            <img src="/logo.png" alt="Rise & Shine ABA Logo" className="w-8 h-8 object-contain drop-shadow-md" />
          </div>
          <div className="font-heading font-semibold text-[17px] tracking-[.1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Rise <span className="text-[var(--dawn)]">&</span> Shine
          </div>
          <div className="ml-auto flex items-center gap-[5px] font-mono text-[9px] text-[var(--teal)] tracking-[.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="dot-live"></span>{role}
          </div>
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 overflow-x-hidden overflow-y-hidden group-hover:overflow-y-auto custom-scrollbar space-y-1 pr-1">
          {navItems.map((item, idx) => {
            if (item.isHeader) {
              return (
                <div key={`header-${idx}`} className="font-mono text-[10px] font-semibold tracking-[1.5px] text-[var(--dawn)] uppercase px-[10px] mb-[8px] mt-[24px] flex items-center gap-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap min-w-[200px]">
                  <span className="opacity-50">//</span> {item.name}
                </div>
              );
            }
            
            return (
              <Link
                key={`link-${item.name}-${idx}`}
                href={item.href || '#'}
                className="flex items-center gap-[12px] px-[13px] group-hover:px-[12px] w-[44px] group-hover:w-[224px] h-[44px] rounded-xl text-[var(--ink-400)] text-[13.5px] font-medium cursor-pointer transition-all duration-300 ease-in-out bg-white/[0.02] hover:bg-white/[0.06] hover:text-white hover:shadow-md border border-transparent hover:border-white/[0.05] whitespace-nowrap overflow-hidden group/item"
                title={item.name}
              >
                <span className="w-[18px] flex-shrink-0 flex items-center justify-center text-[15px] text-brand-orange-500 group-hover/item:text-brand-orange-400 transition-colors duration-200 drop-shadow-[0_0_8px_rgba(255,107,0,0.4)]">
                  {item.icon}
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
