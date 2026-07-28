'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import IntakeDocumentsTab from '@/components/client-profile/tabs/IntakeDocumentsTab';
import ClinicalReviewTab from '@/components/client-profile/tabs/ClinicalReviewTab';
import BillingAuthTab from '@/components/client-profile/tabs/BillingAuthTab';
import AssessmentPrepTab from '@/components/client-profile/tabs/AssessmentPrepTab';
import ReportAssemblyTab from '@/components/client-profile/tabs/ReportAssemblyTab';
import ClientAssignmentsTab from '@/components/client-profile/tabs/ClientAssignmentsTab';
import ClientMessagesTab from '@/components/client-profile/tabs/ClientMessagesTab';
import PeerToPeerTab from '@/components/client-profile/tabs/PeerToPeerTab';
import ClientDocumentsTab from '@/components/client-profile/tabs/ClientDocumentsTab';
import BcbaAssessmentTab from '@/components/client-profile/tabs/BcbaAssessmentTab';
import BcbaTreatmentPlanTab from '@/components/client-profile/tabs/BcbaTreatmentPlanTab';
import HrStaffingTab from '@/components/client-profile/tabs/HrStaffingTab';
import CaseCoordSchedulingTab from '@/components/client-profile/tabs/CaseCoordSchedulingTab';
import { markClientMessagesAsRead } from '@/app/(dashboard)/portal-case/actions';

export default function ClientProfileTabs({ client, mode }: { client: any, mode?: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [unreadCount, setUnreadCount] = useState(
    client.messages?.filter((m: any) => m.isFromClient && !m.readAt).length || 0
  );

  // Logic to determine which tabs are available
  const hasIntakeDocs = !!client.intakePacket;
  const isPastIntake = ['DOCS_APPROVED_INTAKE', 'CLINICAL_REVIEW_APPROVED', 'VOB_COMPLETED', 'PA_SUBMITTED', 'PA_APPROVED', 'ASSESSMENT_SCHEDULED', 'REPORT_ASSEMBLED', 'TX_PA_SUBMITTED', 'TX_PA_APPROVED', 'STAFFING_PENDING', 'ACTIVE'].includes(client.status);
  const isPastClinical = ['CLINICAL_REVIEW_APPROVED', 'VOB_COMPLETED', 'PA_SUBMITTED', 'PA_APPROVED', 'ASSESSMENT_SCHEDULED', 'REPORT_ASSEMBLED', 'TX_PA_SUBMITTED', 'TX_PA_APPROVED', 'STAFFING_PENDING', 'ACTIVE'].includes(client.status);
  const isPastBilling = ['PA_APPROVED', 'ASSESSMENT_SCHEDULED', 'REPORT_ASSEMBLED', 'TX_PA_SUBMITTED', 'TX_PA_APPROVED', 'STAFFING_PENDING', 'ACTIVE'].includes(client.status);
  const isPastAssessment = ['ASSESSMENT_SCHEDULED', 'REPORT_ASSEMBLED', 'TX_PA_SUBMITTED', 'TX_PA_APPROVED', 'STAFFING_PENDING', 'ACTIVE'].includes(client.status);
  
  const isClinicalReviewMode = mode === 'clinical';
  const isBcbaMode = mode === 'bcba';
  const isBillingMode = mode === 'billing';
  const isHrMode = mode === 'hr';
  const isCaseCoordMode = mode === 'case-coord';

  const hasP2PAlert = client.paRequests?.some((pa: any) => pa.status === 'DENIED_CLINICAL' && !pa.p2pResolved);

  // If there's a P2P alert and we are in bcba mode, we should default to P2P tab or overview
  React.useEffect(() => {
    if (isBcbaMode && hasP2PAlert) {
      setActiveTab('p2p');
    }
  }, [isBcbaMode, hasP2PAlert]);

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-[26px] border-b border-[var(--line)] mb-[22px]">
        <button 
          suppressHydrationWarning
          className={`pb-[12px] text-[13.5px] font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'overview' ? 'text-[var(--dawn-hot)] border-[var(--dawn)]' : 'text-[var(--ink-500)] border-transparent hover:text-[var(--ink-300)]'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        {!isClinicalReviewMode && !isBillingMode && !isBcbaMode && (
          <button 
            suppressHydrationWarning
            className={`pb-[12px] text-[13.5px] font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'documents' ? 'text-[var(--dawn-hot)] border-[var(--dawn)]' : 'text-[var(--ink-500)] border-transparent hover:text-[var(--ink-300)]'}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents (Magic Link)
          </button>
        )}
        {isBcbaMode && (
          <button 
            suppressHydrationWarning
            className={`pb-[12px] text-[13.5px] font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'bcba_documents' ? 'text-[var(--dawn-hot)] border-[var(--dawn)]' : 'text-[var(--ink-500)] border-transparent hover:text-[var(--ink-300)]'}`}
            onClick={() => setActiveTab('bcba_documents')}
          >
            Clinical Documents
          </button>
        )}
        {!isClinicalReviewMode && !isBillingMode && !isBcbaMode && (
          <button 
            suppressHydrationWarning
            className={`pb-[12px] text-[13.5px] font-semibold cursor-pointer border-b-2 transition-colors flex items-center ${activeTab === 'messages' ? 'text-[var(--dawn-hot)] border-[var(--dawn)]' : 'text-[var(--ink-500)] border-transparent hover:text-[var(--ink-300)]'}`}
            onClick={() => {
              setActiveTab('messages');
              if (unreadCount > 0) {
                setUnreadCount(0);
                markClientMessagesAsRead(client.id, true);
              }
            }}
          >
            Messages
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1.5 leading-none shadow-sm">{unreadCount}</span>
            )}
          </button>
        )}
        {isClinicalReviewMode && isPastIntake && (
          <button 
            suppressHydrationWarning
            className={`pb-[12px] text-[13.5px] font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'clinical' ? 'text-[var(--dawn-hot)] border-[var(--dawn)]' : 'text-[var(--ink-500)] border-transparent hover:text-[var(--ink-300)]'}`}
            onClick={() => setActiveTab('clinical')}
          >
            Clinical Review
          </button>
        )}
        {isBcbaMode && hasP2PAlert && (
          <button 
            suppressHydrationWarning
            className={`pb-[12px] text-[13.5px] font-semibold cursor-pointer border-b-2 transition-colors flex items-center ${activeTab === 'p2p' ? 'text-red-500 border-red-500' : 'text-red-400/70 border-transparent hover:text-red-400'}`}
            onClick={() => setActiveTab('p2p')}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            Peer-to-Peer Action
          </button>
        )}
        {!isClinicalReviewMode && !isBcbaMode && mode !== undefined && isPastClinical && (
          <button 
            suppressHydrationWarning
            className={`pb-[12px] text-[13.5px] font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'billing' ? 'text-[var(--dawn-hot)] border-[var(--dawn)]' : 'text-[var(--ink-500)] border-transparent hover:text-[var(--ink-300)]'}`}
            onClick={() => setActiveTab('billing')}
          >
            Billing & Auth
          </button>
        )}
        {!isClinicalReviewMode && !isBillingMode && !isBcbaMode && isPastBilling && (
          <button 
            suppressHydrationWarning
            className={`pb-[12px] text-[13.5px] font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'assignments' ? 'text-[var(--dawn-hot)] border-[var(--dawn)]' : 'text-[var(--ink-500)] border-transparent hover:text-[var(--ink-300)]'}`}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments
          </button>
        )}
        {!isClinicalReviewMode && !isBillingMode && mode !== undefined && isPastBilling && (
          <button 
            suppressHydrationWarning
            className={`pb-[12px] text-[13.5px] font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'assessment' ? 'text-[var(--dawn-hot)] border-[var(--dawn)]' : 'text-[var(--ink-500)] border-transparent hover:text-[var(--ink-300)]'}`}
            onClick={() => setActiveTab('assessment')}
          >
            Clinical Assessment
          </button>
        )}
        {isBcbaMode && isPastAssessment && (
          <button 
            suppressHydrationWarning
            className={`pb-[12px] text-[13.5px] font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'treatment_plan' ? 'text-[var(--dawn-hot)] border-[var(--dawn)]' : 'text-[var(--ink-500)] border-transparent hover:text-[var(--ink-300)]'}`}
            onClick={() => setActiveTab('treatment_plan')}
          >
            Treatment Plan Builder
          </button>
        )}
        {!isClinicalReviewMode && !isBillingMode && !isBcbaMode && mode !== undefined && isPastAssessment && (
          <button 
            suppressHydrationWarning
            className={`pb-[12px] text-[13.5px] font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'report' ? 'text-[var(--dawn-hot)] border-[var(--dawn)]' : 'text-[var(--ink-500)] border-transparent hover:text-[var(--ink-300)]'}`}
            onClick={() => setActiveTab('report')}
          >
            Report Assembly
          </button>
        )}
        {isCaseCoordMode && (
          <button 
            suppressHydrationWarning
            className={`pb-[12px] text-[13.5px] font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'case_coord_scheduling' ? 'text-[var(--dawn-hot)] border-[var(--dawn)]' : 'text-[var(--ink-500)] border-transparent hover:text-[var(--ink-300)]'}`}
            onClick={() => setActiveTab('case_coord_scheduling')}
          >
            Scheduling & Activation
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="animate-slide-up">
        {activeTab === 'overview' && (
          <div className="glass-panel px-[28px] py-[26px]">
            <div className="flex items-center gap-[10px] mb-[22px]">
              <div className="w-[26px] h-[26px] rounded-[7px] bg-[rgba(79,232,206,0.1)] border border-[rgba(79,232,206,0.25)] flex items-center justify-center text-[12px] text-[var(--teal)]">
                ◍
              </div>
              <div className="font-heading text-[18px] font-semibold">Client Demographics</div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-[40px] gap-y-[22px]">
              <div className="pb-[14px] border-b border-[var(--line)]">
                <div className="font-mono text-[10px] text-[var(--dawn)] tracking-[.6px] uppercase mb-[6px]">Child Name</div>
                <div className="text-[14.5px] text-[var(--ink-100)] font-medium">{client.firstName} {client.lastName}</div>
              </div>
              <div className="pb-[14px] border-b border-[var(--line)]">
                <div className="font-mono text-[10px] text-[var(--dawn)] tracking-[.6px] uppercase mb-[6px]">Child Age</div>
                <div className="text-[14.5px] text-[var(--ink-500)] italic">{client.childAge || 'Not provided'}</div>
              </div>
              <div className="pb-[14px] border-b border-[var(--line)]">
                <div className="font-mono text-[10px] text-[var(--dawn)] tracking-[.6px] uppercase mb-[6px]">Parent Name</div>
                <div className="text-[14.5px] text-[var(--ink-100)] font-medium">{client.guardianName}</div>
              </div>
              <div className="pb-[14px] border-b border-[var(--line)]">
                <div className="font-mono text-[10px] text-[var(--dawn)] tracking-[.6px] uppercase mb-[6px]">Parent Phone</div>
                <div className="font-mono text-[13.5px] text-[var(--teal)]">{client.guardianPhone}</div>
              </div>
              <div className="pb-[14px] border-b border-[var(--line)]">
                <div className="font-mono text-[10px] text-[var(--dawn)] tracking-[.6px] uppercase mb-[6px]">Parent Address</div>
                <div className="font-mono text-[13.5px] text-[var(--teal)]">{client.parentAddress}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          hasIntakeDocs ? <IntakeDocumentsTab client={client} /> : <div className="text-[var(--ink-500)] text-[14px]">No intake packet generated yet.</div>
        )}
        
        {activeTab === 'messages' && (
          <ClientMessagesTab clientId={client.id} initialMessages={client.messages || []} />
        )}

        {activeTab === 'p2p' && isBcbaMode && (
          <PeerToPeerTab client={client} />
        )}

        {activeTab === 'bcba_documents' && isBcbaMode && (
          <ClientDocumentsTab client={client} />
        )}

        {activeTab === 'clinical' && isClinicalReviewMode && isPastIntake && (
          <ClinicalReviewTab client={client} />
        )}

        {activeTab === 'billing' && isPastClinical && (
          <BillingAuthTab client={client} />
        )}

        {activeTab === 'assignments' && isPastBilling && (
          <ClientAssignmentsTab client={client} />
        )}

        {activeTab === 'assessment' && isPastBilling && (
          <BcbaAssessmentTab client={client} />
        )}

        {activeTab === 'treatment_plan' && isPastAssessment && isBcbaMode && (
          <BcbaTreatmentPlanTab client={client} />
        )}

        {activeTab === 'report' && isPastAssessment && (
          <ReportAssemblyTab client={client} />
        )}

        {activeTab === 'hr_staffing' && isHrMode && (
          <HrStaffingTab client={client} />
        )}

        {activeTab === 'case_coord_scheduling' && isCaseCoordMode && (
          <CaseCoordSchedulingTab client={client} />
        )}

      </div>
    </div>
  );
}
