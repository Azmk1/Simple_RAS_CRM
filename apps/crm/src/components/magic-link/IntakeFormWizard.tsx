'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronRight, ChevronLeft, CheckCircle, Save } from 'lucide-react';

export function IntakeFormWizard({ client, onComplete, onCancel }: { client: any, onComplete: () => void, onCancel: () => void }) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const nextStep = () => setStep(s => Math.min(totalSteps, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="flex flex-col h-full">
      {/* Header & Progress */}
      <div className="p-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white text-lg tracking-wide">Client Intake Form</h3>
          <button type="button" onClick={onCancel} className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">
            Cancel
          </button>
        </div>
        
        {/* Step Indicators */}
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden relative">
              <div 
                className={`absolute inset-y-0 left-0 bg-brand-blue-500 transition-all duration-500`}
                style={{ width: i + 1 < step ? '100%' : i + 1 === step ? '50%' : '0%' }}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-brand-blue-400 mt-3 font-semibold uppercase tracking-widest">
          Step {step} of {totalSteps}: {
            step === 1 ? 'Child & Guardian Details' :
            step === 2 ? 'Insurance & Healthcare' :
            step === 3 ? 'Diagnosis & Services' :
            step === 4 ? 'Goals & Availability' :
            'Review & Attestation'
          }
        </p>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-black/20">
        
        {/* STEP 1: Child & Guardian */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <Section title="Section A — Child Information">
              <Input label="Child's Full Legal Name" defaultValue={`${client.firstName} ${client.lastName}`} />
              <Input label="Name your child goes by (if different)" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Date of Birth" type="date" />
                <Select label="Sex Assigned At Birth" options={['Male', 'Female']} />
              </div>
              <Input label="Home Address (Street)" />
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1"><Input label="City" /></div>
                <div className="col-span-1"><Input label="State" /></div>
                <div className="col-span-1"><Input label="Zip" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Primary Language" />
                <Input label="Other Languages" />
              </div>
              <TextArea label="Allergies (List or N/A)" />
              <TextArea label="Current Medications (List or N/A)" />
              <TextArea label="Any Medical Conditions (List or N/A)" />
              <div className="grid grid-cols-2 gap-4">
                <Select label="History of Elopement?" options={['Yes', 'No']} />
                <Input label="Dietary Restrictions (or N/A)" />
              </div>
            </Section>

            <Section title="Section B — Parent / Guardian Info">
              <h4 className="text-sm font-bold text-white mb-2">Guardian 1 (Primary)</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Legal Name" />
                <Input label="Relationship to Child" />
                <Input label="Mobile Phone" type="tel" />
                <Input label="Email Address" type="email" />
              </div>
              <Input label="Address (if different)" />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Preferred Contact" options={['Phone Call', 'Text Message', 'Email', 'Secure Portal']} />
                <Input label="Best Times to Reach" />
              </div>

              <h4 className="text-sm font-bold text-white mt-6 mb-2">Guardian 2 (or N/A)</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Legal Name" />
                <Input label="Relationship to Child" />
                <Input label="Mobile Phone" type="tel" />
                <Input label="Email Address" type="email" />
              </div>
            </Section>

            <Section title="Section C — Legal Custody">
              <Select label="Who has legal custody?" options={['Both Parents', 'Mother Only', 'Father Only', 'Legal Guardian', 'Foster / Kinship', 'Other']} />
              <TextArea label="If shared/restricted, list limits:" />
              <Input label="If consenting person is not a parent, state name/relation:" />
              <Select label="Is there a custody order attached?" options={['Yes - Attached', 'Yes - Will Provide', 'No']} />
            </Section>
          </div>
        )}

        {/* STEP 2: Insurance & Healthcare */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <Section title="Section D — Primary Insurance">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Insurance Company" />
                <Input label="Plan Name" />
                <Input label="Member ID" />
                <Input label="Group Number" />
                <Input label="Policyholder Name" />
                <Input label="Policyholder DOB" type="date" />
                <Input label="Relationship to Child" />
                <Input label="Effective Date" type="date" />
                <Input label="Member Services Phone" />
                <Input label="Employer" />
              </div>
            </Section>

            <Section title="Section E & F — Secondary & Medicaid">
              <Select label="Have a secondary commercial plan?" options={['Yes', 'No']} />
              <Select label="Does child have Medicaid?" options={['Yes - NY', 'Yes - NJ', 'Yes - Other', 'No']} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Medicaid ID / CIN" />
                <Input label="State" />
                <Input label="MCO / Plan Name (e.g. Fidelis)" className="col-span-2" />
              </div>
              <Select label="Has Medicaid ever lapsed?" options={['Yes', 'No', 'Not Sure']} />
            </Section>

            <Section title="Section G — Primary Care Physician">
              <div className="grid grid-cols-2 gap-4">
                <Input label="PCP Name" />
                <Input label="Practice Name" />
                <Input label="Phone" type="tel" />
                <Input label="Fax" type="tel" />
              </div>
              <Input label="Address" />
              <Input label="Date of last well visit" type="date" />
            </Section>
          </div>
        )}

        {/* STEP 3: Diagnosis & Prior Services */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <Section title="Section H — Diagnosis">
              <Select label="Formal Autism Diagnosis?" options={['Yes', 'No', 'Evaluation Scheduled']} />
              <Input label="Diagnosis exactly as written on report" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Date of Initial Diagnosis" type="date" />
                <Input label="Date of Most Recent Eval" type="date" />
                <Input label="Diagnosing Provider Name" />
                <Input label="Credentials (MD, PhD, etc)" />
              </div>
              <Input label="Additional Diagnoses (ADHD, Anxiety, etc)" />
            </Section>

            <Section title="Section I — Referral / Prescription">
              <Select label="Written Referral for ABA?" options={['Yes - Attached', 'Yes - Will Provide', 'No']} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Referring Provider" />
                <Input label="Date of Referral" type="date" />
              </div>
            </Section>

            <Section title="Section J — Prior Services">
              <Select label="Has child received ABA before?" options={['Yes', 'No']} />
              <TextArea label="If yes, Provider, Dates, Reason Ended:" />
              <Input label="Current Services (e.g. Speech, OT, PT)" placeholder="Check all that apply" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="School / Program Name" />
                <Input label="Grade" />
              </div>
              <Select label="Does child have an IEP or IFSP?" options={['Yes - Attached', 'Yes - Will Provide', 'No']} />
            </Section>
          </div>
        )}

        {/* STEP 4: Goals, Availability & Emergency */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <Section title="Section K — Goals & Priorities">
              <TextArea label="Are there behaviors that are unsafe? Describe:" />
              <TextArea label="What does your child enjoy? (Toys, foods, music)" />
            </Section>

            <Section title="Section L — Availability">
              <Select label="Preferred Service Location" options={['Home', 'Clinic', 'School', 'Community', 'Telehealth']} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Quiet space available at home?" options={['Yes', 'No']} />
                <Input label="Any pets? Type:" />
              </div>
              <Input label="Who else is typically home during sessions?" />
              
              <div className="mt-4 border border-white/5 rounded-xl overflow-hidden bg-black/30">
                <div className="grid grid-cols-3 gap-1 bg-white/5 p-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <div>Day</div>
                  <div>Available From</div>
                  <div>Available Until</div>
                </div>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className="grid grid-cols-3 gap-1 p-2 border-t border-white/5 items-center">
                    <div className="text-sm text-slate-300 pl-2">{day}</div>
                    <input type="time" className="bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-brand-blue-500 text-sm" />
                    <input type="time" className="bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-brand-blue-500 text-sm" />
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Section M — Emergency Contacts">
              <div className="grid grid-cols-3 gap-4">
                <Input label="Contact 1 Name" />
                <Input label="Relationship" />
                <Input label="Phone" type="tel" />
                <Input label="Contact 2 Name" />
                <Input label="Relationship" />
                <Input label="Phone" type="tel" />
              </div>
              <Input label="Preferred Hospital (if any)" />
            </Section>
          </div>
        )}

        {/* STEP 5: Attestation */}
        {step === 5 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <Section title="Section O — Parent / Guardian Attestation">
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                I certify that the information I have provided on this form is true, accurate, and complete to the best of my knowledge. I understand that Rise & Shine ABA will rely on this information to verify insurance coverage and request authorization for services, and that inaccurate information may delay or prevent my child from receiving care.
              </p>
              
              <label className="flex items-start gap-4 p-5 bg-brand-blue-500/5 border border-brand-blue-500/20 hover:border-brand-blue-500/40 rounded-2xl cursor-pointer transition-all">
                <input type="checkbox" className="mt-1 w-5 h-5 accent-brand-blue-500 flex-shrink-0" />
                <p className="text-white font-medium text-sm">I agree to the attestation statement above and will notify Rise & Shine promptly of any changes.</p>
              </label>

              <div className="mt-8">
                <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-3 ml-1">Digital Signature</h4>
                <div className="w-full h-40 bg-black/50 border border-white/10 rounded-2xl flex items-center justify-center cursor-crosshair shadow-inner group transition-colors hover:border-brand-blue-500/50 hover:bg-brand-blue-500/5">
                  <span className="text-slate-600 font-signature text-3xl group-hover:text-brand-blue-400/50 transition-colors">Sign Here (Simulated)</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input label="Printed Name" />
                  <Input label="Date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
            </Section>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-between gap-4">
        {step > 1 ? (
          <Button type="button" variant="secondary" onClick={prevStep} className="flex-1 max-w-[140px] bg-white/5 hover:bg-white/10 border-white/10 text-white">
            <ChevronLeft className="w-5 h-5 mr-1" /> Back
          </Button>
        ) : <div className="flex-1 max-w-[140px]" />}

        {step < totalSteps ? (
          <Button type="button" onClick={nextStep} className="flex-1 bg-brand-blue-500 hover:bg-brand-blue-400 text-white">
            Next Step <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <Button type="button" onClick={onComplete} className="flex-1 bg-green-500 hover:bg-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <CheckCircle className="w-5 h-5 mr-2" /> Complete & Save
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper UI Components
function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-blue-400 to-brand-blue-600 uppercase tracking-widest flex items-center gap-2 mb-6">
        <span className="w-6 h-[1px] bg-brand-blue-500/50" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Input({ label, type = "text", className = "", ...props }: any) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
      <input 
        type={type} 
        className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-brand-blue-500 focus:bg-brand-blue-500/5 transition-all shadow-inner text-sm" 
        {...props} 
      />
    </div>
  );
}

function TextArea({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
      <textarea 
        className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-brand-blue-500 focus:bg-brand-blue-500/5 transition-all shadow-inner text-sm h-24 resize-none" 
        {...props} 
      />
    </div>
  );
}

function Select({ label, options, className = "" }: any) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
      <select className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-brand-blue-500 focus:bg-brand-blue-500/5 transition-all shadow-inner appearance-none text-sm">
        <option value="">Select...</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
