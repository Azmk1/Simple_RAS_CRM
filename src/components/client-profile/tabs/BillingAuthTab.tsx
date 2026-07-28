'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, AlertTriangle, ShieldCheck, DollarSign, FileCheck, PhoneCall, Check, FileText } from 'lucide-react';
import { completeVobAndCreds, submitPaRequest, denyPaRequest, approvePaRequest, submitTreatmentPaRequest, approveTreatmentPaRequest } from '@/app/(dashboard)/portal-case/actions/billing';
import { createPortal } from 'react-dom';
import { Eye, X, Loader2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { DownloadCloud } from 'lucide-react';

export default function BillingAuthTab({ client }: { client: any }) {
  const paRequest = client.paRequests?.find((pa: any) => pa.type === 'ASSESSMENT');
  const hasVob = paRequest?.vobCompleted;
  
  let formData: Record<string, any> = {};
  try {
    if (client.intakePacket?.formData) {
      formData = typeof client.intakePacket.formData === 'string' 
        ? JSON.parse(client.intakePacket.formData) 
        : client.intakePacket.formData;
    }
  } catch(e) {}

  const hasCred = paRequest?.providerCredentialed;
  const paStatus = paRequest?.status || 'NOT_STARTED';

  const [vobChecked, setVobChecked] = useState(hasVob || false);
  const [credChecked, setCredChecked] = useState(hasCred || false);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [showTxDenyModal, setShowTxDenyModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showTxApproveModal, setShowTxApproveModal] = useState(false);
  
  // PA Submission confirmation states
  const [evalDownloaded, setEvalDownloaded] = useState(false);
  const [referralDownloaded, setReferralDownloaded] = useState(false);
  const [paSubmittedConfirm, setPaSubmittedConfirm] = useState(false);
  
  const [isPending, startTransition] = useTransition();

  const txPaRequest = client.paRequests?.find((pa: any) => pa.type === 'TREATMENT');
  const txPaStatus = txPaRequest?.status || 'NOT_STARTED';
  const showTxPa = ['REPORT_ASSEMBLED', 'TX_PA_SUBMITTED', 'TX_PA_APPROVED', 'ACTIVE', 'DISCHARGED'].includes(client.status);
  const isTxPaSubmitted = ['SUBMITTED', 'DENIED_CLERICAL', 'DENIED_CLINICAL', 'APPROVED'].includes(txPaStatus);

  // Form state for Approval
  const [authNumber, setAuthNumber] = useState('');
  const [units, setUnits] = useState('');
  const [effective, setEffective] = useState('');
  const [expiration, setExpiration] = useState('');
  
  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<{ key: string, name: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Collapse state for Assessment PA
  const [isAssessmentExpanded, setIsAssessmentExpanded] = useState(paStatus !== 'APPROVED');
  const [txSubmitConfirmed, setTxSubmitConfirmed] = useState(false);

  React.useEffect(() => setMounted(true), []);

  let parsedFormData: any = {};
  if (client.intakePacket?.formData) {
    try {
      let parsed = typeof client.intakePacket.formData === 'string' ? JSON.parse(client.intakePacket.formData) : client.intakePacket.formData;
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      parsedFormData = parsed || {};
    } catch (e) {}
  }

  const insurancePayer = parsedFormData.insurancePayer || 'Unknown Payer';
  const memberId = parsedFormData.insuranceMemberId || 'Unknown ID';
  const hasMedicaid = parsedFormData.hasMedicaid === 'Yes';
  const medicaidId = parsedFormData.medicaidId || '';

  const isPaSubmitted = ['SUBMITTED', 'DENIED_CLERICAL', 'DENIED_CLINICAL', 'APPROVED'].includes(paStatus);

  const handleVobSubmit = () => {
    if (!vobChecked || !credChecked) {
      toast.error('Please verify both eligibility and credentialing before continuing.');
      return;
    }
    startTransition(async () => {
      const res = await completeVobAndCreds(client.id);
      if (res?.success) toast.success('Pre-checks marked as complete.');
      else toast.error(res?.error || 'Failed to complete pre-checks.');
    });
  };

  const StepCircle = ({ active, completed, number }: { active: boolean, completed: boolean, number: number }) => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 
      ${completed ? 'bg-green-500 text-white' : active ? 'bg-brand-blue-500 text-white shadow-[0_0_15px_rgba(42,133,255,0.4)]' : 'bg-zinc-800 text-zinc-500 border border-white/10'}`}>
      {completed ? <Check className="w-5 h-5" /> : number}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Insurance Snapshot */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-white/10 shadow-sm bg-zinc-900/50">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Primary Insurance</p>
              <h4 className="text-white font-semibold">{insurancePayer}</h4>
              <p className="text-brand-blue-400 font-mono text-sm mt-1">{memberId}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="flex-1 text-xs py-1 h-auto" onClick={() => setPreviewDoc({ key: 'docInsuranceFront', name: 'Primary Insurance (Front)' })}>
                <Eye className="w-3 h-3 mr-1" /> Front
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs py-1 h-auto" onClick={() => setPreviewDoc({ key: 'docInsuranceBack', name: 'Primary Insurance (Back)' })}>
                <Eye className="w-3 h-3 mr-1" /> Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {hasMedicaid ? (
          <Card className="border-white/10 shadow-sm bg-zinc-900/50">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Medicaid</p>
                <h4 className="text-white font-semibold">Active</h4>
                <p className="text-brand-orange-400 font-mono text-sm mt-1">{medicaidId}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1 text-xs py-1 h-auto" onClick={() => setPreviewDoc({ key: 'docMedicaidFront', name: 'Medicaid (Front)' })}>
                  <Eye className="w-3 h-3 mr-1" /> Front
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs py-1 h-auto" onClick={() => setPreviewDoc({ key: 'docMedicaidBack', name: 'Medicaid (Back)' })}>
                  <Eye className="w-3 h-3 mr-1" /> Back
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-white/10 shadow-sm bg-zinc-900/50 flex items-center justify-center opacity-50">
            <p className="text-zinc-500 text-sm">No Medicaid Reported</p>
          </Card>
        )}
      </div>

      <Card className="border-white/10 shadow-sm w-full relative overflow-hidden">
        {paStatus === 'APPROVED' && (
          <div className="absolute top-0 left-0 w-1 bg-green-500 h-full z-20"></div>
        )}
        
        <CardHeader 
          className={`pb-4 border-b border-white/5 bg-zinc-950/50 ${paStatus === 'APPROVED' ? 'cursor-pointer hover:bg-zinc-900 transition-colors' : ''}`}
          onClick={() => { if (paStatus === 'APPROVED') setIsAssessmentExpanded(!isAssessmentExpanded); }}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-white flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-brand-blue-500" /> Prior Authorization — Assessment
                {paStatus === 'APPROVED' && (
                  <span className="text-[10px] font-bold border px-2.5 py-1 rounded-md tracking-wider uppercase bg-green-500/10 border-green-500/30 text-green-400">
                    AUTHORIZED
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-zinc-400 mt-1">Verify eligibility, check credentialing, and submit CPT 97151.</p>
            </div>
            {paStatus === 'APPROVED' && (
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white pointer-events-none">
                {isAssessmentExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </CardHeader>
        
        {isAssessmentExpanded && (
        <CardContent className="p-8 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="relative border-l-2 border-white/10 ml-4 space-y-12">
            
            {/* STEP 1: VOB & Credentialing */}
            <div className="relative pl-8">
              <div className="absolute -left-[17px] top-0 bg-zinc-950 py-2">
                <StepCircle number={1} active={!hasVob} completed={hasVob} />
              </div>
              
              <div className={`bg-zinc-900 border ${hasVob ? 'border-green-500/20' : 'border-white/10'} p-5 rounded-xl transition-all`}>
                <h3 className="text-base font-semibold text-white mb-4 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-zinc-400" />
                  Eligibility & Credentialing Check
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-brand-blue-500 focus:ring-brand-blue-500 focus:ring-offset-zinc-900" 
                      checked={vobChecked}
                      onChange={(e) => setVobChecked(e.target.checked)}
                      disabled={hasVob}
                    />
                    <div>
                      <p className={`text-sm font-medium ${vobChecked ? 'text-zinc-300' : 'text-zinc-400'} group-hover:text-white transition-colors`}>
                        Verify Eligibility & Benefits (VOB) Completed
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">Called payer to confirm active coverage and PA requirements for 97151.</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-brand-blue-500 focus:ring-brand-blue-500 focus:ring-offset-zinc-900" 
                      checked={credChecked}
                      onChange={(e) => setCredChecked(e.target.checked)}
                      disabled={hasCred}
                    />
                    <div>
                      <p className={`text-sm font-medium ${credChecked ? 'text-zinc-300' : 'text-zinc-400'} group-hover:text-white transition-colors`}>
                        Provider Credentialed & Group-Linked
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">Confirmed the assessing BCBA is in-network and linked to our tax ID.</p>
                    </div>
                  </label>

                  {!hasVob && (
                    <div className="pt-2">
                      <Button 
                        variant="primary" 
                        disabled={isPending || hasVob}
                        onClick={handleVobSubmit}
                        className={`w-full mt-2 font-bold shadow-lg transition-all duration-300 ${
                          (vobChecked && credChecked && !hasVob)
                            ? 'bg-green-500 hover:bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.4)] text-white hover:scale-[1.02] active:scale-[0.98]' 
                            : 'hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      >
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Mark Pre-Checks Complete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 2: Submit PA */}
            <div className={`relative pl-8 transition-opacity duration-300 ${!hasVob ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="absolute -left-[17px] top-0 bg-zinc-950 py-2">
                <StepCircle number={2} active={hasVob && !isPaSubmitted} completed={paStatus === 'APPROVED'} />
              </div>
              
              <div className={`bg-zinc-900 border ${paStatus === 'DENIED_CLERICAL' || paStatus === 'DENIED_CLINICAL' ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} p-5 rounded-xl`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-semibold text-white mb-2 flex items-center">
                      <FileCheck className="w-4 h-4 mr-2 text-zinc-400" />
                      Submit PA Request — CPT 97151
                    </h3>
                    <p className="text-sm text-zinc-400 max-w-lg mb-4">
                      Submit the initial assessment authorization request via the payer portal or phone. Include the diagnostic eval and referral.
                    </p>
                    
                    <div className="flex gap-2 mb-4">
                      {formData.docEval?.url ? (
                        <a 
                          href={formData.docEval.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={() => setEvalDownloaded(true)}
                          className={`inline-flex items-center text-xs px-3 py-1.5 rounded-md border transition-colors ${evalDownloaded ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'}`}
                        >
                          <DownloadCloud className="w-3.5 h-3.5 mr-1.5" /> Diagnostic Eval {evalDownloaded && <Check className="w-3 h-3 ml-1" />}
                        </a>
                      ) : (
                        <span className="inline-flex items-center text-xs bg-zinc-800/50 text-zinc-500 px-3 py-1.5 rounded-md border border-zinc-700/50 cursor-not-allowed">
                          <DownloadCloud className="w-3.5 h-3.5 mr-1.5 opacity-50" /> No Eval Found
                        </span>
                      )}
                      
                      {formData.docReferral?.url ? (
                        <a 
                          href={formData.docReferral.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={() => setReferralDownloaded(true)}
                          className={`inline-flex items-center text-xs px-3 py-1.5 rounded-md border transition-colors ${referralDownloaded ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'}`}
                        >
                          <DownloadCloud className="w-3.5 h-3.5 mr-1.5" /> Physician Referral {referralDownloaded && <Check className="w-3 h-3 ml-1" />}
                        </a>
                      ) : (
                        <span className="inline-flex items-center text-xs bg-zinc-800/50 text-zinc-500 px-3 py-1.5 rounded-md border border-zinc-700/50 cursor-not-allowed">
                          <DownloadCloud className="w-3.5 h-3.5 mr-1.5 opacity-50" /> No Referral Found
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {(paStatus === 'DENIED_CLERICAL' || (paStatus === 'DENIED_CLINICAL' && !paRequest?.p2pResolved)) && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-md text-xs font-bold uppercase flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                      {paStatus.replace('_', ' ')}
                    </div>
                  )}
                  {paStatus === 'DENIED_CLINICAL' && paRequest?.p2pResolved && (
                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-md text-xs font-bold uppercase flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        P2P RESOLVED BY BCBA
                      </div>
                    </div>
                  )}
                </div>

                {paStatus === 'DENIED_CLINICAL' && paRequest?.p2pResolved && paRequest.p2pNotes && (
                  <div className="mt-4 bg-zinc-950 border-l-2 border-brand-blue-500 p-3 rounded-r-lg">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">BCBA P2P Resolution Notes</p>
                    <p className="text-sm text-zinc-300 italic">"{paRequest.p2pNotes}"</p>
                  </div>
                )}

                {(!isPaSubmitted || paStatus.includes('DENIED')) && paStatus !== 'APPROVED' && (() => {
                  const needsEval = !!formData.docEval?.url;
                  const needsReferral = !!formData.docReferral?.url;
                  const evalReady = !needsEval || evalDownloaded;
                  const referralReady = !needsReferral || referralDownloaded;
                  const isSubmitReady = evalReady && referralReady && paSubmittedConfirm;

                  return (
                    <div className="mt-4 border-t border-white/5 pt-4">
                      <label className="flex items-start space-x-3 cursor-pointer group mb-4">
                        <input 
                          type="checkbox" 
                          className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-brand-blue-500 focus:ring-brand-blue-500 focus:ring-offset-zinc-900" 
                          checked={paSubmittedConfirm}
                          onChange={(e) => setPaSubmittedConfirm(e.target.checked)}
                          disabled={paStatus === 'DENIED_CLINICAL' && !paRequest?.p2pResolved}
                        />
                        <div>
                          <p className={`text-sm font-medium ${paSubmittedConfirm ? 'text-zinc-300' : 'text-zinc-400'} group-hover:text-white transition-colors`}>
                            I confirm the Authorization Request has been submitted to the payer portal with these documents.
                          </p>
                        </div>
                      </label>

                      <Button 
                        variant="primary" 
                        disabled={isPending || (paStatus === 'DENIED_CLINICAL' && !paRequest?.p2pResolved)}
                        onClick={() => {
                          if (paStatus === 'DENIED_CLINICAL' && !paRequest?.p2pResolved) {
                            toast.error('Waiting for BCBA to resolve Peer-to-Peer review.');
                            return;
                          }
                          if (!isSubmitReady) {
                            toast.error('Please download required documents and confirm submission.');
                            return;
                          }
                          startTransition(async () => {
                            const res = await submitPaRequest(client.id);
                            if (res?.success) toast.success('PA Request Submitted.');
                            else toast.error(res?.error || 'Failed to submit PA.');
                          });
                        }}
                        className={`w-full mt-2 font-bold shadow-lg transition-all duration-300 ${
                          isSubmitReady
                            ? 'bg-green-500 hover:bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.4)] text-white hover:scale-[1.02] active:scale-[0.98]' 
                            : 'hover:scale-[1.02] active:scale-[0.98]'
                        } ${paStatus.includes('DENIED') && isSubmitReady ? '!bg-orange-500 hover:!bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.4)]' : ''}`}
                      >
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {paStatus.includes('DENIED') ? 'Resubmit PA Request' : 'Mark as Submitted'}
                      </Button>
                    </div>
                  );
                })()}

                {paStatus === 'SUBMITTED' && (
                  <div className="flex items-center text-brand-blue-400 text-sm font-medium bg-brand-blue-500/10 p-3 rounded-lg border border-brand-blue-500/20">
                    <CheckCircle className="w-4 h-4 mr-2" /> PA Submitted. Awaiting Decision...
                  </div>
                )}
              </div>
            </div>

            {/* STEP 3: Decision & Finalize */}
            <div className={`relative pl-8 transition-opacity duration-300 ${paStatus !== 'SUBMITTED' && paStatus !== 'APPROVED' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="absolute -left-[17px] top-0 bg-zinc-950 py-2">
                <StepCircle number={3} active={paStatus === 'SUBMITTED'} completed={paStatus === 'APPROVED'} />
              </div>
              
              <div className={`bg-zinc-900 border ${paStatus === 'APPROVED' ? 'border-green-500/30 bg-green-500/5' : 'border-white/10'} p-5 rounded-xl`}>
                
                {paStatus !== 'APPROVED' ? (
                  <>
                    <h3 className="text-base font-semibold text-white mb-2 flex items-center">
                      <PhoneCall className="w-4 h-4 mr-2 text-zinc-400" />
                      Decision Received
                    </h3>
                    <p className="text-sm text-zinc-400 mb-5">Record the payer's decision for the submitted authorization.</p>
                    <div className="flex space-x-3">
                      <Button variant="danger" onClick={() => setShowDenyModal(true)}>Log Denial</Button>
                      <Button className="bg-green-600 hover:bg-green-700 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]" onClick={() => setShowApproveModal(true)}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Log Approval
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-base font-semibold text-green-400 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Authorization Active
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-lg border border-white/5">
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Auth Number</div>
                        <div className="font-mono text-zinc-200">{paRequest.authNumber}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Approved Units</div>
                        <div className="font-mono text-zinc-200">{paRequest.approvedUnits} Units</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Effective Date</div>
                        <div className="font-mono text-zinc-200">{new Date(paRequest.effectiveDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Expiration Date</div>
                        <div className="font-mono text-zinc-200">{new Date(paRequest.expirationDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </>
                )}
                
              </div>
            </div>

          </div>
        </CardContent>
        )}
      </Card>

      {/* Denial Modal */}
      {showDenyModal && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" /> Log Authorization Denial
            </h3>
            <p className="text-sm text-zinc-400">What type of denial did the payer issue? This will reset the PA to require resubmission.</p>
            
            <div className="grid grid-cols-1 gap-3 pt-2">
              <Button 
                variant="secondary" 
                className="justify-start h-auto py-3 text-left border-red-500/20 hover:border-red-500 hover:bg-red-500/10"
                onClick={async () => {
                  await denyPaRequest(paRequest.id, false);
                  setShowDenyModal(false);
                }}
              >
                <div>
                  <div className="font-bold text-red-400">Clerical Denial</div>
                  <div className="text-xs text-zinc-500 mt-1">Typo, wrong member ID, missing modifier. Easy to fix and resubmit.</div>
                </div>
              </Button>

              <Button 
                variant="secondary" 
                className="justify-start h-auto py-3 text-left border-orange-500/20 hover:border-orange-500 hover:bg-orange-500/10"
                onClick={async () => {
                  await denyPaRequest(paRequest.id, true);
                  setShowDenyModal(false);
                }}
              >
                <div>
                  <div className="font-bold text-orange-400">Clinical Denial</div>
                  <div className="text-xs text-zinc-500 mt-1">Lack of medical necessity. Requires Peer-to-Peer review.</div>
                </div>
              </Button>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowDenyModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showTxDenyModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" /> Log Treatment PA Denial
            </h3>
            <p className="text-sm text-zinc-400">What type of denial did the payer issue? This will reset the PA to require resubmission.</p>
            
            <div className="grid grid-cols-1 gap-3 pt-2">
              <Button 
                variant="secondary" 
                className="justify-start h-auto py-3 text-left border-red-500/20 hover:border-red-500 hover:bg-red-500/10"
                onClick={async () => {
                  if (txPaRequest) await denyPaRequest(txPaRequest.id, false);
                  setShowTxDenyModal(false);
                }}
              >
                <div>
                  <div className="font-bold text-red-400">Clerical Denial</div>
                  <div className="text-xs text-zinc-500 mt-1">Typo, wrong member ID, missing modifier. Easy to fix and resubmit.</div>
                </div>
              </Button>

              <Button 
                variant="secondary" 
                className="justify-start h-auto py-3 text-left border-orange-500/20 hover:border-orange-500 hover:bg-orange-500/10"
                onClick={async () => {
                  if (txPaRequest) await denyPaRequest(txPaRequest.id, true);
                  setShowTxDenyModal(false);
                }}
              >
                <div>
                  <div className="font-bold text-orange-400">Clinical Denial</div>
                  <div className="text-xs text-zinc-500 mt-1">Lack of medical necessity. Requires Peer-to-Peer review.</div>
                </div>
              </Button>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowTxDenyModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ---------------- TREATMENT PA SECTION ---------------- */}
      {showTxPa && (
        <Card className="border-white/10 shadow-sm w-full relative overflow-hidden mt-6">
          {txPaStatus === 'APPROVED' && (
            <div className="absolute top-0 left-0 w-1 bg-brand-green-500 h-full z-20"></div>
          )}
          
          <CardHeader className="pb-4 border-b border-white/5 bg-zinc-950/50">
            <div>
              <CardTitle className="text-lg text-white flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-brand-orange-500" /> Prior Authorization — Treatment
                {txPaStatus === 'APPROVED' && (
                  <span className="text-[10px] font-bold border px-2.5 py-1 rounded-md tracking-wider uppercase bg-green-500/10 border-green-500/30 text-green-400">
                    AUTHORIZED
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-zinc-400 mt-1">Submit the Treatment Plan for CPT 97153, 97155, 97156.</p>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="relative border-l-2 border-white/10 ml-4 space-y-12">
              
              {/* STEP 1: Submit PA */}
              <div className="relative pl-8">
                <div className="absolute -left-[17px] top-0 bg-zinc-950 py-2">
                  <StepCircle number={1} active={!isTxPaSubmitted} completed={isTxPaSubmitted} />
                </div>
                
                <div className={`bg-zinc-900 border ${txPaStatus === 'DENIED_CLERICAL' || txPaStatus === 'DENIED_CLINICAL' ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} p-5 rounded-xl`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">Submit Treatment PA</h3>
                      <p className="text-sm text-zinc-400">The BCBA has completed the Treatment Plan. Submit to payer.</p>
                      {txPaStatus === 'SUBMITTED' && (
                        <div className="mt-3 flex items-center text-sm font-medium text-brand-orange-400 bg-brand-orange-500/10 px-3 py-1.5 rounded w-fit border border-brand-orange-500/20">
                          <Clock className="w-4 h-4 mr-2" /> Pending Payer Decision
                        </div>
                      )}
                    </div>
                    
                    {(txPaStatus === 'DENIED_CLERICAL' || (txPaStatus === 'DENIED_CLINICAL' && !txPaRequest?.p2pResolved)) && (
                      <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-md text-xs font-bold uppercase flex items-center mb-2">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                        {txPaStatus.replace('_', ' ')}
                      </div>
                    )}
                    {txPaStatus === 'DENIED_CLINICAL' && txPaRequest?.p2pResolved && (
                      <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-md text-xs font-bold uppercase flex items-center mb-2">
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        P2P RESOLVED
                      </div>
                    )}

                    {(!isTxPaSubmitted || txPaStatus.includes('DENIED')) && txPaStatus !== 'APPROVED' && (
                      <div className="mt-4">
                          <div className="mb-4">
                            <a href={`/api/generate-report/${client.id}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" type="button" className="border-brand-blue-500/30 text-brand-blue-400 hover:bg-brand-blue-500/10">
                                <FileText className="w-4 h-4 mr-2" /> Download Assembled Packet (PDF)
                              </Button>
                            </a>
                          </div>
                          
                          <label className="flex items-start space-x-3 cursor-pointer group mb-4">
                            <input 
                              type="checkbox" 
                              className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-brand-blue-500 focus:ring-brand-blue-500 focus:ring-offset-zinc-900" 
                              checked={txSubmitConfirmed}
                              onChange={(e) => setTxSubmitConfirmed(e.target.checked)}
                            />
                            <div>
                              <p className={`text-sm font-medium ${txSubmitConfirmed ? 'text-zinc-300' : 'text-zinc-400'} group-hover:text-white transition-colors`}>
                                Confirmed: I have successfully submitted the Treatment PA to the payer via portal/fax.
                              </p>
                            </div>
                          </label>
                          <Button 
                          onClick={() => {
                            if (txPaStatus === 'DENIED_CLINICAL' && !txPaRequest?.p2pResolved) {
                              toast.error('Waiting for BCBA to resolve Peer-to-Peer review.');
                              return;
                            }
                            startTransition(async () => {
                              const res = await submitTreatmentPaRequest(client.id);
                              if (res?.success) toast.success('Treatment PA submitted.');
                              else toast.error(res?.error || 'Failed to submit Treatment PA.');
                            });
                          }} 
                          variant="primary" 
                          size="sm"
                          disabled={isPending || !txSubmitConfirmed || (txPaStatus === 'DENIED_CLINICAL' && !txPaRequest?.p2pResolved)}
                          className={`w-full font-bold py-2 transition-all duration-300 ${
                            txSubmitConfirmed 
                              ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] cursor-pointer hover:scale-[1.02]' 
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          }`}
                        >
                          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          {txPaStatus.includes('DENIED') ? 'Resubmit PA Request' : 'Mark as Submitted'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {txPaStatus === 'DENIED_CLINICAL' && txPaRequest?.p2pResolved && txPaRequest.p2pNotes && (
                    <div className="mt-4 bg-zinc-950 border-l-2 border-brand-blue-500 p-3 rounded-r-lg">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">BCBA P2P Resolution Notes</p>
                      <p className="text-sm text-zinc-300 italic">"{txPaRequest.p2pNotes}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 2: Approval */}
              <div className={`relative pl-8 transition-opacity duration-300 ${!isTxPaSubmitted ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <div className="absolute -left-[17px] top-0 bg-zinc-950 py-2">
                  <StepCircle number={2} active={isTxPaSubmitted && txPaStatus !== 'APPROVED'} completed={txPaStatus === 'APPROVED'} />
                </div>
                
                <div className={`bg-zinc-900 border ${txPaStatus === 'APPROVED' ? 'border-green-500/20' : 'border-white/10'} p-5 rounded-xl`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">Authorization Outcome</h3>
                      <p className="text-sm text-zinc-400">Record the approval details (97153, 97155, 97156).</p>
                    </div>
                    
                    {txPaStatus !== 'APPROVED' && txPaStatus !== 'DENIED_CLERICAL' && txPaStatus !== 'DENIED_CLINICAL' && (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer" onClick={() => setShowTxDenyModal(true)}>
                          Log Denial
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white cursor-pointer" onClick={() => setShowTxApproveModal(true)}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Log Approval
                        </Button>
                      </div>
                    )}
                  </div>

                  {txPaStatus === 'APPROVED' && txPaRequest && (
                    <div className="mt-4 bg-zinc-950 rounded-lg p-4 grid grid-cols-2 gap-4 border border-white/5">
                      <div>
                        <p className="text-[10px] uppercase text-zinc-500 font-bold">Auth Number</p>
                        <p className="text-white font-mono text-sm mt-0.5">{txPaRequest.authNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-zinc-500 font-bold">Approved Units</p>
                        <p className="text-white font-mono text-sm mt-0.5">{txPaRequest.approvedUnits}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-zinc-500 font-bold">Effective Date</p>
                        <p className="text-zinc-300 text-sm mt-0.5">{new Date(txPaRequest.effectiveDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-zinc-500 font-bold">Expiration Date</p>
                        <p className="text-zinc-300 text-sm mt-0.5">{new Date(txPaRequest.expirationDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deny Modal (Assessment Only) */}
      {showApproveModal && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Log Authorization Approval
            </h3>
            <p className="text-sm text-zinc-400 mb-4">Enter the authorization details provided by the payer.</p>
            
            <form action={async () => {
              if (!paRequest?.id) return;
              await approvePaRequest(paRequest.id, {
                authNumber,
                approvedUnits: parseInt(units, 10),
                effectiveDate: new Date(effective),
                expirationDate: new Date(expiration)
              });
              setShowApproveModal(false);
            }} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Auth Number</label>
                <input required type="text" value={authNumber} onChange={e => setAuthNumber(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-md p-2 text-white outline-none focus:border-green-500" />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Approved Units (97151)</label>
                <input required type="number" min="1" value={units} onChange={e => setUnits(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-md p-2 text-white outline-none focus:border-green-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">Effective Date</label>
                  <input required type="date" value={effective} onChange={e => setEffective(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-md p-2 text-zinc-300 outline-none focus:border-green-500 [color-scheme:dark]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">Expiration Date</label>
                  <input required type="date" value={expiration} onChange={e => setExpiration(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-md p-2 text-zinc-300 outline-none focus:border-green-500 [color-scheme:dark]" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowApproveModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Save Authorization</Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* TX Approval Modal */}
      {showTxApproveModal && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Log Treatment PA Approval
            </h3>
            <p className="text-sm text-zinc-400 mb-4">Enter the authorization details provided by the payer for 97153, 97155, 97156.</p>
            
            <form action={async () => {
              if (!txPaRequest?.id) return;
              await approveTreatmentPaRequest(txPaRequest.id, {
                authNumber,
                approvedUnits: parseInt(units, 10),
                effectiveDate: new Date(effective),
                expirationDate: new Date(expiration)
              });
              setShowTxApproveModal(false);
            }} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Auth Number</label>
                <input required type="text" value={authNumber} onChange={e => setAuthNumber(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-md p-2 text-white outline-none focus:border-green-500" />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Total Approved Units</label>
                <input required type="number" min="1" value={units} onChange={e => setUnits(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-md p-2 text-white outline-none focus:border-green-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">Effective Date</label>
                  <input required type="date" value={effective} onChange={e => setEffective(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-md p-2 text-zinc-300 outline-none focus:border-green-500 [color-scheme:dark]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">Expiration Date</label>
                  <input required type="date" value={expiration} onChange={e => setExpiration(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-md p-2 text-zinc-300 outline-none focus:border-green-500 [color-scheme:dark]" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowTxApproveModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Save Authorization</Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Preview Modal */}
      {mounted && previewDoc && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-zinc-950">
              <h3 className="font-semibold text-white flex items-center">
                <Eye className="w-5 h-5 mr-2 text-brand-blue-500"/> Preview: {previewDoc.name}
              </h3>
              <button onClick={() => setPreviewDoc(null)} className="text-zinc-400 hover:text-white transition-colors p-1">
                <X className="w-6 h-6"/>
              </button>
            </div>
            <div className="flex-1 p-8 flex items-center justify-center bg-zinc-900/50 overflow-y-auto">
              {parsedFormData[previewDoc.key] ? (
                <img src={parsedFormData[previewDoc.key]} alt="Document Preview" className="max-w-full max-h-full rounded shadow-lg object-contain" />
              ) : (
                <p className="text-zinc-500 flex flex-col items-center">
                  <FileCheck className="w-12 h-12 mb-3 opacity-20" />
                  No image uploaded
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
