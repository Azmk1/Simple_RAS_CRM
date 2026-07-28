'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CreditCard, DollarSign, Clock, CheckCircle2, ShieldCheck, Heart, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function PayrollBenefitsView() {
  const [paystubPeriod, setPaystubPeriod] = useState('July 15 - July 31, 2026');

  const timesheetSummary = {
    billableHours: 68.5,
    adminHours: 8.0,
    hourlyRate: 24.50,
    grossPay: 1874.25,
    taxDeductions: 328.00,
    netPay: 1546.25,
  };

  const handleDownloadPaystub = () => {
    toast.success('Downloading Paystub PDF...');
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-black-800 p-6 rounded-xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-brand-orange-500" />
            Payroll, Timesheets & Benefits Portal
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage staff compensation, timesheet conversions, and benefits enrollment.
          </p>
        </div>

        <Button
          onClick={handleDownloadPaystub}
          className="bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold text-xs px-4 h-9"
        >
          <Download className="w-4 h-4 mr-1.5" /> Download Paystub
        </Button>
      </div>

      {/* KPI Pay Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-zinc-950 shadow-md">
          <CardContent className="p-6">
            <p className="text-xs text-zinc-500 font-bold uppercase">Current Pay Period</p>
            <h3 className="text-sm font-bold text-white mt-1">{paystubPeriod}</h3>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950 shadow-md">
          <CardContent className="p-6">
            <p className="text-xs text-green-400 font-bold uppercase">Estimated Net Pay</p>
            <h3 className="text-3xl font-black text-white mt-1">${timesheetSummary.netPay.toFixed(2)}</h3>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950 shadow-md">
          <CardContent className="p-6">
            <p className="text-xs text-brand-orange-400 font-bold uppercase">Billable Therapy Hours</p>
            <h3 className="text-3xl font-black text-white mt-1">{timesheetSummary.billableHours} hrs</h3>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950 shadow-md">
          <CardContent className="p-6">
            <p className="text-xs text-brand-blue-400 font-bold uppercase">Direct Deposit Status</p>
            <h3 className="text-sm font-bold text-green-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Active & Verified
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Enrollment Cards */}
      <Card className="border-white/10 bg-zinc-950 shadow-lg">
        <CardHeader className="pb-4 border-b border-white/5">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Staff Health & Dental Benefits Enrollment
          </CardTitle>
          <p className="text-xs text-zinc-400 mt-1">Health insurance, dental, vision, and 401(k) retirement plans.</p>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-900 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-white text-sm">Medical (PPO Gold)</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-400">Enrolled</span>
            </div>
            <p className="text-xs text-zinc-400">Provider: BlueCross BlueShield</p>
            <p className="text-xs text-zinc-500">Coverage: Employee + Family</p>
          </div>

          <div className="p-4 bg-zinc-900 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-white text-sm">Dental & Vision</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-400">Enrolled</span>
            </div>
            <p className="text-xs text-zinc-400">Provider: Delta Dental / VSP</p>
            <p className="text-xs text-zinc-500">Coverage: Standard Preferred</p>
          </div>

          <div className="p-4 bg-zinc-900 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-white text-sm">401(k) Retirement Plan</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-orange-500/10 text-brand-orange-400">4% Match Active</span>
            </div>
            <p className="text-xs text-zinc-400">Provider: Vanguard</p>
            <p className="text-xs text-zinc-500">Contribution: 5% Per Paycheck</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
