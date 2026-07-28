'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, UserCheck, FileCheck, Award, CreditCard, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export interface OnboardingCandidate {
  id: string;
  name: string;
  email: string;
  bacbVerified: boolean;
  backgroundCleared: boolean;
  trainingsComplete: boolean;
  artemisAccountSetup: boolean;
  payrollComplete: boolean;
  payerCredentialed: boolean;
}

const SAMPLE_ONBOARDING: OnboardingCandidate[] = [
  { id: '1', name: 'David Miller', email: 'david.m@gmail.com', bacbVerified: true, backgroundCleared: true, trainingsComplete: true, artemisAccountSetup: true, payrollComplete: true, payerCredentialed: true },
  { id: '2', name: 'Sarah Jenkins', email: 'sarah.j@gmail.com', bacbVerified: true, backgroundCleared: true, trainingsComplete: false, artemisAccountSetup: false, payrollComplete: true, payerCredentialed: false },
  { id: '3', name: 'Jessica Alba', email: 'jessica.a@outlook.com', bacbVerified: true, backgroundCleared: false, trainingsComplete: false, artemisAccountSetup: false, payrollComplete: false, payerCredentialed: false },
];

export default function RbtOnboardingChecklist() {
  const [candidates, setCandidates] = useState<OnboardingCandidate[]>(SAMPLE_ONBOARDING);

  const toggleCheck = (candidateId: string, field: keyof OnboardingCandidate) => {
    setCandidates(prev => prev.map(c => {
      if (c.id !== candidateId) return c;
      const updatedValue = !c[field];
      toast.success(`Updated checklist item for ${c.name}`);
      return { ...c, [field]: updatedValue };
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-black-800 p-6 rounded-xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-green-400" />
            RBT Compliance & Onboarding Checklist
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Zero-PHI candidate credentialing verification before client staffing assignment.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {candidates.map(candidate => {
          const completedCount = [
            candidate.bacbVerified,
            candidate.backgroundCleared,
            candidate.trainingsComplete,
            candidate.artemisAccountSetup,
            candidate.payrollComplete,
            candidate.payerCredentialed
          ].filter(Boolean).length;

          const isFullyEligible = completedCount === 6;

          return (
            <Card key={candidate.id} className={`border transition-all bg-zinc-950 ${
              isFullyEligible ? 'border-green-500/30 shadow-green-500/5' : 'border-white/10'
            }`}>
              <CardHeader className="pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{candidate.name}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      isFullyEligible 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-brand-orange-500/10 text-brand-orange-400 border-brand-orange-500/20'
                    }`}>
                      {isFullyEligible ? 'Eligible for Assignment ✓' : `Onboarding (${completedCount}/6)`}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{candidate.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-400">Progress:</span>
                  <div className="w-32 h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-500 ${isFullyEligible ? 'bg-green-500' : 'bg-brand-orange-500'}`}
                      style={{ width: `${(completedCount / 6) * 100}%` }}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. BACB Verification */}
                <div 
                  onClick={() => toggleCheck(candidate.id, 'bacbVerified')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    candidate.bacbVerified ? 'bg-green-500/10 border-green-500/30 text-white' : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <Award className={`w-5 h-5 shrink-0 mt-0.5 ${candidate.bacbVerified ? 'text-green-400' : 'text-zinc-500'}`} />
                  <div>
                    <h4 className="text-xs font-bold">1. BACB Credential Verification</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Verified active RBT license on BACB registry.</p>
                  </div>
                </div>

                {/* 2. Background Check */}
                <div 
                  onClick={() => toggleCheck(candidate.id, 'backgroundCleared')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    candidate.backgroundCleared ? 'bg-green-500/10 border-green-500/30 text-white' : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${candidate.backgroundCleared ? 'text-green-400' : 'text-zinc-500'}`} />
                  <div>
                    <h4 className="text-xs font-bold">2. Background & OIG Cleared</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">FBI fingerprinting & OIG exclusion checks.</p>
                  </div>
                </div>

                {/* 3. Clinical & CPR Trainings */}
                <div 
                  onClick={() => toggleCheck(candidate.id, 'trainingsComplete')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    candidate.trainingsComplete ? 'bg-green-500/10 border-green-500/30 text-white' : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <FileCheck className={`w-5 h-5 shrink-0 mt-0.5 ${candidate.trainingsComplete ? 'text-green-400' : 'text-zinc-500'}`} />
                  <div>
                    <h4 className="text-xs font-bold">3. CPR & HIPAA Training</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Completed required safety & HIPAA compliance modules.</p>
                  </div>
                </div>

                {/* 4. Artemis Account Provisioned */}
                <div 
                  onClick={() => toggleCheck(candidate.id, 'artemisAccountSetup')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    candidate.artemisAccountSetup ? 'bg-green-500/10 border-green-500/30 text-white' : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <UserCheck className={`w-5 h-5 shrink-0 mt-0.5 ${candidate.artemisAccountSetup ? 'text-green-400' : 'text-zinc-500'}`} />
                  <div>
                    <h4 className="text-xs font-bold">4. Internal EMR Provisioned</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">User account & session portal credentials active.</p>
                  </div>
                </div>

                {/* 5. Payroll Complete */}
                <div 
                  onClick={() => toggleCheck(candidate.id, 'payrollComplete')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    candidate.payrollComplete ? 'bg-green-500/10 border-green-500/30 text-white' : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 shrink-0 mt-0.5 ${candidate.payrollComplete ? 'text-green-400' : 'text-zinc-500'}`} />
                  <div>
                    <h4 className="text-xs font-bold">5. W-4 / Direct Deposit</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Payroll tax forms & bank routing setup.</p>
                  </div>
                </div>

                {/* 6. Payer Credentialed */}
                <div 
                  onClick={() => toggleCheck(candidate.id, 'payerCredentialed')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    candidate.payerCredentialed ? 'bg-green-500/10 border-green-500/30 text-white' : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${candidate.payerCredentialed ? 'text-green-400' : 'text-zinc-500'}`} />
                  <div>
                    <h4 className="text-xs font-bold">6. Payer Credentialing</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Medicaid & Commercial insurer roster approval.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
