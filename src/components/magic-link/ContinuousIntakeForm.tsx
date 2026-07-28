'use client';

import React, { useState, useEffect } from 'react';

import { CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Form01ClientIntake } from './Form01ClientIntake';
import { Form02Consent } from './Form02Consent';
import { DocumentUploads } from './DocumentUploads';
import { toast } from 'sonner';

import { saveIntakeProgress, submitIntakePacket, submitForm01, submitForm02 } from '@/app/actions/intake';

import './redesign.css';

const ALL_MACRO_SECTIONS = [
  { id: 'sec-a', label: 'Form 01: Client Intake' },
  { id: 'consent-1', label: 'Consent & Authorization' },
  { id: 'docs', label: 'Document Uploads' }
];

export function ContinuousIntakeForm({ packet, client }: { packet: any, client: any }) {
  const [isSubmitting, startTransition] = React.useTransition();
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    try {
      const parsed = typeof packet.formData === 'string' ? JSON.parse(packet.formData) : (packet.formData || {});
      
      // Inject default client values if they are completely missing from the parsed form data
      if (parsed['childName'] === undefined) {
        parsed['childName'] = `${client.firstName || ''} ${client.lastName || ''}`.trim();
      }
      if (parsed['dob'] === undefined && client.dateOfBirth) {
        parsed['dob'] = new Date(client.dateOfBirth).toISOString().split('T')[0];
      }
      if (parsed['g1Name'] === undefined && client.guardianName) {
        parsed['g1Name'] = client.guardianName;
      }
      if (parsed['g1Phone'] === undefined && client.guardianPhone) {
        parsed['g1Phone'] = client.guardianPhone;
      }
      if (parsed['g1Email'] === undefined && client.guardianEmail) {
        parsed['g1Email'] = client.guardianEmail;
      }
      if (parsed['priInsCompany'] === undefined && client.insurancePayer) {
        parsed['priInsCompany'] = client.insurancePayer;
      }
      if (parsed['priInsMemberId'] === undefined && client.memberId) {
        parsed['priInsMemberId'] = client.memberId;
      }

      return parsed;
    } catch {
      return {};
    }
  });

  const formDataRef = React.useRef(formData);
  React.useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const rejectionDetails = packet?.rejectionDetails && typeof packet.rejectionDetails === 'object' ? packet.rejectionDetails : {};
  const rejectedFieldsList = Object.keys(rejectionDetails)
    .filter(k => k.startsWith('formField_'))
    .map(k => k.replace('formField_', ''));

  const form02FieldKeys = [
    'cpt97151', 'cpt97153', 'cpt97155', 'cpt97156', 'cpt97157', 'cpt97158', 'cpt97154', 
    'photoInitial', 'cancelInitial', 'hipaaInitial', 'eSignInitial', 'sig1Name', 'sig1Date'
  ];
  const hasForm02Rejected = rejectedFieldsList.some(f => form02FieldKeys.includes(f));
  const hasForm01Rejected = rejectedFieldsList.some(f => !form02FieldKeys.includes(f) && f !== 'globalInitials');

  const hasDocsRejected = Object.keys(rejectionDetails).length > rejectedFieldsList.length;

  const isRejectionMode = packet.status === 'PENDING_CLIENT_SUBMISSION' && Object.keys(rejectionDetails).length > 0;

  const MACRO_SECTIONS = ALL_MACRO_SECTIONS.filter(sec => {
    if (!isRejectionMode) return true;
    if (sec.id === 'sec-a') return hasForm01Rejected;
    if (sec.id === 'consent-1') return hasForm02Rejected;
    if (sec.id === 'docs') return hasDocsRejected;
    return false;
  });

  const [activeMacro, setActiveMacro] = useState(MACRO_SECTIONS[0]?.id || 'sec-a');

  // Track submission states to lock forms
  // If packet is pending client submission, forms might be locked if not rejected
  const isPending = packet.status === 'PENDING_CLIENT_SUBMISSION';
  const [isForm1Submitted, setIsForm1Submitted] = useState(!isPending && packet.intakeFormComplete);
  const [isForm2Submitted, setIsForm2Submitted] = useState(!isPending && packet.consentFormComplete);
  
  const handleBlur = async (fieldId: string | Record<string, any>, value?: any) => {
    let updated: any;
    
    if (typeof fieldId === 'string') {
      updated = { ...formDataRef.current, [fieldId]: value };
    } else {
      updated = { ...formDataRef.current, ...fieldId };
    }
    
    formDataRef.current = updated;
    setFormData(updated);
    
    try {
      await saveIntakeProgress(packet.id, updated);
    } catch (e) {
      console.error(e);
    }
  };

  const getForm01RequiredFields = () => {
    const req = [
      'childName', 'dob', 'sexAtBirth', 'primaryLang', 'elopement',
      'g1Name', 'g1Phone', 'g1Email', 'g1ContactPref',
      'custodyType', 'custodyDocAttached',
      'priInsCompany', 'priInsMemberId', 'hasSecondPlan', 'hasMedicaid',
      'hasDiagnosis', 'hasReferral', 'hasPriorABA', 'hasIEP',
      'prefLocation', 'em1Name', 'em1Phone', 'emPermission',
      'attestationAgree', 'attestationName', 'attestationDate'
    ];
    if (!formData['childLivesWithParents']) req.push('childAddress');
    if (formData['hasMedicaid'] === 'Yes') req.push('medicaidMCO');
    if (formData['hasDiagnosis'] === 'Yes') req.push('dxInitialDate', 'dxRecentDate', 'dxProviderName', 'dxPracticeName');
    if (formData['hasReferral'] === 'Yes') req.push('referralProvider', 'referralDate', 'referralExpires');
    if (formData['hasReferral'] === 'Yes' && formData['referralExpires'] === 'Yes') req.push('referralExpDate');
    if (formData['prefLocation'] === 'Home') req.push('quietSpace', 'hasPets', 'othersHome');
    return req;
  };

  const form01Req = getForm01RequiredFields();
  const form01TotalCount = form01Req.length;
  const form01CompletedCount = form01Req.filter(f => !!formData[f]).length;
  const form01Complete = form01CompletedCount === form01TotalCount;

  const getForm02RequiredFields = () => {
    const req = [
      'sig1Name',
      'cpt97151', 'cpt97153', 'cpt97155', 'cpt97156', 'cpt97154',
      'locHome', 'locClinic', 'locCommunity', 'locSchool',
      'mediaClinical', 'mediaTraining', 'mediaPhotos', 'mediaMarketing', 'mediaObservation',
      'hipaaAck', 'phiInsurance', 'phiBilling', 'phiPcp', 'phiDiagnosing', 'phiSchool', 'phiOtherTherapies',
      'aobInitial', 'attendanceInitial',
      'commPhone', 'commSms', 'commEmail', 'commPortal',
      'emergencyInitial', 'eSignInitial'
    ];
    return req;
  };

  const form02Req = getForm02RequiredFields();
  const form02TotalCount = form02Req.length + 1; // +1 for Telehealth Consent OR Decline
  const form02CompletedCount = form02Req.filter(f => !!formData[f]).length + (formData['telehealthConsent'] || formData['telehealthDecline'] ? 1 : 0);
  const form02Complete = form02CompletedCount === form02TotalCount;

  const hasMedicaid = formData['hasMedicaid'] && formData['hasMedicaid'] !== 'No' && formData['hasMedicaid'] !== 'Not Sure';
  const hasCustodyDoc = formData['custodyDocAttached'] === 'Yes — Attached' || formData['custodyDocAttached'] === 'Yes — Will Provide';
  const hasIEP = formData['hasIEP'] === 'Yes — Attached' || formData['hasIEP'] === 'Yes — Will Provide';
  const hasPriorABA = formData['hasPriorABA'] === 'Yes';
  
  let docsTotalCount = 5; // docInsuranceFront, docInsuranceBack, docEval, docReferral, sig1Name (Form 02)
  let docsCompletedCount = [
    !!formData['docInsuranceFront'], 
    !!formData['docInsuranceBack'], 
    !!formData['docEval'], 
    !!formData['docReferral'], 
    !!formData['sig1Name']
  ].filter(Boolean).length;

  if (hasMedicaid) { docsTotalCount += 2; if (!!formData['docMedicaidFront']) docsCompletedCount++; if (!!formData['docMedicaidBack']) docsCompletedCount++; }
  if (hasIEP) { docsTotalCount++; if (!!formData['docIEP']) docsCompletedCount++; }
  if (hasCustodyDoc) { docsTotalCount++; if (!!formData['docCustody']) docsCompletedCount++; }
  if (hasPriorABA) { docsTotalCount++; if (!!formData['docPriorABA']) docsCompletedCount++; }
  
  const docsComplete = docsCompletedCount === docsTotalCount;

  const overallComplete = form01Complete && form02Complete && docsComplete; 

  const getStatus = (id: string) => {
    if (id === 'sec-a') return form01Complete;
    if (id === 'consent-1') return form02Complete;
    if (id === 'docs') return docsComplete;
    return false;
  };

  const getCompletedCount = () => {
    return [form01Complete, form02Complete, docsComplete].filter(Boolean).length;
  };

  const handleNext = () => {
    const currentIndex = MACRO_SECTIONS.findIndex(s => s.id === activeMacro);
    if (currentIndex < MACRO_SECTIONS.length - 1) {
      setActiveMacro(MACRO_SECTIONS[currentIndex + 1].id);
      window.scrollTo({ top: 0 });
    }
  };
  const handlePrev = () => {
    const currentIndex = MACRO_SECTIONS.findIndex(s => s.id === activeMacro);
    if (currentIndex > 0) {
      setActiveMacro(MACRO_SECTIONS[currentIndex - 1].id);
      window.scrollTo({ top: 0 });
    }
  };

  // Mobile progress tracking
  const activeIndex = MACRO_SECTIONS.findIndex(s => s.id === activeMacro);
  const isLastSection = activeIndex === MACRO_SECTIONS.length - 1;
  const progressPercent = ((getCompletedCount()) / 3) * 100;

  return (
    <div className="magic-link-wrapper">
      <div className="wrap" id="frame">
        
        {/* Mobile-only sticky progress */}
        <div className="mobile-bar">
          <div className="mobile-bar-top">
            <span className="mobile-bar-step">STEP {activeIndex + 1} · {MACRO_SECTIONS[activeIndex].label.split(':')[0]}</span>
            <span className="mobile-bar-count">{getCompletedCount()} / 3 done</span>
          </div>
          <div className="mobile-bar-track"><div style={{ width: `${progressPercent}%` }}></div></div>
        </div>

        <div className="hero">
          <h1>Secure Intake Portal</h1>
          <div className="for">
            CHILD: {(client.firstName + ' ' + client.lastName).toUpperCase()} &nbsp;|&nbsp; PARENT: {((formData['g1Name'] || client.guardianName) || 'Loading...').toUpperCase()}
          </div>
          <div className="sub">Please answer every question — your progress saves automatically as you go.</div>
        </div>

        <div className="layout">
          {/* Desktop rail */}
          <div className="rail glass">
            <div className="rail-title">Intake Progress</div>
            <div className="rail-overall">{form01CompletedCount}/{form01TotalCount} · {form02CompletedCount}/{form02TotalCount} · {docsCompletedCount}/{docsTotalCount} complete</div>

            {MACRO_SECTIONS.map((sec, idx) => {
              const isActive = activeMacro === sec.id;
              const isComplete = getStatus(sec.id);
              
              let completedCount = 0;
              let totalCount = 1;
              if (sec.id === 'sec-a') { completedCount = form01CompletedCount; totalCount = form01TotalCount; }
              if (sec.id === 'consent-1') { completedCount = form02CompletedCount; totalCount = form02TotalCount; }
              if (sec.id === 'docs') { completedCount = docsCompletedCount; totalCount = docsTotalCount; }
              
              const progressPct = (completedCount / totalCount) * 100;
              
              let stepClass = "rail-step";
              if (isComplete) stepClass += " done";
              else if (isActive) stepClass += " active";

              return (
                <div key={sec.id} className={stepClass} onClick={() => { setActiveMacro(sec.id); window.scrollTo({ top: 0 }); }}>
                  <div className="rail-step-top">
                    <div className="rail-dot">
                      {isComplete ? (
                        <div className="w-[16px] h-[16px] rounded-full bg-[rgba(79,232,206,0.15)] flex items-center justify-center text-[var(--teal)]">
                          <CheckCircle2 size={12} />
                        </div>
                      ) : ''}
                    </div>
                    <div>
                      <div className="rail-label">Step {idx + 1}</div>
                      <div className="rail-name">{sec.label}</div>
                    </div>
                  </div>
                  <div className="rail-progress">
                    <div style={{ width: `${progressPct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main content */}
          <div>
            {activeMacro === 'sec-a' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Form01ClientIntake 
                  formData={formData} 
                  handleBlur={handleBlur} 
                  client={client} 
                  readOnly={isForm1Submitted} 
                  isRejectionMode={isRejectionMode}
                  rejectedFields={rejectedFieldsList} 
                />
                <div className="step-nav">
                  <div></div> {/* Spacer */}
                  <button 
                    disabled={isLastSection ? !overallComplete : (form01CompletedCount < form01TotalCount)}
                    onClick={async () => {
                      let finalData = formData;
                      if (!isForm1Submitted) {
                        if (form01CompletedCount < form01TotalCount) return;
                        
                        // Default any missing optional fields to "N/A"
                        const form01AllFields = [
                          'childName', 'childPrefName', 'dob', 'sexAtBirth', 
                          'childAddress', 'childCity', 'childState', 'childZip', 
                          'primaryLang', 'otherLanguages', 'elopement',
                          'g1Name', 'g1Rel', 'g1Phone', 'g1Email', 'g1Address', 'g1ContactPref',
                          'g2Name', 'g2Rel', 'g2Phone', 'g2Email', 'g2Address',
                          'custodyType', 'custodyDocAttached',
                          'priInsCompany', 'priInsMemberId', 'priInsGroup', 'priInsHolderName', 'priInsHolderDob', 'priInsHolderRel',
                          'hasSecondPlan', 'secInsCompany', 'secInsMemberId', 'secInsGroup', 'secInsHolderName', 'secInsHolderDob', 'secInsHolderRel',
                          'hasMedicaid', 'medicaidId', 'medicaidMco',
                          'hasDiagnosis', 'diagnosisName', 'diagnosingProvider', 'diagnosisDate',
                          'hasReferral', 'referringProvider',
                          'hasPriorABA', 'priorAbaProvider', 'priorAbaDates',
                          'hasIEP', 'schoolName', 'schoolDistrict',
                          'currentServices', 'pediatricianName', 'pediatricianPhone'
                        ];

                        const updatedFormData = { ...formData };
                        form01AllFields.forEach(field => {
                          const val = updatedFormData[field];
                          if (!val || (typeof val === 'string' && val.trim() === '')) {
                            updatedFormData[field] = 'N/A';
                          }
                        });
                        setFormData(updatedFormData);
                        finalData = updatedFormData;

                        await submitForm01(packet.id, updatedFormData);
                        setIsForm1Submitted(true);
                      }
                      
                      if (isLastSection) {
                        if (overallComplete) {
                          await submitIntakePacket(packet.id, finalData);
                          window.location.href = `?success=true`;
                        }
                      } else {
                        handleNext();
                      }
                    }} 
                    className="btn btn-primary"
                  >
                    {form01CompletedCount < form01TotalCount ? 'Complete Form 01 to continue' : (isLastSection ? 'Submit Updates' : 'Continue to Consent →')}
                  </button>
                </div>
              </div>
            )}

            {activeMacro === 'consent-1' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Form02Consent 
                  formData={formData} 
                  handleBlur={handleBlur} 
                  client={client} 
                  readOnly={isForm2Submitted} 
                  isRejectionMode={isRejectionMode}
                  rejectedFields={rejectedFieldsList}
                />
                <div className="step-nav">
                  {activeIndex > 0 && <button onClick={handlePrev} className="btn btn-ghost">← Back</button>}
                  {activeIndex === 0 && <div></div>}
                  <button 
                    disabled={isLastSection ? !overallComplete || isSubmitting : (form02CompletedCount < form02TotalCount)}
                    onClick={() => {
                      if (!isForm2Submitted) {
                        if (form02CompletedCount < form02TotalCount) return;
                        submitForm02(packet.id, formData).then(() => setIsForm2Submitted(true));
                      }
                      if (isLastSection) {
                        if (overallComplete) {
                          startTransition(async () => {
                            const res = await submitIntakePacket(packet.id, formData);
                            if (res.success) {
                              window.location.href = `?success=true`;
                            } else {
                              toast.error(res.error?.toString() || 'Failed to submit packet');
                            }
                          });
                        }
                      } else {
                        handleNext();
                      }
                    }} 
                    className="btn btn-primary"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> : null}
                    {form02CompletedCount < form02TotalCount ? 'Complete Consent to continue' : (isLastSection ? 'Submit Updates' : 'Continue to Uploads →')}
                  </button>
                </div>
              </div>
            )}

            {activeMacro === 'docs' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DocumentUploads formData={formData} handleBlur={handleBlur} rejectionDetails={rejectionDetails} isRejectionMode={isRejectionMode} />
                <div className="step-nav" style={{marginTop: '40px'}}>
                  {activeIndex > 0 && <button onClick={handlePrev} className="btn btn-ghost">← Back</button>}
                  {activeIndex === 0 && <div></div>}
                  <button 
                    disabled={!overallComplete || isSubmitting} 
                    onClick={() => { 
                      if (!overallComplete) return;
                      startTransition(async () => {
                        await handleBlur('sig1Date', new Date().toISOString());
                        const res = await submitIntakePacket(packet.id, formDataRef.current);
                        if (res.success) {
                          window.location.href = `?success=true`; 
                        } else {
                          toast.error(res.error?.toString() || 'Failed to submit packet');
                        }
                      });
                    }}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> : null}
                    {overallComplete ? (isRejectionMode ? 'Submit Updates' : 'Submit Secure Packet') : 'Complete sections to submit'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// The UI Helpers were moved to FormUIHelpers.tsx
