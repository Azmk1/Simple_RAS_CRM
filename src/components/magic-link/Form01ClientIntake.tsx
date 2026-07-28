import React, { useState, useRef, useEffect, useContext } from 'react';
import { SectionCard, AutoSaveInput, AutoSaveTextArea, AutoSaveSelect, AutoSaveRadio, AutoSaveCheckbox, AutoSaveDateInput, AdminReviewContext, FieldWrapper, ReadOnlyDisplay } from './FormUIHelpers';
import { AutoSaveAddressInput } from './AutoSaveAddressInput';

function SplitTimePicker({ value, onChange, hasError, fieldId }: { value?: string, onChange: (val: string) => void, hasError?: boolean, fieldId: string }) {
  const { readOnly, adminReviewMode } = useContext(AdminReviewContext);
  const [active, setActive] = useState<'HH' | 'MM' | 'AMPM' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  let h12 = '12';
  let min = '00';
  let ampm = 'PM';

  if (value) {
    const [h24Str, mStr] = value.split(':');
    const h24 = parseInt(h24Str, 10);
    min = mStr;
    ampm = h24 >= 12 ? 'PM' : 'AM';
    h12 = (h24 % 12 || 12).toString();
  }

  const handleChange = (newH12: string, newMin: string, newAmpm: string) => {
    let h24 = parseInt(newH12, 10);
    if (newAmpm === 'PM' && h24 !== 12) h24 += 12;
    if (newAmpm === 'AM' && h24 === 12) h24 = 0;
    const val24 = `${h24.toString().padStart(2, '0')}:${newMin}`;
    onChange(val24);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActive(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (readOnly && !adminReviewMode) {
    const displayValue = value ? `${h12}:${min} ${ampm}` : '';
    return <ReadOnlyDisplay label="Time" value={displayValue} />;
  }

  return (
    <FieldWrapper fieldId={fieldId}>
      <div ref={containerRef} className="relative inline-block w-full max-w-[200px]">
        <button 
          type="button" 
          onClick={() => setActive(active ? null : 'HH')} 
          className={`flex items-center justify-center gap-1 bg-black/50 border rounded-lg p-1.5 py-2 w-full hover:bg-white/5 transition-colors ${hasError ? 'border-red-500' : 'border-white/10'}`}
        >
          <span className={`text-white text-sm font-mono ${!value ? 'opacity-50' : ''} ${active === 'HH' ? 'text-brand-blue-400 bg-brand-blue-500/20 px-2 py-0.5 rounded' : 'px-2'}`}>
            {value ? h12 : 'HH'}
          </span>
          <span className="text-slate-500 font-bold">:</span>
          <span className={`text-white text-sm font-mono ${!value ? 'opacity-50' : ''} ${active === 'MM' ? 'text-brand-blue-400 bg-brand-blue-500/20 px-2 py-0.5 rounded' : 'px-2'}`}>
            {value ? min : 'MM'}
          </span>
          <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
          <span className={`font-bold text-sm ${!value ? 'opacity-50 text-brand-orange-400' : 'text-brand-orange-400'} ${active === 'AMPM' ? 'text-brand-orange-300 bg-brand-orange-500/20 px-2 py-0.5 rounded' : 'px-2'}`}>
            {value ? ampm : '--'}
          </span>
        </button>

        {active === 'HH' && (
          <div className="absolute top-full left-0 mt-2 p-3 bg-navy-900 border border-white/10 rounded-xl shadow-2xl z-50 w-[200px] grid grid-cols-3 gap-2">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => {
              const hStr = h.toString();
              return (
                <button
                  key={`h-${h}`}
                  type="button"
                  onClick={() => {
                    handleChange(hStr, min, ampm);
                    setActive('MM');
                  }}
                  className={`text-sm py-1.5 rounded-md hover:bg-white/10 ${hStr === h12 ? 'bg-brand-blue-500 text-white font-bold' : 'text-slate-300'}`}
                >
                  {hStr}
                </button>
              );
            })}
          </div>
        )}

        {active === 'MM' && (
          <div className="absolute top-full left-0 mt-2 p-3 bg-navy-900 border border-white/10 rounded-xl shadow-2xl z-50 w-[200px] grid grid-cols-2 gap-2">
            {['00','15','30','45'].map(m => (
              <button
                key={`m-${m}`}
                type="button"
                onClick={() => {
                  handleChange(h12, m, ampm);
                  setActive('AMPM');
                }}
                className={`text-sm py-1.5 rounded-md hover:bg-white/10 ${m === min ? 'bg-brand-blue-500 text-white font-bold' : 'text-slate-300'}`}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {active === 'AMPM' && (
          <div className="absolute top-full left-0 mt-2 p-3 bg-navy-900 border border-white/10 rounded-xl shadow-2xl z-50 w-[120px] flex flex-col gap-2">
            {['AM', 'PM'].map(a => (
              <button
                key={`a-${a}`}
                type="button"
                onClick={() => {
                  handleChange(h12, min, a);
                  setActive(null);
                }}
                className={`text-sm py-1.5 rounded-md hover:bg-white/10 ${a === ampm ? 'bg-brand-orange-500 text-white font-bold' : 'text-slate-300'}`}
              >
                {a}
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}

export function Form01ClientIntake({ formData, handleBlur, client, readOnly, isRejectionMode = false, adminReviewMode = false, rejectedFields = [], stagedRejections = [], onRejectField = () => {} }: any) {
  const [timeErrors, setTimeErrors] = useState<Record<string, string>>({});
  
  // Conditional UI booleans
  const custodyType = formData['custodyType'];
  const hasSecondPlan = formData['hasSecondPlan'] === 'Yes';
  const hasMedicaid = formData['hasMedicaid'] && formData['hasMedicaid'] !== 'No' && formData['hasMedicaid'] !== 'Not Sure';
  const hasMedicaidLapse = formData['medicaidLapsed'] === 'Yes';
  const hasDiagnosis = formData['hasDiagnosis'] === 'Yes' || formData['hasDiagnosis'] === 'Evaluation Scheduled';
  const hasReferral = formData['hasReferral'] === 'Yes - Attached' || formData['hasReferral'] === 'Yes - Will Provide';
  const hasPriorABA = formData['hasPriorABA'] === 'Yes';
  const isHomeLocation = formData['prefLocation'] === 'Home';
  const hasPets = formData['hasPets'] === 'Yes';

  const handleTimeChange = (day: string, fieldId: string, val: string) => {
    // Save to state first
    handleBlur(fieldId, val);

    // Validate the pair for this day
    const isFrom = fieldId.endsWith('_from');
    const fromId = isFrom ? fieldId : `avail_${day}_from`;
    const toId = isFrom ? `avail_${day}_to` : fieldId;
    
    // We get the other value from either the new val or formData
    const fromVal = isFrom ? val : formData[fromId];
    const toVal = isFrom ? formData[toId] : val;

    if (fromVal && toVal) {
      // Parse "HH:MM"
      const [fH, fM] = fromVal.split(':').map(Number);
      const [tH, tM] = toVal.split(':').map(Number);
      if (fH > tH || (fH === tH && fM >= tM)) {
        setTimeErrors(prev => ({ ...prev, [day]: 'End time must be after start time' }));
      } else {
        setTimeErrors(prev => {
          const next = { ...prev };
          delete next[day];
          return next;
        });
      }
    } else {
      setTimeErrors(prev => {
        const next = { ...prev };
        delete next[day];
        return next;
      });
    }
  };

  return (

    <AdminReviewContext.Provider value={{ 
      adminReviewMode: adminReviewMode || false, 
      isRejectionMode: isRejectionMode || false,
      readOnly: readOnly || false,
      rejectedFields: rejectedFields || [],
      stagedRejections: stagedRejections || [],
      onRejectField: onRejectField || (() => {}) 
    }}>
      <div className={`p-8 max-w-4xl mx-auto space-y-12 form-container`}>
        {readOnly && !adminReviewMode && (
          <div className="mb-6">
            <div className="bg-brand-blue-500/10 border border-brand-blue-500 rounded-xl p-4 flex items-center gap-3 shadow-lg">
              <span className="text-brand-blue-500 font-bold">🔒 Review Needed</span>
              <span className="text-slate-300 text-sm">This form has been submitted and is locked for clinic review.</span>
            </div>
          </div>
        )}
        {!readOnly && !adminReviewMode && isRejectionMode && (
          <div className="mb-6">
            <div className="bg-brand-orange-500/10 border border-brand-orange-500 rounded-xl p-4 flex items-center gap-3 shadow-lg">
              <span className="text-brand-orange-500 font-bold">⚠️ Changes Needed</span>
              <span className="text-slate-300 text-sm">The clinic has requested changes to specific fields below. Please update them and re-submit this step.</span>
            </div>
          </div>
        )}
        {adminReviewMode && (
          <div className="mb-6">
            <div className="bg-brand-orange-500/10 border border-brand-orange-500 rounded-xl p-4 flex items-center gap-3 shadow-lg">
              <span className="text-brand-orange-500 font-bold">🕵️ Admin Review Mode</span>
              <span className="text-slate-300 text-sm">Click on any field to reject it. It will be wiped and sent back to the client.</span>
            </div>
          </div>
        )}
        <div className="">
      {/* SECTION A */}
      <div id="sec-a">
        <SectionCard title="A. Child Information">
          <div>
            <div className="field-grid">
              <AutoSaveInput label="Child's Full Legal Name" fieldId="childName" defaultValue={formData['childName'] || `${client.firstName} ${client.lastName}`} onBlur={handleBlur}  required={true} />
              <AutoSaveInput label="Name your child goes by (if different)" fieldId="preferredName" defaultValue={formData['preferredName']} onBlur={handleBlur} />
            </div>
            <div className="field-grid three">
              <AutoSaveDateInput label="Date of Birth" type="text" placeholder="MM/DD/YYYY" fieldId="dob" defaultValue={formData['dob'] || client.dateOfBirth?.split('T')[0]} onBlur={handleBlur}  required={true} />
              <AutoSaveSelect label="Sex Assigned At Birth" fieldId="sexAtBirth" options={['Male', 'Female']} defaultValue={formData['sexAtBirth']} onBlur={handleBlur}  required={true} />
            </div>
            <AutoSaveCheckbox 
              label="Does the child live with their parents/guardians?" 
              fieldId="childLivesWithParents" 
              currentValue={formData['childLivesWithParents']} 
              onChange={handleBlur} 
            />
            
            {!formData['childLivesWithParents'] && (
              <AutoSaveAddressInput 
                  label="Child's Home Address" 
                  fieldId="childAddress" 
                  defaultValue={formData['childAddress']} 
                  onBlur={handleBlur} 
                  required={true}
                  onAddressSelect={(addr: any) => {
                    handleBlur({
                      childAddress: [addr.street, addr.city, addr.state, addr.zip].filter(Boolean).join(', '),
                      childCity: addr.city,
                      childState: addr.state,
                      childZip: addr.zip
                    });
                  }}
                />
            )}
            <div className="field-grid">
              <AutoSaveInput label="Primary Language Spoken at Home" fieldId="primaryLang" defaultValue={formData['primaryLang']} onBlur={handleBlur}  required={true} />
              <AutoSaveInput label="Other Languages" fieldId="otherLang" defaultValue={formData['otherLang']} onBlur={handleBlur} />
            </div>
            <div style={{marginTop: '24px'}}>
              <h4>Medical & History</h4>
              <div className="field-grid">
                <AutoSaveTextArea label="Allergies (List or N/A)" fieldId="allergies" defaultValue={formData['allergies']} onBlur={handleBlur} />
                <AutoSaveTextArea label="Current Medications (List or N/A)" fieldId="meds" defaultValue={formData['meds']} onBlur={handleBlur} />
              </div>
              <div className="field-grid">
                <div className="span-2">
                  <AutoSaveTextArea label="Any Medical Conditions? (or N/A)" fieldId="medConditions" defaultValue={formData['medConditions']} onBlur={handleBlur} />
                </div>
              </div>
              <div className="field-grid">
                <AutoSaveRadio label="History of Elopement (Running/Wandering)?" fieldId="elopement" options={['Yes', 'No']} currentValue={formData['elopement']} onChange={handleBlur}  required={true} />
                <AutoSaveInput label="Dietary Restrictions (or N/A)" fieldId="diet" defaultValue={formData['diet']} onBlur={handleBlur} />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* SECTION B */}
      <div id="sec-b" className="scroll-mt-10">
        <SectionCard title="B. Parent / Guardian Information">
          <div>
            <h4 className="text-sm font-bold text-white mb-4 border-l-2 border-brand-orange-500 pl-3">Guardian 1 (Primary Contact)</h4>
            <div className="field-grid">
              <AutoSaveInput label="Full Legal Name" fieldId="g1Name" defaultValue={formData['g1Name'] || client.guardianName} onBlur={handleBlur}  required={true} />
              <AutoSaveInput label="Relationship to Child" fieldId="g1Relation" defaultValue={formData['g1Relation']} onBlur={handleBlur} />
              <AutoSaveInput label="Mobile Phone" type="tel" fieldId="g1Phone" defaultValue={formData['g1Phone'] || client.guardianPhone} onBlur={handleBlur}  required={true} />
              <AutoSaveInput label="Email Address" type="email" fieldId="g1Email" defaultValue={formData['g1Email'] || client.guardianEmail} onBlur={handleBlur} required={true} />
            </div>
            <AutoSaveAddressInput 
              label="Parents Address" 
              fieldId="g1Address" 
              defaultValue={formData['g1Address']} 
              onBlur={handleBlur} 
              onAddressSelect={(addr: any) => {
                handleBlur('g1Address', [addr.street, addr.city, addr.state, addr.zip].filter(Boolean).join(', '));
              }}
            />
            <div className="field-grid">
              <AutoSaveSelect label="Preferred Contact Method" fieldId="g1ContactPref" options={['Phone Call', 'Text Message', 'Email', 'Secure Portal']} defaultValue={formData['g1ContactPref']} onBlur={handleBlur}  required={true} />
              <AutoSaveInput label="Best Times to Reach You" fieldId="g1BestTimes" defaultValue={formData['g1BestTimes']} onBlur={handleBlur} />
            </div>

            <div className="pt-6 mt-6 border-t border-white/5">
              <h4 className="text-sm font-bold text-white mb-4 border-l-2 border-brand-blue-500 pl-3">Guardian 2 (Optional)</h4>
              <div className="field-grid">
                <AutoSaveInput label="Full Legal Name (or N/A)" fieldId="g2Name" defaultValue={formData['g2Name']} onBlur={handleBlur} />
                <AutoSaveInput label="Relationship to Child" fieldId="g2Relation" defaultValue={formData['g2Relation']} onBlur={handleBlur} />
                <AutoSaveInput label="Mobile Phone" type="tel" fieldId="g2Phone" defaultValue={formData['g2Phone']} onBlur={handleBlur} />
                <AutoSaveInput label="Email Address" type="email" fieldId="g2Email" defaultValue={formData['g2Email']} onBlur={handleBlur} />
              </div>
              <AutoSaveAddressInput 
                label="Parents Address" 
                fieldId="g2Address" 
                defaultValue={formData['g2Address']} 
                onBlur={handleBlur} 
                onAddressSelect={(addr: any) => {
                  handleBlur('g2Address', [addr.street, addr.city, addr.state, addr.zip].filter(Boolean).join(', '));
                }}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* SECTION C */}
      <div id="sec-c" className="scroll-mt-10">
        <SectionCard title="C. Legal Custody & Guardianship">
          <div>
            <AutoSaveRadio 
              label="Who has legal custody of the child?" 
              fieldId="custodyType" 
              options={['Both Parents', 'Mother Only', 'Father Only', 'Legal Guardian', 'Foster / Kinship Placement', 'Other']} 
              currentValue={custodyType} 
              onChange={handleBlur} 
             required={true} />
            
            {custodyType && custodyType !== 'Both Parents' && (
              <div className="animate-in fade-in slide-in-from-top-4">
                <AutoSaveTextArea 
                  label="If custody is shared or restricted, describe court-ordered limits:" 
                  fieldId="custodyLimits" 
                  defaultValue={formData['custodyLimits']} 
                  onBlur={handleBlur} 
                />
              </div>
            )}
            
            <AutoSaveInput 
              label="If the person consenting is NOT a parent, Name & Relationship:" 
              fieldId="nonParentConsenter" 
              defaultValue={formData['nonParentConsenter']} 
              onBlur={handleBlur} 
            />
            
            <AutoSaveRadio 
              label="Is there a custody order, guardianship order, or foster placement document?" 
              fieldId="custodyDocAttached" 
              options={['Yes — Attached', 'Yes — Will Provide', 'No']} 
              currentValue={formData['custodyDocAttached']} 
              onChange={handleBlur} 
             required={true} />
          </div>
        </SectionCard>
      </div>

      {/* SECTION D */}
      <div id="sec-d" className="scroll-mt-10">
        <SectionCard title="D. Primary Insurance">
          <div>
            <div className="field-grid">
              <AutoSaveInput label="Insurance Company Name" fieldId="priInsCompany" defaultValue={formData['priInsCompany'] || client.insurancePayer} onBlur={handleBlur}  required={true} />
              <AutoSaveInput label="Plan Name (if shown)" fieldId="priInsPlan" defaultValue={formData['priInsPlan']} onBlur={handleBlur} />
              <AutoSaveInput label="Member ID (Exactly as printed)" fieldId="priInsMemberId" defaultValue={formData['priInsMemberId'] || client.memberId} onBlur={handleBlur}  required={true} />
              <AutoSaveInput label="Group Number" fieldId="priInsGroup" defaultValue={formData['priInsGroup']} onBlur={handleBlur} />
            </div>
            <div className="pt-4 border-t border-white/5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Policyholder Details</h4>
              <div className="field-grid">
                <AutoSaveInput label="Policyholder / Subscriber Full Name" fieldId="priInsHolderName" defaultValue={formData['priInsHolderName']} onBlur={handleBlur} />
                <AutoSaveDateInput label="Policyholder Date of Birth" type="text" placeholder="MM/DD/YYYY" fieldId="priInsHolderDob" defaultValue={formData['priInsHolderDob']} onBlur={handleBlur} />
                <AutoSaveInput label="Relationship to Child" fieldId="priInsHolderRel" defaultValue={formData['priInsHolderRel']} onBlur={handleBlur} />
                <AutoSaveDateInput label="Coverage Effective Date" type="text" placeholder="MM/DD/YYYY" fieldId="priInsEffective" defaultValue={formData['priInsEffective']} onBlur={handleBlur} />
                <AutoSaveInput label="Member Services Phone (on back of card)" type="tel" fieldId="priInsPhone" defaultValue={formData['priInsPhone']} onBlur={handleBlur} />
                <AutoSaveInput label="Employer (if plan is through work)" fieldId="priInsEmployer" defaultValue={formData['priInsEmployer']} onBlur={handleBlur} />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* SECTION E */}
      <div id="sec-e" className="scroll-mt-10">
        <SectionCard title="E. Secondary Insurance">
          <div>
            <AutoSaveRadio 
              label="Does the child have secondary insurance?" 
              fieldId="hasSecondPlan" 
              options={['Yes', 'No']} 
              currentValue={formData['hasSecondPlan']} 
              onChange={handleBlur} 
             required={true} />
            {hasSecondPlan && (
              <div className="field-grid">
                <AutoSaveInput label="Insurance Company Name" fieldId="secInsCompany" defaultValue={formData['secInsCompany']} onBlur={handleBlur} />
                <AutoSaveInput label="Member ID" fieldId="secInsMemberId" defaultValue={formData['secInsMemberId']} onBlur={handleBlur} />
                <AutoSaveInput label="Group Number" fieldId="secInsGroup" defaultValue={formData['secInsGroup']} onBlur={handleBlur} />
                <AutoSaveDateInput label="Coverage Effective Date" type="text" placeholder="MM/DD/YYYY" fieldId="secInsEffective" defaultValue={formData['secInsEffective']} onBlur={handleBlur} />
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* SECTION F */}
      <div id="sec-f" className="scroll-mt-10">
        <SectionCard title="F. Medicaid">
          <div>
            <AutoSaveRadio 
              label="Does your child have Medicaid?" 
              fieldId="hasMedicaid" 
              options={['Yes, New York', 'Yes, New Jersey', 'Yes, Other State', 'No', 'Not Sure']} 
              currentValue={formData['hasMedicaid']} 
              onChange={handleBlur} 
             required={true} />
            
            {hasMedicaid && (
              <div className="space-y-6 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-4">
                {formData['hasMedicaid'] === 'Yes, Other State' && (
                  <AutoSaveInput label="Which State?" fieldId="medicaidStateOther" defaultValue={formData['medicaidStateOther']} onBlur={handleBlur} />
                )}
                <div className="field-grid">
                  <AutoSaveInput label="Medicaid ID / CIN" fieldId="medicaidId" defaultValue={formData['medicaidId'] || client.medicaidId} onBlur={handleBlur} />
                  <AutoSaveInput label="MCO / Plan Name (e.g. Fidelis, Healthfirst)" fieldId="medicaidMCO" defaultValue={formData['medicaidMCO']} onBlur={handleBlur}  required={true} />
                </div>
                
                <AutoSaveRadio 
                  label="Has your child's Medicaid ever lapsed or required renewal?" 
                  fieldId="medicaidLapsed" 
                  options={['Yes', 'No', 'Not Sure']} 
                  currentValue={formData['medicaidLapsed']} 
                  onChange={handleBlur} 
                />
                
                {hasMedicaidLapse && (
                  <AutoSaveInput label="Renewal / Recertification Date, if known" type="text" placeholder="MM/DD/YYYY" fieldId="medicaidRenewal" defaultValue={formData['medicaidRenewal']} onBlur={handleBlur} className="w-1/2" />
                )}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* SECTION G */}
      <div id="sec-g" className="scroll-mt-10">
        <SectionCard title="G. Primary Care Physician (PCP)">
          <div>
            <p className="text-slate-400 text-sm mb-4">Some plans require a PCP referral as a condition of coverage. We may also need to coordinate care.</p>
            <div className="field-grid">
              <AutoSaveInput label="PCP Name" fieldId="pcpName" defaultValue={formData['pcpName']} onBlur={handleBlur} />
              <AutoSaveInput label="Practice Name" fieldId="pcpPractice" defaultValue={formData['pcpPractice']} onBlur={handleBlur} />
              <AutoSaveInput label="Phone" type="tel" fieldId="pcpPhone" defaultValue={formData['pcpPhone']} onBlur={handleBlur} />
              <AutoSaveInput label="Fax" type="tel" fieldId="pcpFax" defaultValue={formData['pcpFax']} onBlur={handleBlur} />
            </div>
            <AutoSaveInput label="Address" fieldId="pcpAddress" defaultValue={formData['pcpAddress']} onBlur={handleBlur} />
            <AutoSaveInput label="Date of your child's most recent well visit" type="text" placeholder="MM/DD/YYYY" fieldId="pcpLastVisit" defaultValue={formData['pcpLastVisit']} onBlur={handleBlur} className="w-1/2" />
          </div>
        </SectionCard>
      </div>

      {/* SECTION H */}
      <div id="sec-h" className="scroll-mt-10">
        <SectionCard title="H. Diagnosis & Diagnosing Provider">
          <div>
            <div className="bg-brand-orange-500/10 border border-brand-orange-500/30 rounded-xl p-4 mb-6">
              <p className="text-brand-orange-400 text-sm font-medium">Insurance will not authorize ABA without a qualifying diagnosis from a qualified evaluator. If your child has not yet been formally diagnosed, tell us — we will help you find an evaluator. Please do not leave this blank.</p>
            </div>
            
            <AutoSaveRadio 
              label="Has the child been diagnosed with Autism Spectrum Disorder (ASD)?" 
              fieldId="hasDiagnosis" 
              options={['Yes', 'No', 'Evaluation Scheduled']} 
              currentValue={formData['hasDiagnosis']} 
              onChange={handleBlur} 
             required={true} />

            {formData['hasDiagnosis'] === 'Evaluation Scheduled' && (
              <AutoSaveDateInput label="Evaluation Date" type="text" placeholder="MM/DD/YYYY" fieldId="evalDate" defaultValue={formData['evalDate']} onBlur={handleBlur} className="w-1/2 animate-in fade-in" />
            )}

            {hasDiagnosis && (
              <div className="space-y-6 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-4">
                <AutoSaveInput label="Diagnosis exactly as written on the report" fieldId="diagnosisText" defaultValue={formData['diagnosisText']} onBlur={handleBlur} />
                <div className="field-grid">
                  <AutoSaveInput label="Date of Initial Diagnosis" type="text" placeholder="MM/DD/YYYY" fieldId="dxInitialDate" defaultValue={formData['dxInitialDate']} onBlur={handleBlur}  required={true} />
                  <AutoSaveInput label="Date of Most Recent Evaluation" type="text" placeholder="MM/DD/YYYY" fieldId="dxRecentDate" defaultValue={formData['dxRecentDate']} onBlur={handleBlur}  required={true} />
                  <AutoSaveInput label="Diagnosing Provider's Full Name" fieldId="dxProviderName" defaultValue={formData['dxProviderName']} onBlur={handleBlur}  required={true} />
                  <AutoSaveInput label="Credentials (MD / DO / PhD / PsyD / NP)" fieldId="dxCredentials" defaultValue={formData['dxCredentials']} onBlur={handleBlur} />
                  <AutoSaveInput label="Practice Name" fieldId="dxPractice" defaultValue={formData['dxPractice']} onBlur={handleBlur} />
                  <AutoSaveInput label="Phone" type="tel" fieldId="dxPhone" defaultValue={formData['dxPhone']} onBlur={handleBlur} />
                </div>
                <AutoSaveInput label="Any additional (co-occurring) diagnoses — e.g. ADHD, Anxiety, Seizure Disorder — or N/A" fieldId="dxCooccurring" defaultValue={formData['dxCooccurring']} onBlur={handleBlur} />
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* SECTION I */}
      <div id="sec-i" className="scroll-mt-10">
        <SectionCard title="I. Referral / Prescription for ABA">
          <div>
            <AutoSaveRadio 
              label="Do you have a written prescription or referral for ABA Therapy from a physician?" 
              fieldId="hasReferral" 
              options={['Yes - Attached', 'Yes - Will Provide', 'No']} 
              currentValue={formData['hasReferral']} 
              onChange={handleBlur} 
             required={true} />

            {hasReferral && (
              <div className="space-y-6 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-4">
                <div className="field-grid">
                  <AutoSaveInput label="Referring Provider Name" fieldId="referralProvider" defaultValue={formData['referralProvider']} onBlur={handleBlur}  required={true} />
                  <AutoSaveDateInput label="Date of Referral" type="text" placeholder="MM/DD/YYYY" fieldId="referralDate" defaultValue={formData['referralDate']} onBlur={handleBlur}  required={true} />
                </div>
                
                <AutoSaveRadio 
                  label="Does the referral expire?" 
                  fieldId="referralExpires" 
                  options={['Yes', 'No', 'Not Sure']} 
                  currentValue={formData['referralExpires']} 
                  onChange={handleBlur} 
                 required={true} />
                
                {formData['referralExpires'] === 'Yes' && (
                  <AutoSaveInput label="Expiration Date" type="text" placeholder="MM/DD/YYYY" fieldId="referralExpDate" defaultValue={formData['referralExpDate']} onBlur={handleBlur} className="w-1/2 animate-in fade-in"  required={true} />
                )}
                
                <div className="bg-brand-blue-500/10 border border-brand-blue-500/30 rounded-xl p-4 mt-6">
                  <p className="text-brand-blue-400 text-sm font-bold mb-2">Note for NY Medicaid Referrals</p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    NY Medicaid will not approve ABA unless the referral is signed by a physician, psychologist, or nurse practitioner AND contains all of the following: <br/>
                    • Patient's age & diagnosis (with date of initial diagnosis)<br/>
                    • Co-morbidities & symptom severity<br/>
                    • Statement confirming patient requires ABA services<br/>
                    • A DSM-5 Diagnostic Checklist
                  </p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* SECTION J */}
      <div id="sec-j" className="scroll-mt-10">
        <SectionCard title="J. Current & Prior Services">
          <div>
            <AutoSaveRadio 
              label="Has the child received ABA Therapy in the past?" 
              fieldId="hasPriorABA" 
              options={['Yes', 'No']} 
              currentValue={formData['hasPriorABA']} 
              onChange={handleBlur} 
             required={true} />
            {hasPriorABA && (
              <AutoSaveTextArea label="If yes — Provider Name, Dates, and Reason Services Ended" fieldId="priorABAInfo" defaultValue={formData['priorABAInfo']} onBlur={handleBlur} className="animate-in fade-in" />
            )}

            <div className="pt-4 border-t border-white/5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Current Services (Check all that apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {['Speech', 'Occupational Therapy', 'Physical Therapy', 'Counseling', 'Early Intervention', 'CPSE / CSE', 'None'].map(srv => (
                  <label key={srv} className="flex items-center gap-2 text-sm text-slate-300">
                    <input 
                      type="checkbox" 
                      className="accent-brand-blue-500 w-4 h-4"
                      checked={(formData['currentServices'] || []).includes(srv)}
                      onChange={(e) => {
                        const current = formData['currentServices'] || [];
                        const updated = e.target.checked ? [...current, srv] : current.filter((x: string) => x !== srv);
                        handleBlur('currentServices', updated);
                      }}
                    /> {srv}
                  </label>
                ))}
              </div>
            </div>

            <div className="field-grid">
              <AutoSaveInput label="School or Program Name" fieldId="schoolName" defaultValue={formData['schoolName']} onBlur={handleBlur} />
              <AutoSaveInput label="Grade" fieldId="schoolGrade" defaultValue={formData['schoolGrade']} onBlur={handleBlur} />
            </div>

            <AutoSaveRadio 
              label="Does your child have an IEP or IFSP?" 
              fieldId="hasIEP" 
              options={['Yes — Attached', 'Yes — Will Provide', 'No']} 
              currentValue={formData['hasIEP']} 
              onChange={handleBlur} 
             required={true} />
            
            <AutoSaveInput label="Does your child have a Service Coordinator or Care Manager? Name & Agency, or N/A" fieldId="serviceCoordinator" defaultValue={formData['serviceCoordinator']} onBlur={handleBlur} />
          </div>
        </SectionCard>
      </div>

      {/* SECTION K */}
      <div id="sec-k" className="scroll-mt-10">
        <SectionCard title="K. Goals & Priorities">
          <div>
            <p className="text-slate-400 text-sm mb-4">In your own words: what would you most like ABA to help your child with? There are no wrong answers.</p>
            <AutoSaveTextArea label="Goals" fieldId="abaGoals" defaultValue={formData['abaGoals']} onBlur={handleBlur} />
            <AutoSaveTextArea label="Are there behaviors that are unsafe for your child or others? Please describe, or write N/A." fieldId="unsafeBehaviors" defaultValue={formData['unsafeBehaviors']} onBlur={handleBlur} />
            <AutoSaveTextArea label="What does your child enjoy? (Activities, toys, foods, characters, music)" fieldId="childInterests" defaultValue={formData['childInterests']} onBlur={handleBlur} />
          </div>
        </SectionCard>
      </div>

      {/* SECTION L */}
      <div id="sec-l" className="scroll-mt-10">
        <SectionCard title="L. Availability & Service Location">
          <div>
            <p className="text-brand-orange-400 text-sm font-medium mb-4">Please be specific. "Afternoons" is not enough for us to match a therapist. "Monday, Wednesday, Friday, 3:30-6:30 PM" lets us start scheduling immediately.</p>
            
            <AutoSaveRadio 
              label="Where are you looking to receive ABA Services?" 
              fieldId="prefLocation" 
              options={['Home', 'Community / Daycare / School', 'Clinic', 'Other']} 
              currentValue={formData['prefLocation']} 
              onChange={handleBlur} 
             required={true} />

            {isHomeLocation && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 bg-white/5 p-6 rounded-xl border border-white/10">
                <AutoSaveRadio label="Is there a quiet space available?" fieldId="quietSpace" options={['Yes', 'No']} currentValue={formData['quietSpace']} onChange={handleBlur}  required={true} />
                
                <div className="flex gap-4 items-center">
                  <AutoSaveRadio label="Any pets in the home?" fieldId="hasPets" options={['Yes', 'No']} currentValue={formData['hasPets']} onChange={handleBlur}  required={true} />
                  {hasPets && (
                    <div className="flex-1 mt-4">
                      <AutoSaveInput label="Type(s)" fieldId="petTypes" defaultValue={formData['petTypes']} onBlur={handleBlur} />
                    </div>
                  )}
                </div>
                
                <AutoSaveInput label="Who else is typically home during session times?" fieldId="othersHome" defaultValue={formData['othersHome']} onBlur={handleBlur}  required={true} />
              </div>
            )}

            <div className="mt-8 border border-white/5 rounded-xl overflow-hidden bg-black/30">
              <div className="grid grid-cols-3 gap-1 bg-white/5 p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/10">
                <div>Day</div>
                <div>Available From</div>
                <div>Available Until</div>
              </div>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                const fIdFrom = `avail_${day}_from`;
                const fIdTo = `avail_${day}_to`;
                return (
                  <div key={day} className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${timeErrors[day] ? 'bg-red-500/10' : ''}`}>
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-sm text-slate-300 font-medium pl-2">{day}</div>
                      <SplitTimePicker 
                        value={formData[fIdFrom]} 
                        onChange={(val) => handleTimeChange(day, fIdFrom, val)} 
                        hasError={!!timeErrors[day]} 
                        fieldId={fIdFrom}
                      />
                      <SplitTimePicker 
                        value={formData[fIdTo]} 
                        onChange={(val) => handleTimeChange(day, fIdTo, val)} 
                        hasError={!!timeErrors[day]} 
                        fieldId={fIdTo}
                      />
                    </div>
                    {timeErrors[day] && <div className="text-red-400 text-xs mt-2 pl-2">{timeErrors[day]}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* SECTION M */}
      <div id="sec-m" className="scroll-mt-10">
        <SectionCard title="M. Emergency Contacts">
          <div>
            <h4 className="text-sm font-bold text-white mb-4 border-l-2 border-brand-orange-500 pl-3">Contact 1</h4>
            <div className="field-grid three">
              <AutoSaveInput label="Name" fieldId="em1Name" defaultValue={formData['em1Name']} onBlur={handleBlur}  required={true} />
              <AutoSaveInput label="Relationship" fieldId="em1Rel" defaultValue={formData['em1Rel']} onBlur={handleBlur} />
              <AutoSaveInput label="Phone" type="tel" fieldId="em1Phone" defaultValue={formData['em1Phone']} onBlur={handleBlur}  required={true} />
            </div>

            <h4 className="text-sm font-bold text-white mb-4 mt-6 border-l-2 border-brand-blue-500 pl-3">Contact 2</h4>
            <div className="field-grid three">
              <AutoSaveInput label="Name" fieldId="em2Name" defaultValue={formData['em2Name']} onBlur={handleBlur} />
              <AutoSaveInput label="Relationship" fieldId="em2Rel" defaultValue={formData['em2Rel']} onBlur={handleBlur} />
              <AutoSaveInput label="Phone" type="tel" fieldId="em2Phone" defaultValue={formData['em2Phone']} onBlur={handleBlur} />
            </div>

            <div className="pt-6 border-t border-white/5">
              <AutoSaveRadio 
                label="Do these contacts have permission to make medical decisions or schedule appointments on your behalf in your absence?" 
                fieldId="emPermission" 
                options={['Yes', 'No']} 
                currentValue={formData['emPermission']} 
                onChange={handleBlur} 
               required={true} />
              <div className="mt-6">
                <AutoSaveInput label="Preferred Hospital, if any" fieldId="prefHospital" defaultValue={formData['prefHospital']} onBlur={handleBlur} />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* SECTION O */}
      <div id="sec-o" className="scroll-mt-10">
        <SectionCard title="O. Parent / Guardian Attestation">
          <div className="space-y-8">
            <p className="text-slate-400 text-sm leading-relaxed mb-6 bg-white/5 p-6 rounded-2xl border border-white/10">
              I certify that the information I have provided on this form is true, accurate, and complete to the best of my knowledge. I understand that Rise & Shine ABA will rely on this information to verify insurance coverage and request authorization for services, and that inaccurate information may delay or prevent my child from receiving care. <br/><br/>
              I understand that I must notify Rise & Shine ABA promptly if my child's insurance, address, contact information, custody arrangement, or medical status changes.
            </p>
            
            <AutoSaveCheckbox 
              label="I agree to the attestation statement above." 
              fieldId="attestationAgree" 
              currentValue={formData['attestationAgree']} 
              onChange={handleBlur} 
             required={true} />

            <div className="mt-10">
              <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-3 ml-1">Digital Signature</h4>
              <div className={`w-full h-40 bg-black/50 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner group transition-colors ${!formData['attestationName'] ? 'missing' : 'border-brand-blue-500/50 bg-brand-blue-500/5'}`}>
                {formData['attestationName'] ? (
                   <span className="text-white text-5xl opacity-90" style={{ fontFamily: '"Dancing Script", cursive' }}>{formData['attestationName']}</span>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-6 mt-6">
                <AutoSaveInput 
                  label="Printed Name (Acts as Signature)" 
                  fieldId="attestationName" 
                  defaultValue={formData['attestationName']} 
                  onBlur={(id: string, val: string) => {
                    if (val && !formData['attestationDate']) {
                      handleBlur({ attestationName: val, attestationDate: new Date().toLocaleDateString() });
                    } else {
                      handleBlur(id, val);
                    }
                  }} 
                  required={true} 
                />
                <div className="field">
                  <label>Date Signed</label>
                  <div className="bg-black/50 border border-white/10 rounded-lg p-2.5 text-slate-400 text-sm font-mono flex items-center h-[42px]">
                    {formData['attestationDate'] || (formData['attestationName'] ? new Date().toLocaleDateString() : 'Pending Signature')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      </div>
    </div>
    </AdminReviewContext.Provider>
  );
}
