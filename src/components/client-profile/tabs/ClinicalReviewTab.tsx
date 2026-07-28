'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, CheckCircle, AlertTriangle, X, Check, Eye, FileCheck } from 'lucide-react';
import { approveClinicalReview, rejectClinicalReview, rejectClinicalFormFieldsBulk } from '@/app/(dashboard)/portal-case/actions/clinical';
import { Form01ClientIntake } from '@/components/magic-link/Form01ClientIntake';
import { Form02Consent } from '@/components/magic-link/Form02Consent';

export default function ClinicalReviewTab({ client }: { client: any }) {
  const packet = client.intakePacket;
  const hasPacket = !!packet;

  const [previewDoc, setPreviewDoc] = useState<{ key: string, name: string } | null>(null);
  const [rejectDoc, setRejectDoc] = useState<{ key: string, name: string } | null>(null);
  const [approvedDocs, setApprovedDocs] = useState<string[]>([]);

  // Staged rejection states
  const [isChangeMode, setIsChangeMode] = useState(false);
  const [stagedRejections, setStagedRejections] = useState<string[]>([]);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [isPendingApprove, startApproveTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState('');

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!packet) {
    return (
      <div className="p-8 text-center text-zinc-500">
        No intake packet available for clinical review yet.
      </div>
    );
  }

  const rejectionDetails = packet?.rejectionDetails && typeof packet.rejectionDetails === 'object' ? packet.rejectionDetails : {};
  const formData = packet?.formData ? (typeof packet.formData === 'string' ? JSON.parse(packet.formData) : packet.formData) : {};

  const rejectedFieldsList = Object.keys(rejectionDetails)
    .filter(k => k.startsWith('formField_'))
    .map(k => k.replace('formField_', ''));

  const handleRejectFormField = (fieldId: string) => {
    if (stagedRejections.includes(fieldId)) {
      setStagedRejections(prev => prev.filter(id => id !== fieldId));
    } else {
      setStagedRejections(prev => [...prev, fieldId]);
    }
  };

  const handleCloseModal = () => {
    if (stagedRejections.length > 0) {
      setShowDiscardConfirm(true);
    } else {
      setPreviewDoc(null);
      setIsChangeMode(false);
    }
  };

  const handleBulkRejectSubmit = async () => {
    const fields = stagedRejections.map(fieldId => ({ fieldId, reason: 'Clinical requested changes to this field.' }));
    await rejectClinicalFormFieldsBulk(client.id, packet.id, fields);
    
    setPreviewDoc(null);
    setIsChangeMode(false);
    setStagedRejections([]);
    setShowSubmitConfirm(false);
  };

  const hasMedicaid = formData['hasMedicaid'] && formData['hasMedicaid'] !== 'No' && formData['hasMedicaid'] !== 'Not Sure';
  const hasCustodyDoc = formData['custodyDocAttached'] === 'Yes — Attached' || formData['custodyDocAttached'] === 'Yes — Will Provide';
  const hasIEP = formData['hasIEP'] === 'Yes — Attached' || formData['hasIEP'] === 'Yes — Will Provide';
  const hasPriorABA = formData['hasPriorABA'] === 'Yes';

  const dbKeyToFormKey: Record<string, string> = {
    insuranceCardFrontUploaded: 'docInsuranceFront',
    insuranceCardBackUploaded: 'docInsuranceBack',
    medicaidCardFrontUploaded: 'docMedicaidFront',
    medicaidCardBackUploaded: 'docMedicaidBack',
    diagnosticEvalUploaded: 'docEval',
    physicianRxUploaded: 'docReferral',
    iepUploaded: 'docIEP',
    custodyDocsUploaded: 'docCustody',
    priorAbaRecordsUploaded: 'docPriorABA'
  };

  let parsedFormData: any = {};
  if (packet?.formData) {
    try {
      let parsed = typeof packet.formData === 'string' ? JSON.parse(packet.formData) : packet.formData;
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      parsedFormData = parsed || {};
    } catch (e) {}
  }

  // Calculate required docs for approval
  const visibleKeys = [
    'intakeFormComplete',
    'consentFormComplete',
    'insuranceCardFrontUploaded',
    'insuranceCardBackUploaded',
    'diagnosticEvalUploaded',
    'physicianRxUploaded'
  ];
  if (hasMedicaid) { visibleKeys.push('medicaidCardFrontUploaded', 'medicaidCardBackUploaded'); }
  if (hasIEP) { visibleKeys.push('iepUploaded'); }
  if (hasCustodyDoc) { visibleKeys.push('custodyDocsUploaded'); }
  if (hasPriorABA) { visibleKeys.push('priorAbaRecordsUploaded'); }

  const allApproved = visibleKeys.every(k => approvedDocs.includes(k)) || client.status === 'CLINICAL_REVIEW_APPROVED';

  const DocumentRow = ({ title, dbKey, isForm = false }: { title: string, dbKey: string, isForm?: boolean }) => {
    const isApprovedLocally = approvedDocs.includes(dbKey) || client.status === 'CLINICAL_REVIEW_APPROVED';
    const isUploaded = isForm ? packet[dbKey] : (dbKeyToFormKey[dbKey] ? !!parsedFormData[dbKeyToFormKey[dbKey]] : false);
    
    return (
      <div className="flex items-center justify-between text-sm p-2 hover:bg-white/5 rounded-lg transition-colors group">
        <button 
          onClick={() => setPreviewDoc({ key: dbKey, name: title })}
          className="flex-1 flex flex-col text-left group-hover:text-brand-blue-400 transition-colors py-1 cursor-pointer"
        >
          <span className="flex items-center text-zinc-300 font-medium">
            <FileText className="w-4 h-4 mr-3 text-zinc-500"/> {title}
          </span>
        </button>
        
        <div className="flex items-center space-x-2">
          {(() => {
            if (isApprovedLocally) {
              return (
                <span className="flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-green-500/10 text-green-400">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> APPROVED
                </span>
              );
            }

            if (!isUploaded) {
              return (
                <span className="flex items-center bg-zinc-500/10 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  MISSING
                </span>
              );
            }

            return (
              <span className="flex items-center bg-zinc-500/10 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                NEEDS REVIEW
              </span>
            );
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      <Card className="border-white/10 shadow-sm w-full">
        <CardHeader className="pb-4 border-b border-white/5 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-lg text-white flex items-center gap-3">
              Clinical Review
              {client.status === 'CLINICAL_REVIEW_APPROVED' && (
                <span className="text-[10px] font-bold border px-2.5 py-1 rounded-md tracking-wider uppercase bg-green-500/10 border-green-500/30 text-green-400">
                  APPROVED
                </span>
              )}
            </CardTitle>
            <p className="text-sm text-zinc-400 mt-1">Review the medical documentation to establish medical necessity.</p>
          </div>

          {client.status !== 'CLINICAL_REVIEW_APPROVED' && (
            <div 
              className="relative group rounded-md" 
              title={!allApproved ? "Approve all documents to continue." : ""}
            >
              <div className={`absolute -inset-0.5 rounded-md blur opacity-50 transition duration-200 ${allApproved ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></div>
              <Button 
                variant="primary" 
                onClick={() => setShowApproveConfirm(true)}
                disabled={!allApproved}
                className={`relative font-bold tracking-wide border ${allApproved ? 'bg-zinc-900 text-white hover:bg-zinc-800 border-green-500/50' : 'bg-zinc-800 text-zinc-400 border-zinc-600 cursor-not-allowed'}`}
              >
                Approve Clinical Review
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Required Forms</h4>
              <div className="space-y-1">
                <DocumentRow title="Client Intake Form (Form 01)" dbKey="intakeFormComplete" isForm={true} />
                <DocumentRow title="Consent & Authorization (Form 02)" dbKey="consentFormComplete" isForm={true} />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Document Uploads</h4>
              <div className="space-y-1">
                <DocumentRow title="Primary Insurance Card (Front)" dbKey="insuranceCardFrontUploaded" />
                <DocumentRow title="Primary Insurance Card (Back)" dbKey="insuranceCardBackUploaded" />
                
                {hasMedicaid && (
                  <>
                    <DocumentRow title="Medicaid Card (Front)" dbKey="medicaidCardFrontUploaded" />
                    <DocumentRow title="Medicaid Card (Back)" dbKey="medicaidCardBackUploaded" />
                  </>
                )}
                
                <DocumentRow title="Diagnostic Evaluation Report" dbKey="diagnosticEvalUploaded" />
                <DocumentRow title="Physician Referral / Prescription" dbKey="physicianRxUploaded" />
                
                {hasIEP && (
                  <DocumentRow title="IEP / IFSP" dbKey="iepUploaded" />
                )}
                
                {hasCustodyDoc && (
                  <DocumentRow title="Custody/Guardianship Order" dbKey="custodyDocsUploaded" />
                )}
                
                {hasPriorABA && (
                  <DocumentRow title="Prior ABA Records" dbKey="priorAbaRecordsUploaded" />
                )}
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {mounted && createPortal(
        <>
          {/* Preview Modal */}
          {previewDoc && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
              <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-zinc-950">
              <h3 className="font-semibold text-white flex items-center"><Eye className="w-5 h-5 mr-2 text-brand-blue-500"/> Preview: {previewDoc.name}</h3>
              
              <div className="flex items-center space-x-4">
                {(previewDoc.key === 'intakeFormComplete' || previewDoc.key === 'consentFormComplete') && client.status !== 'CLINICAL_REVIEW_APPROVED' && (
                  <div className="flex items-center bg-white/5 rounded-lg p-1 space-x-2">
                    <button 
                      onClick={() => setIsChangeMode(false)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!isChangeMode ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                    >
                      View Mode
                    </button>
                    <button 
                      onClick={() => setIsChangeMode(true)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isChangeMode ? 'bg-orange-500 text-black shadow' : 'text-zinc-400 hover:text-white'}`}
                    >
                      Request Changes Mode
                    </button>
                  </div>
                )}
                
                {isChangeMode && stagedRejections.length > 0 && (
                  <Button variant="danger" onClick={() => setShowSubmitConfirm(true)}>
                    Send {stagedRejections.length} Request(s)
                  </Button>
                )}
                
                {!isChangeMode && client.status !== 'CLINICAL_REVIEW_APPROVED' && !approvedDocs.includes(previewDoc.key) && (
                  <div className="flex space-x-2">
                    {previewDoc.key !== 'intakeFormComplete' && previewDoc.key !== 'consentFormComplete' && (
                      <Button variant="danger" onClick={() => setRejectDoc(previewDoc)}>
                        Request Correction
                      </Button>
                    )}
                    <div className="relative group rounded-md">
                      <div className="absolute -inset-0.5 bg-green-500 rounded-md blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                      <Button variant="primary" className="relative bg-zinc-900 hover:bg-zinc-800 text-white font-bold tracking-wide border border-green-500/50" onClick={() => {
                        setApprovedDocs(prev => [...prev, previewDoc.key]);
                        setPreviewDoc(null);
                      }}>
                        Approve
                      </Button>
                    </div>
                  </div>
                )}

                <div className="w-px h-6 bg-white/10 mx-2"></div>
                <button onClick={handleCloseModal} className="text-zinc-400 hover:text-white transition-colors p-1"><X className="w-6 h-6"/></button>
              </div>
            </div>
            
            {isChangeMode && (
              <div className="bg-orange-500/10 border-b border-orange-500/20 p-3 text-center">
                <p className="text-orange-400 text-sm font-medium flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  You are in Request Changes Mode. Click on any field to mark it for correction. They will be wiped and sent back to Intake.
                </p>
              </div>
            )}

            <div className="flex-1 p-8 flex items-start justify-center bg-zinc-900/50 overflow-y-auto">
              {previewDoc.key === 'intakeFormComplete' ? (
                <div className="w-full max-w-4xl">
                  <Form01ClientIntake 
                    formData={formData} 
                    client={client} 
                    readOnly={true} 
                    adminReviewMode={isChangeMode} 
                    rejectedFields={rejectedFieldsList} 
                    stagedRejections={stagedRejections}
                    onRejectField={handleRejectFormField} 
                  />
                </div>
              ) : previewDoc.key === 'consentFormComplete' ? (
                <div className="w-full max-w-4xl">
                  <Form02Consent 
                    formData={formData} 
                    client={client} 
                    readOnly={true} 
                    adminReviewMode={isChangeMode} 
                    rejectedFields={rejectedFieldsList} 
                    stagedRejections={stagedRejections}
                    onRejectField={handleRejectFormField} 
                  />
                </div>
              ) : (
                (() => {
                  const formKey = dbKeyToFormKey[previewDoc.key] || previewDoc.key;
                  const docData = parsedFormData[formKey];
                  
                  if (docData?.url) {
                    return (
                      <div className="w-full bg-white rounded-lg shadow-2xl overflow-hidden relative flex flex-col mt-4">
                        <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-3 flex items-center justify-between text-zinc-600">
                          <div className="flex items-center text-sm font-medium">
                            <FileCheck className="w-4 h-4 mr-2 text-green-600" />
                            {docData.name}
                          </div>
                          <div className="text-xs font-mono">{docData.size}</div>
                        </div>
                        <div className="bg-zinc-200 p-4 flex items-center justify-center min-h-[50vh]">
                          {docData.type === 'application/pdf' ? (
                            <iframe src={docData.url} className="w-full h-[70vh] rounded shadow-inner" />
                          ) : (
                            <img src={docData.url} alt={docData.name} className="w-full h-auto object-contain shadow-2xl rounded" />
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="w-full max-w-4xl h-[70vh] bg-white rounded-lg shadow-2xl overflow-hidden relative flex flex-col mt-10">
                      <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-3 flex items-center justify-between text-zinc-600">
                        <div className="flex items-center text-sm font-medium">
                          <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                          Document Not Uploaded
                        </div>
                      </div>
                      <div className="flex-1 bg-zinc-200/50 p-8 flex items-center justify-center relative">
                        <div className="text-zinc-500">
                          This document has not been uploaded yet or was wiped.
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve Main Clinical Review Modal */}
      {showApproveConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Approve Clinical Review
            </h3>
            <p className="text-sm text-zinc-400">By approving, you confirm that the diagnostic report and referrals establish medical necessity for ABA therapy.</p>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowApproveConfirm(false)}>Cancel</Button>
              <form action={async () => {
                startApproveTransition(async () => {
                  await approveClinicalReview(client.id);
                  setShowApproveConfirm(false);
                });
              }}>
                <div className="relative group rounded-md">
                  <div className="absolute -inset-0.5 bg-green-500 rounded-md blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                  <Button type="submit" disabled={isPendingApprove} variant="primary" className="relative bg-zinc-900 hover:bg-zinc-800 text-white font-bold tracking-wide border border-green-500/50">
                    {isPendingApprove ? 'Approving...' : 'Confirm Approval'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectDoc && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-red-500"/> Request Correction: {rejectDoc.name}</h3>
              <p className="text-sm text-zinc-400">This will return the packet to the Intake Coordinator's queue so they can assist the client with providing the correct clinical documents.</p>
              <textarea 
                className="w-full text-sm border border-white/10 p-3 rounded-lg bg-zinc-950 text-white focus:border-red-500 outline-none transition-colors h-24 resize-none"
                placeholder="e.g. The evaluation report is missing a formal ASD diagnosis."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex justify-end space-x-3 pt-2">
                <Button variant="secondary" onClick={() => { setRejectDoc(null); setRejectReason(''); }}>Cancel</Button>
                <form action={async () => {
                  await rejectClinicalReview(client.id, rejectDoc.key, rejectReason);
                  setRejectDoc(null);
                  setRejectReason('');
                  setPreviewDoc(null);
                }}>
                  <Button type="submit" variant="danger" disabled={!rejectReason.trim()}>Return to Intake</Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discard Confirm */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Discard Changes?</h3>
              <p className="text-sm text-zinc-400">You have {stagedRejections.length} field(s) selected for correction. Are you sure you want to discard these selections and close the form?</p>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setShowDiscardConfirm(false)}>Keep Editing</Button>
                <Button variant="danger" onClick={() => {
                  setShowDiscardConfirm(false);
                  setStagedRejections([]);
                  setIsChangeMode(false);
                  setPreviewDoc(null);
                }}>Discard & Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Bulk Confirm */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Return to Intake?</h3>
              <p className="text-sm text-zinc-400">You are about to wipe {stagedRejections.length} field(s) and bounce this form back to the Intake Coordinator.</p>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setShowSubmitConfirm(false)}>Cancel</Button>
                <Button variant="danger" onClick={handleBulkRejectSubmit}>Confirm & Send</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>,
      document.body
    )}

    </div>
  );
}
