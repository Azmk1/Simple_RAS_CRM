'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { submitMagicLinkPacket } from '@/app/magic-link/actions';
import { UploadCloud, FileText, CheckCircle, ArrowRight, X, Sparkles } from 'lucide-react';
import { IntakeFormWizard } from './IntakeFormWizard';

export function MagicLinkClient({ packet, client }: { packet: any, client: any }) {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [activeForm, setActiveForm] = useState<string | null>(null);

  // 9 items total (2 forms + 7 uploads)
  const totalItems = 9;
  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const progressPct = Math.round((completedCount / totalItems) * 100);
  const isAllComplete = progressPct === 100;

  const toggleComplete = (key: string) => {
    setCompletedItems(prev => ({ ...prev, [key]: true }));
  };

  const markComplete = (key: string) => {
    setCompletedItems(prev => ({ ...prev, [key]: true }));
    setActiveForm(null);
  };

  return (
    <div className="w-full relative z-10">
      
      {/* Immersive Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-orange-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Progress Bar (Sticky & Premium) */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 mb-10 shadow-2xl border border-white/10 sticky top-6 z-30 transition-all duration-500">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-white tracking-wide">Completion Progress</span>
          <div className="flex items-center gap-2">
            {isAllComplete && <Sparkles className="w-4 h-4 text-brand-orange-400 animate-pulse" />}
            <span className={`text-sm font-black ${isAllComplete ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-400 to-brand-blue-400' : 'text-slate-300'}`}>
              {progressPct}%
            </span>
          </div>
        </div>
        <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden inset-shadow">
          <div 
            className="h-full bg-gradient-to-r from-brand-orange-500 via-brand-orange-400 to-brand-blue-500 transition-all duration-1000 ease-out relative"
            style={{ width: `${progressPct}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>

      <form action={submitMagicLinkPacket} className="space-y-10 relative z-10">
        <input type="hidden" name="clientId" value={client.id} />

        <div className="flex flex-col gap-10 md:grid md:grid-cols-2">
          {/* Forms */}
          <div className="space-y-5">
            <h3 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-400 to-brand-orange-600 uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-[1px] bg-brand-orange-500/50" />
              Required Forms
            </h3>
            
            <FormRow 
              title="Client Intake Form (Form 01)" 
              isComplete={!!completedItems['intake']}
              onClick={() => setActiveForm('intake')}
            />
            <FormRow 
              title="Consent & Authorization (Form 02)" 
              isComplete={!!completedItems['consent']}
              onClick={() => setActiveForm('consent')}
            />
          </div>

          {/* Uploads */}
          <div className="space-y-5">
            <h3 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-blue-400 to-brand-blue-600 uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-[1px] bg-brand-blue-500/50" />
              Document Uploads
            </h3>
            
            <UploadRow title="Insurance Card (Front & Back)" dbKey="insurance" isComplete={!!completedItems['insurance']} onChange={() => toggleComplete('insurance')} />
            <UploadRow title="Medicaid Card" subtitle="(if applicable)" dbKey="medicaid" isComplete={!!completedItems['medicaid']} onChange={() => toggleComplete('medicaid')} />
            <UploadRow title="Diagnostic Evaluation Report" dbKey="diag" isComplete={!!completedItems['diag']} onChange={() => toggleComplete('diag')} />
            <UploadRow title="Physician Referral / Prescription" dbKey="rx" isComplete={!!completedItems['rx']} onChange={() => toggleComplete('rx')} />
            <UploadRow title="IEP / IFSP" subtitle="(if applicable)" dbKey="iep" isComplete={!!completedItems['iep']} onChange={() => toggleComplete('iep')} />
            <UploadRow title="Custody/Guardianship Order" subtitle="(if applicable)" dbKey="custody" isComplete={!!completedItems['custody']} onChange={() => toggleComplete('custody')} />
            <UploadRow title="Prior ABA Records" subtitle="(if applicable)" dbKey="prior" isComplete={!!completedItems['prior']} onChange={() => toggleComplete('prior')} />
          </div>
        </div>

        <div className="pt-10">
          <Button 
            type="submit" 
            disabled={!isAllComplete}
            className={`w-full text-lg py-8 font-bold transition-all duration-500 rounded-2xl
              ${isAllComplete 
                ? 'bg-gradient-to-r from-brand-orange-500 to-brand-blue-500 text-white hover:scale-[1.02] shadow-[0_10px_40px_-10px_rgba(255,107,0,0.5)]' 
                : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
              }`}
          >
            {isAllComplete ? 'Submit Secure Packet' : 'Complete all items to submit'}
          </Button>
        </div>
      </form>

      {/* Intake Form Modal (Multi-Step Wizard) */}
      {activeForm === 'intake' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setActiveForm(null)} />
          <div className="bg-[#0f1115] border border-white/10 rounded-[2rem] w-full max-w-3xl h-full max-h-[90vh] shadow-[0_30px_100px_-20px_rgba(0,0,0,1)] flex flex-col overflow-hidden relative z-10 animate-in slide-in-from-bottom-8 duration-300">
            <IntakeFormWizard 
              client={client} 
              onComplete={() => markComplete('intake')}
              onCancel={() => setActiveForm(null)}
            />
          </div>
        </div>
      )}

      {/* Consent Form Modal */}
      {activeForm === 'consent' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setActiveForm(null)} />
          <div className="bg-[#0f1115] border border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[90vh] shadow-[0_30px_100px_-20px_rgba(0,0,0,1)] flex flex-col overflow-hidden relative z-10 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
              <h3 className="font-bold text-white text-lg tracking-wide">Consent & Authorization</h3>
              <button type="button" onClick={() => setActiveForm(null)} className="text-zinc-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 text-slate-300 custom-scrollbar relative">
              
              <div className="space-y-6 text-sm leading-relaxed">
                <div className="bg-black/30 border border-white/5 p-6 rounded-2xl">
                  <h4 className="font-bold text-white text-base mb-3">1. Consent for ABA Assessment and Treatment</h4>
                  <p className="text-slate-400">I authorize Rise & Shine ABA LLC and its Board Certified Behavior Analysts (BCBAs) to provide Applied Behavior Analysis assessment and treatment services to my child.</p>
                </div>
                
                <label className="flex items-start gap-4 p-5 bg-brand-orange-500/5 border border-brand-orange-500/20 hover:border-brand-orange-500/40 hover:bg-brand-orange-500/10 rounded-2xl cursor-pointer transition-all">
                  <input type="checkbox" className="mt-1 w-5 h-5 accent-brand-orange-500 flex-shrink-0" />
                  <p className="text-white font-medium">I have read and consent to all initial assessment, therapy, supervision, and caregiver training policies.</p>
                </label>

                <div className="pt-4">
                  <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-3 ml-1">Digital Signature</h4>
                  <div className="w-full h-40 bg-black/50 border border-white/10 rounded-2xl flex items-center justify-center cursor-crosshair shadow-inner group transition-colors hover:border-brand-orange-500/50 hover:bg-brand-orange-500/5">
                    <span className="text-slate-600 font-signature text-2xl group-hover:text-brand-orange-400/50 transition-colors">Sign Here (Simulated)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/5 bg-white/[0.02]">
              <Button type="button" className="w-full py-6 rounded-xl font-bold bg-brand-orange-500 text-white hover:bg-brand-orange-400 shadow-[0_0_20px_rgba(255,107,0,0.3)] transition-all" onClick={() => markComplete('consent')}>
                Sign & Complete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormRow({ title, isComplete, onClick }: { title: string, isComplete: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-300 group
        ${isComplete 
          ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
          : 'bg-white/5 border-white/10 hover:border-brand-orange-500/50 hover:bg-white/10 hover:shadow-[0_10px_30px_-15px_rgba(255,107,0,0.3)]'
        }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl transition-colors ${isComplete ? 'bg-green-500/20' : 'bg-white/5 group-hover:bg-brand-orange-500/20'}`}>
          <FileText className={`w-5 h-5 ${isComplete ? 'text-green-400' : 'text-slate-400 group-hover:text-brand-orange-400'}`} />
        </div>
        <span className={`text-sm font-medium ${isComplete ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{title}</span>
      </div>
      {isComplete ? (
        <CheckCircle className="w-6 h-6 text-green-400 animate-in zoom-in duration-300" />
      ) : (
        <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-brand-orange-400 group-hover:translate-x-1 transition-all" />
      )}
    </div>
  );
}

function UploadRow({ title, subtitle, dbKey, isComplete, onChange }: { title: string, subtitle?: string, dbKey: string, isComplete: boolean, onChange: () => void }) {
  return (
    <label className={`block p-5 rounded-2xl border cursor-pointer transition-all duration-300 group
      ${isComplete 
        ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
        : 'bg-white/5 border-white/10 hover:border-brand-blue-500/50 hover:bg-white/10 hover:shadow-[0_10px_30px_-15px_rgba(14,165,233,0.3)]'
      }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl transition-colors ${isComplete ? 'bg-green-500/20' : 'bg-white/5 group-hover:bg-brand-blue-500/20'}`}>
            <UploadCloud className={`w-5 h-5 ${isComplete ? 'text-green-400' : 'text-slate-400 group-hover:text-brand-blue-400'}`} />
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${isComplete ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{title}</span>
            {subtitle && <span className="text-[11px] text-slate-500 group-hover:text-brand-blue-400/70 transition-colors mt-0.5">{subtitle}</span>}
          </div>
        </div>
        {isComplete ? (
          <CheckCircle className="w-6 h-6 text-green-400 animate-in zoom-in duration-300" />
        ) : (
          <div className="bg-white/5 group-hover:bg-brand-blue-500 text-slate-400 group-hover:text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all">
            Upload
          </div>
        )}
      </div>
      <input 
        type="file" 
        className="hidden" 
        accept="image/*,.pdf"
        capture="environment" 
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onChange();
          }
        }} 
      />
    </label>
  );
}
