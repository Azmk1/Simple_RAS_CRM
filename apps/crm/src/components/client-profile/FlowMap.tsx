'use client';

import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 'DOCS_SUBMITTED', label: 'Docs Rcvd', dept: 'Intake' },
  { id: 'DOCS_APPROVED_INTAKE', label: 'Clin Review', dept: 'Clinical' },
  { id: 'PA_SUBMITTED', label: 'Assess PA', dept: 'Billing' },
  { id: 'ASSESSMENT_SCHEDULED', label: 'Assessment', dept: 'BCBA' },
  { id: 'REPORT_ASSEMBLED', label: 'Tx Plan', dept: 'Clin Supp' },
  { id: 'TX_PA_SUBMITTED', label: 'Tx PA', dept: 'Billing' },
  { id: 'STAFFING_PENDING', label: 'Staffing', dept: 'Case Coord' },
  { id: 'ACTIVE', label: 'Active', dept: 'Clinical' }
];

const SOP_DICTIONARY: Record<string, { title: string, content: string }> = {
  'INQUIRY': { title: 'Initial Intake', content: 'Collect initial client details (Child Name, Parent Info) and ensure demographics are accurate before proceeding.' },
  'MAGIC_LINK_SENT': { title: 'Magic Link Dispatch', content: 'Generate and send the secure Magic Link to the parent so they can upload their diagnostic documents and insurance cards.' },
  'DOCS_SUBMITTED': { title: 'Document Review', content: 'Parent has submitted documents. Intake Coordinator must review the Insurance Card, Medicaid Card, and Diagnostic Eval for validity.' },
  'DOCS_APPROVED_INTAKE': { title: 'Clinical Assessment', content: 'BCBA reviews the diagnostic eval to determine medical necessity. Clears case for Prior Authorization.' },
  'CLINICAL_REVIEW_APPROVED': { title: 'Clinical Review Approved', content: 'Clinical Director approved the case. Awaiting VOB completion.' },
  'VOB_COMPLETED': { title: 'VOB Completed', content: 'Billing verified Eligibility & Benefits (VOB). Awaiting submission of CPT 97151 PA Request.' },
  'PA_SUBMITTED': { title: 'Prior Auth — Assessment', content: 'Billing team submits CPT 97151 to the payer and awaits approval.' },
  'PA_APPROVED': { title: 'Assessment PA Approved', content: 'Payer approved the Assessment PA. Awaiting BCBA scheduling.' },
  'ASSESSMENT_SCHEDULED': { title: 'Assessment', content: 'BCBA schedules Meet & Greet, performs 97151 Assessment, and writes the Treatment Plan.' },
  'REPORT_ASSEMBLED': { title: 'Report Assembly', content: 'Clinical Support complies the Treatment Plan, obtains BCBA and Parent signatures, and prepares the final packet.' },
  'TX_PA_SUBMITTED': { title: 'Prior Auth — Treatment', content: 'Billing team submits the full Treatment Plan to the payer to request authorization for recurring therapy codes.' },
  'TX_PA_APPROVED': { title: 'Treatment PA Approved', content: 'Payer approved the Treatment PA. Client moves to Staffing.' },
  'STAFFING_PENDING': { title: 'Staffing & Scheduling', content: 'HR assigns an RBT Candidate. Case Coordinator conducts Meet & Greet, approves the candidate, and activates the client.' },
  'ACTIVE': { title: 'Active Therapy', content: 'Client is fully active in ongoing therapy.' }
};

export default function FlowMap({ client }: { client: any }) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // Calculate dynamic status based on packet rejections
  // NOTE: intakePacket is a single object (one-to-one relation), NOT an array
  let effectiveStatus = client.status;
  let dynamicLabelOverrides: Record<string, string> = {};

  // High-level pipeline node mapping for intermediate statuses
  if (effectiveStatus === 'INQUIRY' || effectiveStatus === 'MAGIC_LINK_SENT') {
    effectiveStatus = 'DOCS_SUBMITTED';
    dynamicLabelOverrides['DOCS_SUBMITTED'] = 'Awaiting Docs';
  }
  if (effectiveStatus === 'CLINICAL_REVIEW_APPROVED' || effectiveStatus === 'VOB_COMPLETED') {
    effectiveStatus = 'PA_SUBMITTED';
    if (client.status === 'CLINICAL_REVIEW_APPROVED') dynamicLabelOverrides['PA_SUBMITTED'] = 'Pending VOB';
    else if (client.status === 'VOB_COMPLETED') dynamicLabelOverrides['PA_SUBMITTED'] = 'Needs PA Sub';
  }
  if (effectiveStatus === 'PA_APPROVED') {
    effectiveStatus = 'ASSESSMENT_SCHEDULED';
    dynamicLabelOverrides['ASSESSMENT_SCHEDULED'] = 'PA Appr\'d';
  }
  if (effectiveStatus === 'TX_PA_APPROVED') {
    effectiveStatus = 'STAFFING_PENDING';
    dynamicLabelOverrides['STAFFING_PENDING'] = 'Auth Granted';
  }
  if (effectiveStatus === 'DISCHARGED') {
    effectiveStatus = 'ACTIVE';
    dynamicLabelOverrides['ACTIVE'] = 'Discharged';
  }
  
  const packet = client.intakePacket; // direct object, not array
  if (packet) {
    // Parse rejectionDetails safely just in case it's stringified JSON
    let parsedRejections: Record<string, string> = {};
    if (typeof packet.rejectionDetails === 'string') {
      try { parsedRejections = JSON.parse(packet.rejectionDetails); } catch(e) {}
    } else if (typeof packet.rejectionDetails === 'object' && packet.rejectionDetails !== null) {
      parsedRejections = packet.rejectionDetails as Record<string, string>;
    }
    const hasRejections = Object.keys(parsedRejections).length > 0;
    
    // If packet is pending client submission, roll back visually only if they are not yet in Clinical
    if (packet.status === 'PENDING_CLIENT_SUBMISSION') {
      const pastIntakeStatuses = ['DOCS_APPROVED_INTAKE', 'CLINICAL_REVIEW_APPROVED', 'VOB_COMPLETED', 'PA_SUBMITTED', 'PA_APPROVED', 'ASSESSMENT_SCHEDULED', 'REPORT_ASSEMBLED', 'ACTIVE'];
      
      if (pastIntakeStatuses.includes(client.status)) {
        dynamicLabelOverrides[client.status] = 'Changes Needed';
      } else {
        effectiveStatus = 'DOCS_SUBMITTED';
        if (hasRejections || client.status === 'DOCS_SUBMITTED') {
          dynamicLabelOverrides['DOCS_SUBMITTED'] = 'Changes Needed';
        } else {
          dynamicLabelOverrides['DOCS_SUBMITTED'] = 'Awaiting Docs';
        }
      }
    } else if (packet.status === 'SUBMITTED') {
      if (client.status === 'DOCS_APPROVED_INTAKE') {
        effectiveStatus = 'CLINICAL_REVIEW_APPROVED';
        dynamicLabelOverrides['CLINICAL_REVIEW_APPROVED'] = 'Review Needed';
      } else if (client.status === 'DOCS_SUBMITTED' || client.status === 'MAGIC_LINK_SENT') {
        effectiveStatus = 'DOCS_SUBMITTED';
        dynamicLabelOverrides['DOCS_SUBMITTED'] = 'Review Needed';
      }
    }
  }

  const currentIndex = PIPELINE_STEPS.findIndex(s => s.id === effectiveStatus);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const pctComplete = Math.round(((safeIndex + 1) / PIPELINE_STEPS.length) * 100);

  return (
    <div className="glass-panel px-[28px] py-[26px] mb-[22px]">
      <div className="flex items-center justify-between mb-[24px]">
        <div className="font-mono text-[11px] font-semibold tracking-[1.8px] text-[var(--ink-500)]">
          MASTER PIPELINE
        </div>
        <div className="font-mono text-[11px] text-[var(--dawn-hot)]">
          STAGE {safeIndex + 1} / {PIPELINE_STEPS.length} · {pctComplete}% COMPLETE
        </div>
      </div>

      <div className="relative h-[4px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mx-[21px] mb-[32px]">
        <div 
          className="absolute top-0 left-0 h-full rounded-[2px] shadow-[0_0_12px_rgba(255,122,69,0.5)] transition-all duration-1000"
          style={{ width: `${pctComplete}%`, background: 'var(--grad-horizon)' }}
        />
      </div>

      <div className="flex justify-between relative">
        {PIPELINE_STEPS.map((step, idx) => {
          const isCompleted = idx < safeIndex;
          const isCurrent = idx === safeIndex;
          const isSelected = selectedNode === step.id;
          
          const label = dynamicLabelOverrides[step.id] || step.label;
          const isChangesNeeded = label === 'Changes Needed';
          
          // Determine colors based on changes needed state
          const activeBg = isChangesNeeded ? 'bg-red-500/10' : 'bg-[var(--navy-950)]';
          const activeBorder = isChangesNeeded ? 'border-red-500' : 'border-[var(--dawn)]';
          const activeText = isChangesNeeded ? 'text-red-500' : 'text-[var(--dawn-hot)]';
          const activeShadow = isChangesNeeded ? 'shadow-[0_0_0_5px_rgba(239,68,68,0.12),_0_0_20px_rgba(239,68,68,0.55)]' : 'shadow-[0_0_0_5px_rgba(255,122,69,0.12),_0_0_20px_rgba(255,122,69,0.55)]';

          const labelColor = (isCurrent || isSelected) 
            ? (isChangesNeeded ? 'text-red-500' : 'text-[var(--dawn-hot)]') 
            : 'text-[var(--ink-300)]';

          return (
            <div key={step.id} className={`flex flex-col items-center gap-[9px] w-full relative ${isCurrent ? 'current' : ''}`}>
              <button 
                suppressHydrationWarning
                onClick={() => setSelectedNode(step.id)}
                className={`w-[32px] h-[32px] rounded-[9px] flex items-center justify-center font-mono text-[12px] font-semibold transition-[0.2s] relative z-[2] -mt-[22px] cursor-pointer outline-none
                  ${isCompleted ? 'bg-[rgba(255,122,69,0.14)] border border-[rgba(255,122,69,0.45)] text-[var(--dawn-hot)]' : 
                    isCurrent ? `${activeBg} border ${activeBorder} ${activeText} ${activeShadow} animate-pulse-glow` : 
                    'bg-[var(--navy-800)] border border-[var(--line-hi)] text-[var(--ink-500)] hover:bg-[rgba(255,255,255,0.05)]'}
                `}
              >
                {isCompleted ? '✓' : (idx + 1)}
              </button>
              
              <div>
                <div className="font-mono text-[9px] font-medium tracking-[1px] text-[var(--ink-500)] uppercase text-center">
                  {step.dept}
                </div>
                <div className={`text-[11.5px] font-semibold mt-[2px] text-center ${labelColor}`}>
                  {label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded SOP Panel */}
      {selectedNode && (
        <div className="mt-[32px] pt-[24px] border-t border-[var(--line)] animate-slide-up">
          <div className="bg-[rgba(0,0,0,0.25)] rounded-[11px] p-[20px] border border-[var(--line)]">
            <div className="flex justify-between items-center mb-[14px]">
              <h2 className="font-mono text-[10px] font-semibold tracking-[1px] text-[var(--ink-500)] uppercase flex items-center">
                <FileText className="w-[14px] h-[14px] mr-[8px] opacity-70" />
                SOP Instructions: {PIPELINE_STEPS.find(s => s.id === selectedNode)?.label}
              </h2>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-[var(--ink-500)] hover:text-[var(--ink-100)] transition-colors"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
            
            <h3 className="font-heading text-[17px] font-semibold text-[var(--ink-100)] mb-[8px]">
              {SOP_DICTIONARY[selectedNode]?.title || 'Unknown Step'}
            </h3>
            
            <p className="text-[var(--ink-300)] text-[13.5px] leading-[1.65]">
              {SOP_DICTIONARY[selectedNode]?.content || 'Instructions not defined for this step.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
