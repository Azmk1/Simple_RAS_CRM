'use client';

import React, { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ClipboardList, Plus, Trash2, Save, Send, CheckCircle, Activity, Target, Users, AlertTriangle, FileText, Library, BookmarkPlus, X } from 'lucide-react';
import { saveTreatmentPlan, getGoalTemplates, saveGoalTemplate } from '@/app/(dashboard)/portal-case/actions/clinical-support';
import { toast } from 'sonner';

export default function BcbaTreatmentPlanTab({ client }: { client: any }) {
  const [isPending, startTransition] = useTransition();

  // Load existing plan or set defaults
  const existingPlan = typeof client.treatmentPlan === 'string' 
    ? JSON.parse(client.treatmentPlan || '{}') 
    : (client.treatmentPlan || {});

  const [backgroundNotes, setBackgroundNotes] = useState(existingPlan.backgroundNotes || '');
  const [observationNotes, setObservationNotes] = useState(existingPlan.observationNotes || '');

  // Phase 1 State
  const [referringProvider, setReferringProvider] = useState(existingPlan.referringProvider || '');
  const [providerNpi, setProviderNpi] = useState(existingPlan.providerNpi || '');
  const [assessmentStartDate, setAssessmentStartDate] = useState(existingPlan.assessmentStartDate || '');
  const [assessmentEndDate, setAssessmentEndDate] = useState(existingPlan.assessmentEndDate || '');
  const [reassessmentDate, setReassessmentDate] = useState(existingPlan.reassessmentDate || '');
  const [assessorName, setAssessorName] = useState(existingPlan.assessorName || '');
  const [assessorCredentials, setAssessorCredentials] = useState(existingPlan.assessorCredentials || '');
  const [assessorEmail, setAssessorEmail] = useState(existingPlan.assessorEmail || '');
  const [assessorPhone, setAssessorPhone] = useState(existingPlan.assessorPhone || '');

  const [hours97151Eval, setHours97151Eval] = useState(existingPlan.hours97151Eval || '');
  const [hours97151Plan, setHours97151Plan] = useState(existingPlan.hours97151Plan || '');
  const [hours97153, setHours97153] = useState(existingPlan.hours97153 || '');
  const [hours97155, setHours97155] = useState(existingPlan.hours97155 || '');
  const [hours97156, setHours97156] = useState(existingPlan.hours97156 || '');

  const [servicePeriodStart, setServicePeriodStart] = useState(existingPlan.servicePeriodStart || '');
  const [servicePeriodEnd, setServicePeriodEnd] = useState(existingPlan.servicePeriodEnd || '');
  const [primaryLocations, setPrimaryLocations] = useState<string[]>(existingPlan.primaryLocations || []);
  const [serviceSchedule, setServiceSchedule] = useState<any>(() => {
    if (typeof existingPlan.serviceSchedule === 'object' && existingPlan.serviceSchedule !== null) return existingPlan.serviceSchedule;
    return { mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '' };
  });

  // Phase 2 State: Biopsychosocial
  const [familyStructure, setFamilyStructure] = useState(existingPlan.familyStructure || '');
  const [medicalHistory, setMedicalHistory] = useState(existingPlan.medicalHistory || '');
  const [developmentalHistory, setDevelopmentalHistory] = useState(existingPlan.developmentalHistory || '');
  const [school, setSchool] = useState(existingPlan.school || '');
  const [relatedServices, setRelatedServices] = useState(existingPlan.relatedServices || '');
  const [clientStrengths, setClientStrengths] = useState(existingPlan.clientStrengths || '');

  // Phase 2 State: Assessments & Observations
  const [parentInterviewDate, setParentInterviewDate] = useState(existingPlan.parentInterviewDate || '');
  const [recordReviewDate, setRecordReviewDate] = useState(existingPlan.recordReviewDate || '');
  const [atecScore, setAtecScore] = useState(existingPlan.atecScore || '');
  
  const [observation1Date, setObservation1Date] = useState(existingPlan.observation1Date || '');
  const [observation1Setting, setObservation1Setting] = useState(existingPlan.observation1Setting || '');
  const [observation1Narrative, setObservation1Narrative] = useState(existingPlan.observation1Narrative || '');
  const [observation2Date, setObservation2Date] = useState(existingPlan.observation2Date || '');
  const [observation2Setting, setObservation2Setting] = useState(existingPlan.observation2Setting || '');
  const [observation2Narrative, setObservation2Narrative] = useState(existingPlan.observation2Narrative || '');
  const [currentDeficitsSummary, setCurrentDeficitsSummary] = useState(existingPlan.currentDeficitsSummary || '');

  // Phase 3 State: Domains
  const [langCommSeverity, setLangCommSeverity] = useState(existingPlan.langCommSeverity || '');
  const [langCommDescription, setLangCommDescription] = useState(existingPlan.langCommDescription || '');
  const [socialEmotionalSeverity, setSocialEmotionalSeverity] = useState(existingPlan.socialEmotionalSeverity || '');
  const [socialEmotionalDescription, setSocialEmotionalDescription] = useState(existingPlan.socialEmotionalDescription || '');
  const [adaptiveSeverity, setAdaptiveSeverity] = useState(existingPlan.adaptiveSeverity || '');
  const [adaptiveDescription, setAdaptiveDescription] = useState(existingPlan.adaptiveDescription || '');

  // Phase 4 State: Behavior Reduction
  const [maladaptiveSeverity, setMaladaptiveSeverity] = useState(existingPlan.maladaptiveSeverity || '');
  const [maladaptiveNarrative, setMaladaptiveNarrative] = useState(existingPlan.maladaptiveNarrative || '');

  // Phase 5 State: Care Coordination
  const [medicalNecessity, setMedicalNecessity] = useState(existingPlan.medicalNecessity || '');
  const [barriersToTreatment, setBarriersToTreatment] = useState(existingPlan.barriersToTreatment || '');
  const [preferenceAssessmentDate, setPreferenceAssessmentDate] = useState(existingPlan.preferenceAssessmentDate || '');
  const [highlyPreferredItems, setHighlyPreferredItems] = useState(existingPlan.highlyPreferredItems || '');
  const [generalizationPlan, setGeneralizationPlan] = useState(existingPlan.generalizationPlan || '');
  const [dischargeFadingPlan, setDischargeFadingPlan] = useState(existingPlan.dischargeFadingPlan || '');
  const [careCoordinationMeetings, setCareCoordinationMeetings] = useState<any[]>(existingPlan.careCoordinationMeetings || []);

  const [assessmentTool, setAssessmentTool] = useState(existingPlan.assessmentTool || 'Vineland-3');
  const [toolScores, setToolScores] = useState<any>(existingPlan.toolScores || {});
  const [clinicalInterpretation, setClinicalInterpretation] = useState(existingPlan.clinicalInterpretation || '');
  
  const [brp, setBrp] = useState<any[]>(existingPlan.brp || []);
  const [skillGoals, setSkillGoals] = useState<any[]>(existingPlan.skillGoals || []);
  const [parentGoals, setParentGoals] = useState<any[]>(existingPlan.parentGoals || []);
  
  const [hoursEvaluation, setHoursEvaluation] = useState(existingPlan.hoursEvaluation || '');
  const [hoursDirect, setHoursDirect] = useState(existingPlan.hoursDirect || '');
  
  const directHoursNum = parseFloat(hoursDirect) || 0;
  const recommendedSupervision = directHoursNum * 0.2;
  const [hoursSupervision, setHoursSupervision] = useState(existingPlan.hoursSupervision || '');
  const [hoursParentTraining, setHoursParentTraining] = useState(existingPlan.hoursParentTraining || '');

  const [crisisPlan, setCrisisPlan] = useState(existingPlan.crisisPlan || '');
  const [dischargeCriteria, setDischargeCriteria] = useState(existingPlan.dischargeCriteria || '');
  
  const [signature, setSignature] = useState(existingPlan.signature || '');

  const isAssembled = ['REPORT_ASSEMBLED', 'ACTIVE'].includes(client.status);
  const isFirstRender = useRef(true);

  // Template Library State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateType, setTemplateType] = useState<'SKILL' | 'BRP' | 'PARENT' | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isFetchingTemplates, setIsFetchingTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('');

  const getPayload = useCallback(() => {
    return {
      backgroundNotes, observationNotes, assessmentTool, toolScores, 
      clinicalInterpretation, brp, skillGoals, parentGoals, 
      hoursEvaluation, hoursDirect, 
      hoursSupervision: hoursSupervision || (directHoursNum > 0 ? recommendedSupervision.toString() : ''), 
      hoursParentTraining, crisisPlan, dischargeCriteria, signature,
      referringProvider, providerNpi, assessmentStartDate, assessmentEndDate, reassessmentDate,
      assessorName, assessorCredentials, assessorEmail, assessorPhone,
      hours97151Eval, hours97151Plan, hours97153, hours97155, hours97156,
      servicePeriodStart, servicePeriodEnd, primaryLocations, serviceSchedule,
      familyStructure, medicalHistory, developmentalHistory, school, relatedServices, clientStrengths,
      parentInterviewDate, recordReviewDate, atecScore,
      observation1Date, observation1Setting, observation1Narrative, 
      observation2Date, observation2Setting, observation2Narrative, currentDeficitsSummary,
      langCommSeverity, langCommDescription, socialEmotionalSeverity, socialEmotionalDescription, adaptiveSeverity, adaptiveDescription,
      maladaptiveSeverity, maladaptiveNarrative,
      medicalNecessity, barriersToTreatment, preferenceAssessmentDate, highlyPreferredItems, generalizationPlan, dischargeFadingPlan, careCoordinationMeetings
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundNotes, observationNotes, assessmentTool, toolScores, clinicalInterpretation, brp, skillGoals, parentGoals, hoursEvaluation, hoursDirect, hoursSupervision, directHoursNum, recommendedSupervision, hoursParentTraining, crisisPlan, dischargeCriteria, signature, referringProvider, providerNpi, assessmentStartDate, assessmentEndDate, reassessmentDate, assessorName, assessorCredentials, assessorEmail, assessorPhone, hours97151Eval, hours97151Plan, hours97153, hours97155, hours97156, servicePeriodStart, servicePeriodEnd, primaryLocations, serviceSchedule, familyStructure, medicalHistory, developmentalHistory, school, relatedServices, clientStrengths, parentInterviewDate, recordReviewDate, atecScore, observation1Date, observation1Setting, observation1Narrative, observation2Date, observation2Setting, observation2Narrative, currentDeficitsSummary, langCommSeverity, langCommDescription, socialEmotionalSeverity, socialEmotionalDescription, adaptiveSeverity, adaptiveDescription, maladaptiveSeverity, maladaptiveNarrative, medicalNecessity, barriersToTreatment, preferenceAssessmentDate, highlyPreferredItems, generalizationPlan, dischargeFadingPlan, careCoordinationMeetings]);

  // Auto-Save Effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        await saveTreatmentPlan(client.id, getPayload());
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [getPayload, client.id]);

  const getHighlightClass = (val: string) => {
    if (!val || val.trim() === '') {
      return '!border-yellow-500/50 !bg-yellow-500/10 focus:!border-yellow-400 placeholder:!text-yellow-500/50 transition-colors duration-300 missing-field';
    }
    return '!border-zinc-700 !bg-zinc-900 focus:!border-brand-blue-500 transition-colors duration-300';
  };

  // --- Handlers ---
  const handleAddBrp = () => setBrp([...brp, { behavior: '', baseline: '', topography: '', function: '', antecedent: '', consequence: '', ferb: '', proactive: '', reactive: '', risk: 'Low', mastery: '', currentLevel: '', targetDate: '', status: 'New' }]);
  const handleUpdateBrp = (index: number, field: string, value: string) => { const updated = [...brp]; updated[index][field] = value; setBrp(updated); };
  const handleRemoveBrp = (index: number) => setBrp(brp.filter((_, i) => i !== index));

  const handleAddSkill = () => setSkillGoals([...skillGoals, { domain: '', description: '', mastery: '', baseline: '', currentLevel: '', targetDate: '', status: 'New' }]);
  const handleUpdateSkill = (index: number, field: string, value: string) => { const updated = [...skillGoals]; updated[index][field] = value; setSkillGoals(updated); };
  const handleRemoveSkill = (index: number) => setSkillGoals(skillGoals.filter((_, i) => i !== index));

  const handleAddParentGoal = () => setParentGoals([...parentGoals, { description: '', mastery: '', baseline: '', currentLevel: '', targetDate: '', status: 'New' }]);
  const handleUpdateParentGoal = (index: number, field: string, value: string) => { const updated = [...parentGoals]; updated[index][field] = value; setParentGoals(updated); };
  const handleRemoveParentGoal = (index: number) => setParentGoals(parentGoals.filter((_, i) => i !== index));

  const handleAddCareMeeting = () => setCareCoordinationMeetings([...careCoordinationMeetings, { provider: '', contactInfo: '', notes: '' }]);
  const handleUpdateCareMeeting = (index: number, field: string, value: string) => { const updated = [...careCoordinationMeetings]; updated[index][field] = value; setCareCoordinationMeetings(updated); };
  const handleRemoveCareMeeting = (index: number) => setCareCoordinationMeetings(careCoordinationMeetings.filter((_, i) => i !== index));

  const handleSave = async (submit: boolean = false) => {
    if (submit && !isReadyToSubmit) {
      toast.error('Please complete all highlighted yellow fields before submitting.');
      
      // Small timeout to ensure DOM is ready and toast renders
      setTimeout(() => {
        const firstMissing = document.querySelector('.missing-field');
        if (firstMissing) {
          firstMissing.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Optional: Add a brief flash animation to the field
          firstMissing.classList.add('animate-pulse');
          setTimeout(() => firstMissing.classList.remove('animate-pulse'), 1000);
        }
      }, 100);
      return;
    }
    startTransition(async () => {
      const res = await saveTreatmentPlan(client.id, getPayload(), submit);
      if (res.success) {
        toast.success(submit ? 'Treatment Plan E-Signed & Routed' : 'Draft Saved Successfully');
      } else {
        toast.error('Failed to save Treatment Plan');
      }
    });
  };

  // --- Template Library Handlers ---
  const openTemplateLibrary = async (type: 'SKILL' | 'BRP' | 'PARENT') => {
    setTemplateType(type);
    setShowTemplateModal(true);
    setIsFetchingTemplates(true);
    setSearchQuery('');
    setDomainFilter('');
    
    const res = await getGoalTemplates(type);
    if (res.success && res.templates) {
      setTemplates(res.templates);
    } else {
      toast.error('Failed to load templates.');
    }
    setIsFetchingTemplates(false);
  };

  const insertTemplate = (template: any) => {
    if (template.type === 'SKILL') {
      setSkillGoals([...skillGoals, { domain: template.domain || '', description: template.description || '', mastery: template.mastery || '', baseline: '' }]);
    } else if (template.type === 'BRP') {
      setBrp([...brp, { behavior: template.behavior || '', baseline: '', topography: template.topography || '', function: template.function || '', antecedent: template.antecedent || '', consequence: template.consequence || '' }]);
    } else if (template.type === 'PARENT') {
      setParentGoals([...parentGoals, { description: template.description || '', mastery: template.mastery || '', baseline: '' }]);
    }
    setShowTemplateModal(false);
    toast.success('Template inserted!');
  };

  const handleSaveToLibrary = async (type: 'SKILL' | 'BRP' | 'PARENT', item: any) => {
    if ((type === 'SKILL' || type === 'PARENT') && !item.description) {
      toast.error('Cannot save empty goal to library.'); return;
    }
    if (type === 'BRP' && !item.behavior) {
      toast.error('Cannot save empty behavior to library.'); return;
    }

    const payload: any = { type, authorName: 'Current BCBA' }; // Hardcoded author for prototype
    if (type === 'SKILL') {
      payload.domain = item.domain; payload.description = item.description; payload.mastery = item.mastery;
    } else if (type === 'BRP') {
      payload.behavior = item.behavior; payload.topography = item.topography; payload.function = item.function;
      payload.antecedent = item.antecedent; payload.consequence = item.consequence;
    } else if (type === 'PARENT') {
      payload.description = item.description; payload.mastery = item.mastery;
    }

    const res = await saveGoalTemplate(payload);
    if (res.success) toast.success('Saved to Universal Library!');
    else toast.error('Failed to save to library.');
  };

  const isReadyToSubmit = 
    signature.trim() !== '' &&
    assessorName.trim() !== '' &&
    assessmentStartDate.trim() !== '' &&
    servicePeriodStart.trim() !== '' &&
    String(hours97151Eval).trim() !== '' &&
    brp.length > 0 &&
    skillGoals.length > 0 &&
    parentGoals.length > 0 &&
    medicalNecessity.trim() !== '' &&
    generalizationPlan.trim() !== '' &&
    dischargeCriteria.trim() !== '';

  if (isAssembled) {
    return (
      <div className="space-y-6">
        <Card className="bg-green-500/5 border border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center text-green-400 font-medium text-lg">
              <CheckCircle className="w-6 h-6 mr-3" />
              Treatment Plan Submitted & Signed Successfully
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl pb-12 relative">
      <div className="bg-brand-blue-500/10 border border-brand-blue-500/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white flex items-center mb-2">
          <ClipboardList className="w-6 h-6 text-brand-blue-500 mr-3" />
          Comprehensive Assessment & Treatment Plan Builder
        </h2>
        <p className="text-zinc-400 text-sm">
          Complete the clinical requirements below. <span className="text-yellow-500 font-medium">Fields highlighted in yellow</span> are required. This plan auto-saves as you type.
        </p>
      </div>

      {/* 1. Patient Info & Service Requests */}
      <Card className="bg-zinc-950 border border-white/5">
        <CardHeader className="border-b border-white/5 bg-zinc-900/50 pb-4">
          <CardTitle className="text-base text-white flex items-center"><FileText className="w-4 h-4 mr-2 text-zinc-400" /> 1. Patient Information & Service Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Patient Details */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">Provider & Assessment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Referring Provider</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(referringProvider)}`} value={referringProvider} onChange={(e) => setReferringProvider(e.target.value)} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Provider NPI</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(providerNpi)}`} value={providerNpi} onChange={(e) => setProviderNpi(e.target.value)} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Assessment Start Date</label><input type="date" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(assessmentStartDate)}`} value={assessmentStartDate} onChange={(e) => setAssessmentStartDate(e.target.value)} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Assessment End Date</label><input type="date" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(assessmentEndDate)}`} value={assessmentEndDate} onChange={(e) => setAssessmentEndDate(e.target.value)} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Reassessment Date</label><input type="date" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(reassessmentDate)}`} value={reassessmentDate} onChange={(e) => setReassessmentDate(e.target.value)} /></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Assessor Name</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(assessorName)}`} value={assessorName} onChange={(e) => setAssessorName(e.target.value)} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Credentials</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(assessorCredentials)}`} value={assessorCredentials} onChange={(e) => setAssessorCredentials(e.target.value)} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Email</label><input type="email" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(assessorEmail)}`} value={assessorEmail} onChange={(e) => setAssessorEmail(e.target.value)} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Phone</label><input type="tel" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(assessorPhone)}`} value={assessorPhone} onChange={(e) => setAssessorPhone(e.target.value)} /></div>
            </div>
          </div>

          {/* Treatment Intensity Request */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">Treatment Intensity Request (CPT Codes)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">97151 (Eval - Auth Period)</label><input type="number" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(hours97151Eval)}`} value={hours97151Eval} onChange={(e) => setHours97151Eval(e.target.value)} placeholder="Hours per auth period" /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">97151 (Plan - Wkly)</label><input type="number" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(hours97151Plan)}`} value={hours97151Plan} onChange={(e) => setHours97151Plan(e.target.value)} placeholder="Hours per week" /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">97153 (Direct 1:1 - Wkly)</label><input type="number" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(hours97153)}`} value={hours97153} onChange={(e) => setHours97153(e.target.value)} placeholder="Hours per week" /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">97155 (Protocol Mod - Wkly)</label><input type="number" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(hours97155)}`} value={hours97155} onChange={(e) => setHours97155(e.target.value)} placeholder="Hours per week" /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">97156 (Parent Train - Wkly)</label><input type="number" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(hours97156)}`} value={hours97156} onChange={(e) => setHours97156(e.target.value)} placeholder="Hours per week" /></div>
            </div>
          </div>

          {/* Location & Schedule */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">Service Period, Location & Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Service Period Start</label><input type="month" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(servicePeriodStart)}`} value={servicePeriodStart} onChange={(e) => setServicePeriodStart(e.target.value)} /></div>
               <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Service Period End</label><input type="month" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(servicePeriodEnd)}`} value={servicePeriodEnd} onChange={(e) => setServicePeriodEnd(e.target.value)} /></div>
            </div>
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Primary Locations (Check all that apply)</label>
              <div className="flex flex-wrap gap-4">
                {['Home', 'School', 'Clinic', 'Community', 'Telehealth'].map((loc) => (
                  <label key={loc} className="flex items-center space-x-2 text-sm text-white cursor-pointer">
                    <input type="checkbox" className="rounded border-zinc-700 bg-zinc-900 text-brand-blue-500" 
                      checked={primaryLocations.includes(loc)} 
                      onChange={(e) => {
                        if (e.target.checked) setPrimaryLocations([...primaryLocations, loc]);
                        else setPrimaryLocations(primaryLocations.filter(l => l !== loc));
                      }} 
                    />
                    <span>{loc}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Schedule of ABA Services</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                  <div key={day}>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{day}</label>
                    <input type="text" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(serviceSchedule?.[day] || '')}`} placeholder="3pm-8pm" value={serviceSchedule?.[day] || ''} onChange={(e) => setServiceSchedule({...serviceSchedule, [day]: e.target.value})} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Biopsychosocial Information */}
      <Card className="bg-zinc-950 border border-white/5">
        <CardHeader className="border-b border-white/5 bg-zinc-900/50 pb-4">
          <CardTitle className="text-base text-white flex items-center"><FileText className="w-4 h-4 mr-2 text-zinc-400" /> 2. Biopsychosocial Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Family Structure</label><textarea className={`w-full rounded-lg p-3 text-sm text-white h-24 outline-none border ${getHighlightClass(familyStructure)}`} value={familyStructure} onChange={(e) => setFamilyStructure(e.target.value)} /></div>
            <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Medical History</label><textarea className={`w-full rounded-lg p-3 text-sm text-white h-24 outline-none border ${getHighlightClass(medicalHistory)}`} value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} /></div>
            <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Developmental History</label><textarea className={`w-full rounded-lg p-3 text-sm text-white h-24 outline-none border ${getHighlightClass(developmentalHistory)}`} value={developmentalHistory} onChange={(e) => setDevelopmentalHistory(e.target.value)} /></div>
            <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">School</label><textarea className={`w-full rounded-lg p-3 text-sm text-white h-24 outline-none border ${getHighlightClass(school)}`} value={school} onChange={(e) => setSchool(e.target.value)} /></div>
            <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Related Services</label><textarea className={`w-full rounded-lg p-3 text-sm text-white h-24 outline-none border ${getHighlightClass(relatedServices)}`} value={relatedServices} onChange={(e) => setRelatedServices(e.target.value)} /></div>
            <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Client Strengths</label><textarea className={`w-full rounded-lg p-3 text-sm text-white h-24 outline-none border ${getHighlightClass(clientStrengths)}`} value={clientStrengths} onChange={(e) => setClientStrengths(e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Assessments & Observations */}
      <Card className="bg-zinc-950 border border-white/5">
        <CardHeader className="border-b border-white/5 bg-zinc-900/50 pb-4">
          <CardTitle className="text-base text-white">3. Assessments & Observations</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Indirect & Vineland */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">Formal Testing & Indirect Assessments</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Parent Interview Date</label><input type="date" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(parentInterviewDate)}`} value={parentInterviewDate} onChange={(e) => setParentInterviewDate(e.target.value)} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Record Review Date</label><input type="date" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(recordReviewDate)}`} value={recordReviewDate} onChange={(e) => setRecordReviewDate(e.target.value)} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">ATEC Total Score</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-900 border ${getHighlightClass(atecScore)}`} value={atecScore} onChange={(e) => setAtecScore(e.target.value)} /></div>
            </div>
            
            <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3">Vineland-3 Standard Scores</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-zinc-900/50 rounded-lg border border-white/5">
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Communication Score</label><input type="text" className={`w-full rounded-md p-3 text-sm text-white bg-zinc-950 border ${getHighlightClass(toolScores.communication || '')}`} value={toolScores.communication || ''} onChange={(e) => setToolScores({ ...toolScores, communication: e.target.value })} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Daily Living Score</label><input type="text" className={`w-full rounded-md p-3 text-sm text-white bg-zinc-950 border ${getHighlightClass(toolScores.dailyLiving || '')}`} value={toolScores.dailyLiving || ''} onChange={(e) => setToolScores({ ...toolScores, dailyLiving: e.target.value })} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Socialization Score</label><input type="text" className={`w-full rounded-md p-3 text-sm text-white bg-zinc-950 border ${getHighlightClass(toolScores.socialization || '')}`} value={toolScores.socialization || ''} onChange={(e) => setToolScores({ ...toolScores, socialization: e.target.value })} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Motor Skills Score</label><input type="text" className={`w-full rounded-md p-3 text-sm text-white bg-zinc-950 border ${getHighlightClass(toolScores.motor || '')}`} value={toolScores.motor || ''} onChange={(e) => setToolScores({ ...toolScores, motor: e.target.value })} /></div>
            </div>
          </div>

          {/* Observations */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">Direct Observations</h3>
            <div className="space-y-6">
              <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/5">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1"><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Observation 1 Date</label><input type="date" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-950 border ${getHighlightClass(observation1Date)}`} value={observation1Date} onChange={(e) => setObservation1Date(e.target.value)} /></div>
                  <div className="flex-1"><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Setting</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-950 border ${getHighlightClass(observation1Setting)}`} value={observation1Setting} onChange={(e) => setObservation1Setting(e.target.value)} /></div>
                </div>
                <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Narrative</label><textarea className={`w-full rounded-lg p-3 text-sm text-white h-24 outline-none border bg-zinc-950 ${getHighlightClass(observation1Narrative)}`} value={observation1Narrative} onChange={(e) => setObservation1Narrative(e.target.value)} /></div>
              </div>
              <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/5">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1"><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Observation 2 Date</label><input type="date" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-950 border ${getHighlightClass(observation2Date)}`} value={observation2Date} onChange={(e) => setObservation2Date(e.target.value)} /></div>
                  <div className="flex-1"><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Setting</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white bg-zinc-950 border ${getHighlightClass(observation2Setting)}`} value={observation2Setting} onChange={(e) => setObservation2Setting(e.target.value)} /></div>
                </div>
                <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Narrative</label><textarea className={`w-full rounded-lg p-3 text-sm text-white h-24 outline-none border bg-zinc-950 ${getHighlightClass(observation2Narrative)}`} value={observation2Narrative} onChange={(e) => setObservation2Narrative(e.target.value)} /></div>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Current Areas of Deficit (Summary)</label>
              <textarea className={`w-full rounded-lg p-3 text-sm text-white h-24 outline-none border ${getHighlightClass(currentDeficitsSummary)}`} value={currentDeficitsSummary} onChange={(e) => setCurrentDeficitsSummary(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. BRP */}
      <Card className="bg-zinc-950 border border-white/5">
        <CardHeader className="border-b border-white/5 bg-zinc-900/50 pb-4 flex flex-row justify-between items-center">
          <CardTitle className="text-base text-white flex items-center"><Activity className="w-4 h-4 mr-2 text-red-500" /> 3. Behavior Reduction Plan (BIP)</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openTemplateLibrary('BRP')} className="border-brand-purple-500/50 text-brand-purple-400 bg-brand-purple-500/10 hover:bg-brand-purple-500/20 text-xs py-1 h-8">
              <Library className="w-3 h-3 mr-1" /> Browse Library
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddBrp} className="border-white/10 text-xs py-1 h-8">
              <Plus className="w-3 h-3 mr-1" /> Add Behavior
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5 mb-8">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase">Maladaptive Behavior Summary</label>
              <select className={`rounded p-1 text-xs text-white border ${getHighlightClass(maladaptiveSeverity)}`} value={maladaptiveSeverity} onChange={(e) => setMaladaptiveSeverity(e.target.value)}><option className="bg-zinc-950" value="">Severity</option><option className="bg-zinc-950" value="Mild">Mild</option><option className="bg-zinc-950" value="Moderate">Moderate</option><option className="bg-zinc-950" value="Severe">Severe</option></select>
            </div>
            <textarea className={`w-full rounded-md p-2 text-sm text-white h-24 outline-none border ${getHighlightClass(maladaptiveNarrative)}`} placeholder="Overall description of behaviors and impact on daily functioning..." value={maladaptiveNarrative} onChange={(e) => setMaladaptiveNarrative(e.target.value)} />
          </div>

          {brp.length === 0 ? (
             <div className="text-center text-yellow-500/70 py-6 border border-dashed border-yellow-500/30 bg-yellow-500/5 rounded-lg">Missing Maladaptive Behaviors. Click "Add Behavior" or "Browse Library".</div>
          ) : (
            <div className="space-y-6">
              {brp.map((b, index) => (
                <div key={index} className="bg-zinc-900/50 border border-white/5 rounded-lg p-5 relative group">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => handleSaveToLibrary('BRP', b)} className="text-zinc-500 hover:text-brand-purple-400 transition-colors tooltip-trigger" title="Save to Universal Library">
                      <BookmarkPlus className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRemoveBrp(index)} className="text-zinc-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mr-16">
                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-2">
                      <div className="col-span-2"><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Target Behavior</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(b.behavior)}`} value={b.behavior} onChange={(e) => handleUpdateBrp(index, 'behavior', e.target.value)} /></div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Status</label>
                        <select className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(b.status || 'New')}`} value={b.status || 'New'} onChange={(e) => handleUpdateBrp(index, 'status', e.target.value)}>
                          <option className="bg-zinc-950 text-white" value="New">New</option><option className="bg-zinc-950 text-white" value="Continuing">Continuing</option><option className="bg-zinc-950 text-white" value="On Hold">On Hold</option><option className="bg-zinc-950 text-white" value="Mastered">Mastered</option>
                        </select>
                      </div>
                      <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Current Level</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(b.currentLevel || '')}`} value={b.currentLevel || ''} onChange={(e) => handleUpdateBrp(index, 'currentLevel', e.target.value)} /></div>
                      <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Target Date</label><input type="month" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(b.targetDate || '')}`} value={b.targetDate || ''} onChange={(e) => handleUpdateBrp(index, 'targetDate', e.target.value)} /></div>
                    </div>
                    <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Baseline Rate</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(b.baseline)}`} value={b.baseline} onChange={(e) => handleUpdateBrp(index, 'baseline', e.target.value)} /></div>
                    <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Mastery Criteria</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(b.mastery || '')}`} value={b.mastery || ''} onChange={(e) => handleUpdateBrp(index, 'mastery', e.target.value)} /></div>
                    <div className="md:col-span-2"><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Topography</label><textarea className={`w-full rounded-md p-2 text-sm text-white h-16 border ${getHighlightClass(b.topography)}`} value={b.topography} onChange={(e) => handleUpdateBrp(index, 'topography', e.target.value)} /></div>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Hypothesized Function</label>
                      <select className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(b.function)}`} value={b.function} onChange={(e) => handleUpdateBrp(index, 'function', e.target.value)}>
                        <option className="bg-zinc-950 text-white" value="">-- Select --</option><option className="bg-zinc-950 text-white" value="Escape">Escape</option><option className="bg-zinc-950 text-white" value="Access">Access</option><option className="bg-zinc-950 text-white" value="Attention">Attention</option><option className="bg-zinc-950 text-white" value="Sensory">Sensory</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Risk Level</label>
                      <select className={`w-full rounded-md p-2 text-sm text-white border bg-zinc-900`} value={b.risk || 'Low'} onChange={(e) => handleUpdateBrp(index, 'risk', e.target.value)}>
                        <option className="bg-zinc-950 text-white" value="Low">Low</option><option className="bg-zinc-950 text-white" value="Medium">Medium</option><option className="bg-zinc-950 text-white" value="High">High</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 border-t border-white/5 pt-4 mt-2">
                      <h4 className="text-xs font-bold text-white mb-3">Intervention Strategies</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Proactive/Antecedent Strategies</label><textarea className={`w-full rounded-md p-2 text-sm text-white h-16 border bg-zinc-950`} value={b.proactive || ''} onChange={(e) => handleUpdateBrp(index, 'proactive', e.target.value)} /></div>
                        <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">FERB (Replacement Behavior)</label><textarea className={`w-full rounded-md p-2 text-sm text-white h-16 border bg-zinc-950`} value={b.ferb || ''} onChange={(e) => handleUpdateBrp(index, 'ferb', e.target.value)} /></div>
                        <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Reactive/Consequence (De-escalation)</label><textarea className={`w-full rounded-md p-2 text-sm text-white h-16 border bg-zinc-950`} value={b.reactive || ''} onChange={(e) => handleUpdateBrp(index, 'reactive', e.target.value)} /></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Skill Goals */}
      <Card className="bg-zinc-950 border border-white/5">
        <CardHeader className="border-b border-white/5 bg-zinc-900/50 pb-4 flex flex-row justify-between items-center">
          <CardTitle className="text-base text-white flex items-center"><Target className="w-4 h-4 mr-2 text-green-500" /> 4. Skill Acquisition Goals</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openTemplateLibrary('SKILL')} className="border-brand-purple-500/50 text-brand-purple-400 bg-brand-purple-500/10 hover:bg-brand-purple-500/20 text-xs py-1 h-8">
              <Library className="w-3 h-3 mr-1" /> Browse Library
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddSkill} className="border-white/10 text-xs py-1 h-8">
              <Plus className="w-3 h-3 mr-1" /> Add Skill Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6 mb-8 border-b border-white/10 pb-8">
            <h3 className="text-sm font-bold text-white mb-2">Domain-Specific Functioning</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase">Language/Communication</label>
                  <select className={`rounded p-1 text-xs text-white border ${getHighlightClass(langCommSeverity)}`} value={langCommSeverity} onChange={(e) => setLangCommSeverity(e.target.value)}><option className="bg-zinc-950" value="">Severity</option><option className="bg-zinc-950" value="Mild">Mild</option><option className="bg-zinc-950" value="Moderate">Moderate</option><option className="bg-zinc-950" value="Severe">Severe</option></select>
                </div>
                <textarea className={`w-full rounded-md p-2 text-sm text-white h-24 outline-none border ${getHighlightClass(langCommDescription)}`} placeholder="Description..." value={langCommDescription} onChange={(e) => setLangCommDescription(e.target.value)} />
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase">Social/Emotional</label>
                  <select className={`rounded p-1 text-xs text-white border ${getHighlightClass(socialEmotionalSeverity)}`} value={socialEmotionalSeverity} onChange={(e) => setSocialEmotionalSeverity(e.target.value)}><option className="bg-zinc-950" value="">Severity</option><option className="bg-zinc-950" value="Mild">Mild</option><option className="bg-zinc-950" value="Moderate">Moderate</option><option className="bg-zinc-950" value="Severe">Severe</option></select>
                </div>
                <textarea className={`w-full rounded-md p-2 text-sm text-white h-24 outline-none border ${getHighlightClass(socialEmotionalDescription)}`} placeholder="Description..." value={socialEmotionalDescription} onChange={(e) => setSocialEmotionalDescription(e.target.value)} />
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase">Adaptive Functioning</label>
                  <select className={`rounded p-1 text-xs text-white border ${getHighlightClass(adaptiveSeverity)}`} value={adaptiveSeverity} onChange={(e) => setAdaptiveSeverity(e.target.value)}><option className="bg-zinc-950" value="">Severity</option><option className="bg-zinc-950" value="Mild">Mild</option><option className="bg-zinc-950" value="Moderate">Moderate</option><option className="bg-zinc-950" value="Severe">Severe</option></select>
                </div>
                <textarea className={`w-full rounded-md p-2 text-sm text-white h-24 outline-none border ${getHighlightClass(adaptiveDescription)}`} placeholder="Description..." value={adaptiveDescription} onChange={(e) => setAdaptiveDescription(e.target.value)} />
              </div>
            </div>
          </div>

          {skillGoals.length === 0 ? (
            <div className="text-center text-yellow-500/70 py-6 border border-dashed border-yellow-500/30 bg-yellow-500/5 rounded-lg">Missing Skill Acquisition Goals.</div>
          ) : (
            <div className="space-y-4">
              {skillGoals.map((s, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 items-start bg-zinc-900/30 p-4 rounded-lg border border-white/5 relative pr-12">
                  <div className="w-full md:w-1/4 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Domain</label>
                      <select className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(s.domain)}`} value={s.domain} onChange={(e) => handleUpdateSkill(index, 'domain', e.target.value)}>
                        <option className="bg-zinc-950 text-white" value="">-- Domain --</option><option className="bg-zinc-950 text-white" value="Communication">Communication</option><option className="bg-zinc-950 text-white" value="Play/Leisure">Play & Leisure</option><option className="bg-zinc-950 text-white" value="Social">Social</option><option className="bg-zinc-950 text-white" value="Adaptive">Adaptive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Status</label>
                      <select className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(s.status || 'New')}`} value={s.status || 'New'} onChange={(e) => handleUpdateSkill(index, 'status', e.target.value)}>
                        <option className="bg-zinc-950 text-white" value="New">New Goal</option><option className="bg-zinc-950 text-white" value="Continuing">Continuing</option><option className="bg-zinc-950 text-white" value="On Hold">On Hold</option><option className="bg-zinc-950 text-white" value="Mastered">Mastered</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Objective</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(s.description)}`} value={s.description} onChange={(e) => handleUpdateSkill(index, 'description', e.target.value)} /></div>
                    <div className="grid grid-cols-4 gap-2">
                      <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Baseline</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(s.baseline)}`} value={s.baseline} onChange={(e) => handleUpdateSkill(index, 'baseline', e.target.value)} /></div>
                      <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Current Level</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white border bg-zinc-900 focus:border-brand-blue-500`} value={s.currentLevel || ''} onChange={(e) => handleUpdateSkill(index, 'currentLevel', e.target.value)} /></div>
                      <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Mastery Criteria</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(s.mastery)}`} value={s.mastery} onChange={(e) => handleUpdateSkill(index, 'mastery', e.target.value)} /></div>
                      <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Target Date</label><input type="month" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(s.targetDate || '')}`} value={s.targetDate || ''} onChange={(e) => handleUpdateSkill(index, 'targetDate', e.target.value)} /></div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col gap-3">
                    <button onClick={() => handleSaveToLibrary('SKILL', s)} className="text-zinc-500 hover:text-brand-purple-400 transition-colors" title="Save to Universal Library"><BookmarkPlus className="w-4 h-4" /></button>
                    <button onClick={() => handleRemoveSkill(index)} className="text-zinc-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Parent Goals */}
      <Card className="bg-zinc-950 border border-white/5">
        <CardHeader className="border-b border-white/5 bg-zinc-900/50 pb-4 flex flex-row justify-between items-center">
          <CardTitle className="text-base text-white flex items-center"><Users className="w-4 h-4 mr-2 text-purple-500" /> 5. Caregiver Goals</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openTemplateLibrary('PARENT')} className="border-brand-purple-500/50 text-brand-purple-400 bg-brand-purple-500/10 hover:bg-brand-purple-500/20 text-xs py-1 h-8">
              <Library className="w-3 h-3 mr-1" /> Browse Library
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddParentGoal} className="border-white/10 text-xs py-1 h-8"><Plus className="w-3 h-3 mr-1" /> Add Parent Goal</Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {parentGoals.length === 0 ? (
            <div className="text-center text-yellow-500/70 py-6 border border-dashed border-yellow-500/30 bg-yellow-500/5 rounded-lg">Missing Caregiver Goals.</div>
          ) : (
            <div className="space-y-4">
              {parentGoals.map((p, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 items-start bg-zinc-900/30 p-4 rounded-lg border border-white/5 relative pr-12">
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1"><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Objective</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(p.description)}`} value={p.description} onChange={(e) => handleUpdateParentGoal(index, 'description', e.target.value)} /></div>
                      <div className="w-32">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Status</label>
                        <select className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(p.status || 'New')}`} value={p.status || 'New'} onChange={(e) => handleUpdateParentGoal(index, 'status', e.target.value)}>
                          <option className="bg-zinc-950 text-white" value="New">New</option><option className="bg-zinc-950 text-white" value="Continuing">Continuing</option><option className="bg-zinc-950 text-white" value="On Hold">On Hold</option><option className="bg-zinc-950 text-white" value="Mastered">Mastered</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Baseline</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(p.baseline)}`} value={p.baseline} onChange={(e) => handleUpdateParentGoal(index, 'baseline', e.target.value)} /></div>
                      <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Current Level</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(p.currentLevel || '')}`} value={p.currentLevel || ''} onChange={(e) => handleUpdateParentGoal(index, 'currentLevel', e.target.value)} /></div>
                      <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Mastery Criteria</label><input type="text" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(p.mastery)}`} value={p.mastery} onChange={(e) => handleUpdateParentGoal(index, 'mastery', e.target.value)} /></div>
                      <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Target Date</label><input type="month" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(p.targetDate || '')}`} value={p.targetDate || ''} onChange={(e) => handleUpdateParentGoal(index, 'targetDate', e.target.value)} /></div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col gap-3">
                    <button onClick={() => handleSaveToLibrary('PARENT', p)} className="text-zinc-500 hover:text-brand-purple-400 transition-colors" title="Save to Universal Library"><BookmarkPlus className="w-4 h-4" /></button>
                    <button onClick={() => handleRemoveParentGoal(index)} className="text-zinc-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6. Care Coordination & Preferences */}
      <Card className="bg-zinc-950 border border-white/5">
        <CardHeader className="border-b border-white/5 bg-zinc-900/50 pb-4 flex flex-row justify-between items-center">
          <CardTitle className="text-base text-white">6. Care Coordination & Preferences</CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddCareMeeting} className="border-white/10 text-xs py-1 h-8"><Plus className="w-3 h-3 mr-1" /> Add Meeting</Button>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">Medical Necessity, Barriers & Generalization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Statement of Medical Necessity</label><textarea className={`w-full rounded-lg p-3 text-sm text-white h-24 outline-none border ${getHighlightClass(medicalNecessity)}`} value={medicalNecessity} onChange={(e) => setMedicalNecessity(e.target.value)} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Barriers to Treatment</label><textarea className={`w-full rounded-lg p-3 text-sm text-white h-24 outline-none border ${getHighlightClass(barriersToTreatment)}`} value={barriersToTreatment} onChange={(e) => setBarriersToTreatment(e.target.value)} /></div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Generalization Plan</label>
              <textarea className={`w-full rounded-lg p-3 text-sm text-white h-20 outline-none border ${getHighlightClass(generalizationPlan)}`} value={generalizationPlan} onChange={(e) => setGeneralizationPlan(e.target.value)} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">Preference Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Assessment Date</label><input type="date" className={`w-full rounded-md p-2 text-sm text-white border ${getHighlightClass(preferenceAssessmentDate)}`} value={preferenceAssessmentDate} onChange={(e) => setPreferenceAssessmentDate(e.target.value)} /></div>
              <div><label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Highly Preferred Items</label><textarea className={`w-full rounded-md p-2 text-sm text-white h-16 border ${getHighlightClass(highlyPreferredItems)}`} value={highlyPreferredItems} onChange={(e) => setHighlyPreferredItems(e.target.value)} /></div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">Care Coordination Meetings</h3>
            {careCoordinationMeetings.length === 0 ? (
               <div className="text-center text-zinc-500 py-4 border border-dashed border-zinc-700 bg-zinc-900/30 rounded-lg">No care meetings logged.</div>
            ) : (
              <div className="space-y-4">
                {careCoordinationMeetings.map((c, index) => (
                  <div key={index} className="flex gap-4 items-start bg-zinc-900/50 p-4 rounded-lg border border-white/5 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                      <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Provider (e.g. SLP, Teacher)</label><input type="text" className="w-full rounded-md p-2 text-sm text-white bg-zinc-950 border border-zinc-800" value={c.provider} onChange={(e) => handleUpdateCareMeeting(index, 'provider', e.target.value)} /></div>
                      <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Contact Info</label><input type="text" className="w-full rounded-md p-2 text-sm text-white bg-zinc-950 border border-zinc-800" value={c.contactInfo} onChange={(e) => handleUpdateCareMeeting(index, 'contactInfo', e.target.value)} /></div>
                      <div><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Notes / Goals Addressed</label><input type="text" className="w-full rounded-md p-2 text-sm text-white bg-zinc-950 border border-zinc-800" value={c.notes} onChange={(e) => handleUpdateCareMeeting(index, 'notes', e.target.value)} /></div>
                    </div>
                    <button onClick={() => handleRemoveCareMeeting(index)} className="text-zinc-500 hover:text-red-400 mt-6"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 7. Crisis & Discharge Plan */}
      <Card className="bg-zinc-950 border border-white/5">
        <CardHeader className="border-b border-white/5 bg-zinc-900/50 pb-4"><CardTitle className="text-base text-white">7. Crisis & Discharge Planning</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-6">
          <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Crisis/Safety Plan</label><textarea className={`w-full rounded-lg p-3 text-sm text-white h-20 outline-none border ${getHighlightClass(crisisPlan)}`} value={crisisPlan} onChange={(e) => setCrisisPlan(e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Discharge Fading Plan</label><textarea className={`w-full rounded-lg p-3 text-sm text-white h-20 outline-none border ${getHighlightClass(dischargeFadingPlan)}`} value={dischargeFadingPlan} onChange={(e) => setDischargeFadingPlan(e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Discharge Criteria</label><textarea className={`w-full rounded-lg p-3 text-sm text-white h-20 outline-none border ${getHighlightClass(dischargeCriteria)}`} value={dischargeCriteria} onChange={(e) => setDischargeCriteria(e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* Signature */}
      <div className={`bg-zinc-900 border rounded-xl p-6 mb-8 ${getHighlightClass(signature)}`}>
        <label className="block text-sm font-bold text-white mb-2">BCBA Electronic Signature</label>
        <input type="text" value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Type your full legal name..." className="w-full md:w-1/2 bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-brand-blue-500 font-signature text-lg italic outline-none" />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button 
          variant="primary" 
          disabled={isPending} 
          onClick={() => handleSave(true)} 
          className={`font-bold tracking-wide px-8 transition-all duration-500 ${
            isReadyToSubmit 
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)] border border-green-400 scale-105' 
              : 'bg-brand-blue-600 hover:bg-brand-blue-700 text-white border border-transparent'
          }`}
        >
          <Send className="w-4 h-4 mr-2" /> E-Sign & Send
        </Button>
      </div>

      {/* Template Modal */}
      {showTemplateModal && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-brand-purple-500/20 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 rounded-t-xl">
              <h2 className="text-lg font-bold text-white flex items-center">
                <Library className="w-5 h-5 text-brand-purple-500 mr-2" />
                Universal Goal Library ({templateType})
              </h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 border-b border-white/10 bg-zinc-900 flex gap-4">
              <input 
                type="text" 
                placeholder="Search templates by keyword..." 
                className="flex-1 bg-zinc-950 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-brand-purple-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {templateType === 'SKILL' && (
                <select 
                  className="w-48 bg-zinc-950 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-brand-purple-500 outline-none"
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                >
                  <option className="bg-zinc-950 text-white" value="">All Domains</option>
                  <option className="bg-zinc-950 text-white" value="Communication">Communication</option>
                  <option className="bg-zinc-950 text-white" value="Play/Leisure">Play & Leisure</option>
                  <option className="bg-zinc-950 text-white" value="Social">Social</option>
                  <option className="bg-zinc-950 text-white" value="Adaptive">Adaptive</option>
                </select>
              )}
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {isFetchingTemplates ? (
                <div className="text-zinc-500 text-center py-8">Loading templates...</div>
              ) : templates.filter(t => 
                  ((t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                  (t.behavior || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
                  (domainFilter ? t.domain === domainFilter : true)
                ).length === 0 ? (
                <div className="text-zinc-500 text-center py-8">No templates found.</div>
              ) : (
                templates.filter(t => 
                  ((t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                  (t.behavior || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
                  (domainFilter ? t.domain === domainFilter : true)
                ).map((t, idx) => (
                  <div key={idx} className="bg-zinc-900 border border-white/5 rounded-lg p-4 hover:border-brand-purple-500/50 transition-colors flex justify-between items-center gap-4">
                    <div className="flex-1">
                      {t.type === 'SKILL' && (
                        <>
                          <div className="text-xs text-brand-purple-400 font-bold mb-1">{t.domain}</div>
                          <div className="text-sm text-white mb-2">{t.description}</div>
                          <div className="text-xs text-zinc-500">Mastery: {t.mastery}</div>
                        </>
                      )}
                      {t.type === 'BRP' && (
                        <>
                          <div className="text-xs text-red-400 font-bold mb-1">Target: {t.behavior} (Function: {t.function})</div>
                          <div className="text-sm text-zinc-300 mb-1"><span className="text-zinc-500">Topography:</span> {t.topography}</div>
                          <div className="text-xs text-zinc-400 line-clamp-1"><span className="text-zinc-500">Ant:</span> {t.antecedent}</div>
                        </>
                      )}
                      {t.type === 'PARENT' && (
                        <>
                          <div className="text-sm text-white mb-2">{t.description}</div>
                          <div className="text-xs text-zinc-500">Mastery: {t.mastery}</div>
                        </>
                      )}
                      {t.authorName && <div className="text-[10px] text-zinc-600 mt-2">Added by {t.authorName}</div>}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => insertTemplate(t)} className="shrink-0 border-brand-purple-500/30 text-brand-purple-400 hover:bg-brand-purple-500/10">
                      <Plus className="w-4 h-4 mr-1" /> Use Template
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
