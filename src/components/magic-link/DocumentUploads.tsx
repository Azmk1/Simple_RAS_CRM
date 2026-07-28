import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, X } from 'lucide-react';
import { SectionCard } from './FormUIHelpers';
import { toast } from 'sonner';

export function DocumentUploads({ formData, handleBlur, rejectionDetails = {}, isRejectionMode = false }: any) {
  
  // Conditional logic for required/optional docs based on Form 01
  const hasMedicaid = formData['hasMedicaid'] && formData['hasMedicaid'] !== 'No' && formData['hasMedicaid'] !== 'Not Sure';
  const hasIEP = formData['hasIEP'] === 'Yes — Attached' || formData['hasIEP'] === 'Yes — Will Provide';
  const hasCustodyDoc = formData['custodyDocAttached'] === 'Yes — Attached' || formData['custodyDocAttached'] === 'Yes — Will Provide';
  const hasPriorABA = formData['hasPriorABA'] === 'Yes';
  
  // Form 02 signature acts as the "document" for Form 02
  const form02Signed = !!formData['sig1Name'];

  return (
    <div id="docs" className="scroll-mt-10">
      <SectionCard title="Required Documents">
        <p className="text-slate-400 text-sm mb-6">Please upload clear photos or PDFs of the following documents. These are required for insurance authorization.</p>
        
        <div className="space-y-4">
          <UploadWidget 
            label="1a. Primary Insurance Card (Front)" 
            fieldId="docInsuranceFront" 
            required={true}
            currentValue={formData['docInsuranceFront']} 
            onChange={handleBlur} 
            rejectionReason={rejectionDetails['insuranceCardFrontUploaded']}
            isRejectionMode={isRejectionMode}
          />

          <UploadWidget 
            label="1b. Primary Insurance Card (Back)" 
            fieldId="docInsuranceBack" 
            required={true}
            currentValue={formData['docInsuranceBack']} 
            onChange={handleBlur} 
            rejectionReason={rejectionDetails['insuranceCardBackUploaded']}
            isRejectionMode={isRejectionMode}
          />
          
          {hasMedicaid && (
            <>
              <UploadWidget 
                label="2a. Medicaid Card / Benefit Card (Front)" 
                fieldId="docMedicaidFront" 
                required={true}
                currentValue={formData['docMedicaidFront']} 
                onChange={handleBlur} 
                rejectionReason={rejectionDetails['medicaidCardFrontUploaded']}
                isRejectionMode={isRejectionMode}
              />
              <UploadWidget 
                label="2b. Medicaid Card / Benefit Card (Back)" 
                fieldId="docMedicaidBack" 
                required={true}
                currentValue={formData['docMedicaidBack']} 
                onChange={handleBlur} 
                rejectionReason={rejectionDetails['medicaidCardBackUploaded']}
                isRejectionMode={isRejectionMode}
              />
            </>
          )}
          
          <UploadWidget 
            label="3. Diagnostic Evaluation Report (DSM-5 / autism diagnosis)" 
            description="The full evaluation report from the diagnosing provider."
            fieldId="docEval" 
            required={true}
            currentValue={formData['docEval']} 
            onChange={handleBlur} 
            rejectionReason={rejectionDetails['diagnosticEvalUploaded']}
            isRejectionMode={isRejectionMode}
          />
          
          <UploadWidget 
            label="4. Physician Referral or Prescription for ABA" 
            fieldId="docReferral" 
            required={true}
            currentValue={formData['docReferral']} 
            onChange={handleBlur} 
            rejectionReason={rejectionDetails['physicianRxUploaded']}
            isRejectionMode={isRejectionMode}
          />
          
          {hasIEP && (
            <UploadWidget 
              label="5. IEP / IFSP (School Plan)" 
              fieldId="docIEP" 
              required={true}
              currentValue={formData['docIEP']} 
              onChange={handleBlur} 
              rejectionReason={rejectionDetails['iepUploaded']}
              isRejectionMode={isRejectionMode}
            />
          )}
          
          {hasCustodyDoc && (
            <UploadWidget 
              label="6. Legal Custody, Guardianship, or Foster Placement Order" 
              fieldId="docCustody" 
              required={true}
              currentValue={formData['docCustody']} 
              onChange={handleBlur} 
              rejectionReason={rejectionDetails['custodyDocsUploaded']}
              isRejectionMode={isRejectionMode}
            />
          )}
          
          {hasPriorABA && (
            <UploadWidget 
              label="7. Prior ABA records or treatment plan" 
              fieldId="docPriorABA" 
              required={true}
              currentValue={formData['docPriorABA']} 
              onChange={handleBlur} 
              rejectionReason={rejectionDetails['priorAbaRecordsUploaded']}
              isRejectionMode={isRejectionMode}
            />
          )}
          
          {/* Item 8: Form 02 Signature (Auto-completed) */}
          <div className={`doc-item ${form02Signed ? 'uploaded' : 'missing'}`} style={{cursor: 'default'}}>
            <div className="doc-icon">
              {form02Signed ? (
                <div className="w-8 h-8 rounded-full bg-[rgba(79,232,206,0.15)] border border-[var(--teal)] flex items-center justify-center text-[var(--teal)] shadow-[0_0_10px_rgba(79,232,206,0.2)]">
                  <CheckCircle2 size={16} />
                </div>
              ) : '↑'}
            </div>
            <div className="flex-1">
              <div className="doc-title">
                8. Form 02: Consent & Authorization
                <span className="req-badge">REQUIRED</span>
              </div>
              <div className="doc-desc">
                {form02Signed ? "Auto-completed: You have digitally signed Form 02." : "Pending: Complete the signature section in Form 02 above."}
              </div>
            </div>
          </div>

        </div>
      </SectionCard>
    </div>
  );
}

// UI Helper for Upload
function UploadWidget({ label, description, fieldId, required, currentValue, onChange, rejectionReason, isRejectionMode }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isUploaded = !!currentValue;
  const isLocked = isRejectionMode && isUploaded;
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File must be smaller than 5MB');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, JPEG, and PNG files are allowed');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!res.ok) throw new Error('Upload failed');
        
        const data = await res.json();
        
        onChange(fieldId, {
          name: data.name,
          size: data.size,
          type: data.type,
          url: data.url
        });
      } catch (err) {
        console.error('Failed to upload', err);
        toast.error('File upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(fieldId, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  const isMissing = required && !isUploaded;

  return (
    <div 
      onClick={() => !isUploaded && !isLocked && fileInputRef.current?.click()}
      className={`doc-item ${isUploaded ? 'uploaded' : ''} ${isMissing ? 'missing' : ''} ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept=".pdf,image/jpeg,image/png"
      />
      
      <div className="doc-icon">
        {isUploading ? (
          <div className="animate-spin w-4 h-4 border-2 border-brand-blue-500 border-t-transparent rounded-full" />
        ) : isUploaded ? (
          <div className="w-8 h-8 rounded-full bg-[rgba(79,232,206,0.15)] border border-[var(--teal)] flex items-center justify-center text-[var(--teal)] shadow-[0_0_10px_rgba(79,232,206,0.2)]">
            <CheckCircle2 size={16} />
          </div>
        ) : '↑'}
      </div>
      
      <div className="flex-1">
        <div className="doc-title">
          {label}
          {required ? <span className="req-badge">REQUIRED</span> : <span className="opt-badge">OPTIONAL</span>}
        </div>
        
        {isUploading ? (
          <div className="doc-desc text-brand-blue-500">
            Uploading document...
          </div>
        ) : isUploaded ? (
          <div className="doc-desc">
            <span className="text-teal font-bold">{currentValue.name}</span> ({currentValue.size})
          </div>
        ) : (
          <div className="doc-desc">
            {description || 'Tap to select PDF or image file.'}
          </div>
        )}
        {rejectionReason && !isUploaded && (
          <div className="mt-2 text-sm text-red-500 bg-red-500/10 p-3 rounded border border-red-500/20">
            <strong>Changes Requested:</strong> {rejectionReason}
          </div>
        )}
      </div>

      {isUploaded && !isUploading && !isLocked && (
        <button 
          onClick={clearFile}
          className="shrink-0 p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Remove file"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      )}
    </div>
  );
}
