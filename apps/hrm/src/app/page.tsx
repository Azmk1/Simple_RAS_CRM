import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Users, ShieldCheck, CreditCard, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HrmStandaloneDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-brand-black-800 p-6 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-brand-orange-500">ENTERPRISE HRM & RBT EMR SUITE</h1>
          <p className="text-brand-blue-400">Standalone Staff Management Portal running on Port 3001 with Zero-PHI Isolation.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-zinc-950">
          <CardContent className="p-6">
            <p className="text-xs text-brand-orange-400 font-bold uppercase">Active Applicants (ATS)</p>
            <h3 className="text-3xl font-black text-white mt-2">14 Candidates</h3>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950">
          <CardContent className="p-6">
            <p className="text-xs text-green-400 font-bold uppercase">RBT Compliance Rate</p>
            <h3 className="text-3xl font-black text-white mt-2">98% Verified</h3>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950">
          <CardContent className="p-6">
            <p className="text-xs text-cyan-400 font-bold uppercase">Sessions Converted (EMR)</p>
            <h3 className="text-3xl font-black text-white mt-2">142 Units</h3>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950">
          <CardContent className="p-6">
            <p className="text-xs text-purple-400 font-bold uppercase">Payroll Fill Index</p>
            <h3 className="text-3xl font-black text-white mt-2">100% Verified</h3>
          </CardContent>
        </Card>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/ats" className="block">
          <Card className="border-white/10 bg-zinc-900 hover:border-brand-orange-500/40 transition-all p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">ATS Recruitment Pipeline</h3>
                <p className="text-xs text-zinc-400 mt-1">Manage job applicants, interviews, and offer letters.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-brand-orange-400" />
            </div>
          </Card>
        </Link>

        <Link href="/onboarding" className="block">
          <Card className="border-white/10 bg-zinc-900 hover:border-green-500/40 transition-all p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">RBT Compliance Checklist</h3>
                <p className="text-xs text-zinc-400 mt-1">BACB registry check, background screening, and CPR training.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-green-400" />
            </div>
          </Card>
        </Link>

        <Link href="/session-emr" className="block">
          <Card className="border-white/10 bg-zinc-900 hover:border-cyan-500/40 transition-all p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">RBT Session EMR Engine</h3>
                <p className="text-xs text-zinc-400 mt-1">Trial data collection, BRP timers, and digital signatures.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-cyan-400" />
            </div>
          </Card>
        </Link>

        <Link href="/payroll" className="block">
          <Card className="border-white/10 bg-zinc-900 hover:border-purple-500/40 transition-all p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Payroll & Benefits</h3>
                <p className="text-xs text-zinc-400 mt-1">Direct deposit, paystubs, and health benefits enrollment.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-400" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
