'use client';

import React, { useState, useTransition } from 'react';
import { ShieldCheck, MessageSquare, ListTodo, MapPin, CheckCircle2, Lock } from 'lucide-react';
import { ContinuousIntakeForm } from '@/components/magic-link/ContinuousIntakeForm';
import { ClientScheduleBuilder } from '@/components/magic-link/ClientScheduleBuilder';
import { sendClientMessage, markClientMessagesAsRead } from '@/app/(dashboard)/portal-case/actions';
import { signTreatmentPlan } from '@/app/actions/intake';

export default function ClientPortalView({ packet, client, messages }: { packet: any, client: any, messages: any[] }) {
  const treatmentPlan = client.treatmentPlan && typeof client.treatmentPlan === 'object' ? client.treatmentPlan : {};
  const needsTreatmentPlanSig = treatmentPlan.status === 'COMPLETED' && !treatmentPlan.parentSignature;
  const needsScheduleBuilder = client.status === 'TX_PA_APPROVED' && !treatmentPlan.preferredSchedule;
  const hasSchedule = !!treatmentPlan.preferredSchedule;

  const defaultTab = packet.status === 'PENDING_CLIENT_SUBMISSION' || needsTreatmentPlanSig || needsScheduleBuilder ? 'forms' : 'tracker';
  const [activeTab, setActiveTab] = useState<'forms' | 'tracker' | 'schedule' | 'messages'>(defaultTab);
  const [parentSignatureName, setParentSignatureName] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isPending, startTransition] = useTransition();

  const [unreadCount, setUnreadCount] = useState(
    messages.filter((m: any) => !m.isFromClient && !m.readAt).length
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    startTransition(async () => {
      await sendClientMessage(client.id, messageText, true, 'Client');
      setMessageText('');
    });
  };

  const getStatusStep = () => {
    const s = client.status;
    if (['INQUIRY', 'MAGIC_LINK_SENT'].includes(s)) return 1;
    if (['DOCS_SUBMITTED', 'DOCS_APPROVED_INTAKE'].includes(s)) return 2;
    if (['CLINICAL_REVIEW_APPROVED', 'VOB_COMPLETED', 'PA_SUBMITTED'].includes(s)) return 3;
    if (['PA_APPROVED', 'ASSESSMENT_SCHEDULED'].includes(s)) return 4;
    if (['REPORT_ASSEMBLED', 'TX_PA_SUBMITTED'].includes(s)) return 5;
    if (['TX_PA_APPROVED'].includes(s)) return 6;
    if (s === 'ACTIVE') return 7;
    return 1;
  };

  const currentStep = getStatusStep();

  return (
    <div className="min-h-screen bg-[#0a0a0c] bg-grid-pattern text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0f1115] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-blue-500" />
            <span className="font-bold tracking-wide">Simple RAS Portal</span>
          </div>
          <div className="text-xs text-zinc-400 flex items-center">
            <Lock className="w-3 h-3 mr-1" /> Secure Session
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 flex gap-6 mt-2">
          <button 
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'forms' ? 'border-brand-gold-500 text-brand-gold-500' : 'border-transparent text-zinc-400 hover:text-white'}`}
            onClick={() => setActiveTab('forms')}
          >
            Action Items
            {(packet.status === 'PENDING_CLIENT_SUBMISSION' || needsTreatmentPlanSig || needsScheduleBuilder) && (
              <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {(packet.status === 'PENDING_CLIENT_SUBMISSION' && (needsTreatmentPlanSig || needsScheduleBuilder)) ? '2' : '1'}
              </span>
            )}
          </button>
          <button 
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'tracker' ? 'border-brand-gold-500 text-brand-gold-500' : 'border-transparent text-zinc-400 hover:text-white'}`}
            onClick={() => setActiveTab('tracker')}
          >
            Progress Tracker
          </button>
          {hasSchedule && (
            <button 
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center ${activeTab === 'schedule' ? 'border-brand-gold-500 text-brand-gold-500' : 'border-transparent text-zinc-400 hover:text-white'}`}
              onClick={() => setActiveTab('schedule')}
            >
              My Schedule
            </button>
          )}
          <button 
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center ${activeTab === 'messages' ? 'border-brand-gold-500 text-brand-gold-500' : 'border-transparent text-zinc-400 hover:text-white'}`}
            onClick={() => {
              setActiveTab('messages');
              if (unreadCount > 0) {
                setUnreadCount(0);
                markClientMessagesAsRead(client.id, false);
              }
            }}
          >
            Messages
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[16px] text-center inline-block leading-none">{unreadCount}</span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* FORMS TAB */}
        {activeTab === 'forms' && (
          <div className="animate-slide-up space-y-8">
            
            {needsTreatmentPlanSig && (
              <div className="bg-[#0f1115] border border-brand-blue-500/30 p-6 rounded-2xl shadow-[0_0_50px_rgba(0,200,255,0.1)]">
                <h2 className="text-xl font-bold mb-2">Treatment Plan Signature Required</h2>
                <p className="text-sm text-zinc-400 mb-6">Your BCBA has finalized your child's treatment plan. Please review and provide your e-signature below to proceed to the authorization phase.</p>
                <div className="bg-zinc-950 rounded-xl p-6 border border-white/5 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-zinc-300">
                    <div><strong>Total ABA Hours Requested:</strong> {treatmentPlan.hours97153 || 0} hrs/week</div>
                    <div><strong>BCBA Supervision:</strong> {treatmentPlan.hours97155 || 0} hrs/week</div>
                    <div><strong>Parent Training:</strong> {treatmentPlan.hours97156 || 0} hrs/week</div>
                    <div><strong>Service Locations:</strong> {treatmentPlan.primaryLocations?.join(', ') || 'N/A'}</div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5">
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Parent/Guardian E-Signature</label>
                    <input 
                      type="text" 
                      className={`w-full rounded-lg p-3 text-white transition-all duration-300 font-signature text-lg outline-none border ${
                        !parentSignatureName.trim() 
                          ? '!border-yellow-500/50 !bg-yellow-500/10 focus:!border-yellow-400 placeholder:!text-yellow-500/50' 
                          : '!border-zinc-700 !bg-zinc-900 focus:!border-brand-blue-500'
                      }`} 
                      placeholder="Type your full name to sign" 
                      value={parentSignatureName} 
                      onChange={(e) => setParentSignatureName(e.target.value)} 
                      disabled={isSigning} 
                    />
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (!parentSignatureName.trim()) return;
                      setIsSigning(true);
                      startTransition(async () => {
                        await signTreatmentPlan(client.id, parentSignatureName);
                        setIsSigning(false);
                      });
                    }}
                    disabled={!parentSignatureName.trim() || isSigning}
                    className={`w-full font-bold py-3 rounded-lg transition-all duration-500 mt-4 border ${
                      parentSignatureName.trim() 
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)] border-green-400 scale-[1.02] cursor-pointer' 
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-transparent'
                    }`}
                  >
                    {isSigning ? 'Signing...' : 'Sign & Submit Treatment Plan'}
                  </button>
                </div>
              </div>
            )}

            {needsScheduleBuilder && (
              <div className="animate-slide-up">
                <ClientScheduleBuilder client={client} paRequests={client.paRequests || []} />
              </div>
            )}

            {packet.status === 'PENDING_CLIENT_SUBMISSION' && (
              <div className="bg-[#0f1115] border border-brand-orange-500/30 p-6 rounded-2xl shadow-[0_0_50px_rgba(255,107,0,0.1)]">
                <h2 className="text-xl font-bold mb-2">Required Intake Documents</h2>
                <p className="text-sm text-zinc-400 mb-6">Please complete the following forms. For your privacy, once submitted, this data will be securely locked and no longer visible on your device.</p>
                <div className="bg-zinc-950 rounded-xl p-4">
                  <ContinuousIntakeForm packet={packet} client={client} />
                </div>
              </div>
            )}

            {!needsTreatmentPlanSig && !needsScheduleBuilder && packet.status !== 'PENDING_CLIENT_SUBMISSION' && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">All Caught Up!</h2>
                <p className="text-zinc-400">You have no pending action items. We are processing your case.</p>
              </div>
            )}
          </div>
        )}

        {/* TRACKER TAB */}
        {activeTab === 'tracker' && (
          <div className="animate-slide-up bg-[#0f1115] border border-white/5 p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-8">Case Progress</h2>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              
              <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f1115] bg-brand-gold-500 text-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_20px_rgba(255,200,0,0.4)] z-10">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-brand-gold-500/30 bg-brand-gold-500/5">
                  <h3 className="font-bold text-brand-gold-400">Step 1: Intake & Documents</h3>
                  <p className="text-xs text-zinc-400 mt-1">Collecting demographic and medical records.</p>
                </div>
              </div>

              <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${currentStep >= 2 ? 'is-active' : ''}`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f1115] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${currentStep >= 2 ? 'bg-brand-blue-500 text-white shadow-[0_0_20px_rgba(0,150,255,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}>
                  {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${currentStep >= 2 ? 'border-brand-blue-500/30 bg-brand-blue-500/5' : 'border-white/5 bg-zinc-900/50'}`}>
                  <h3 className={`font-bold ${currentStep >= 2 ? 'text-brand-blue-400' : 'text-zinc-500'}`}>Step 2: Clinical Review</h3>
                  <p className="text-xs text-zinc-400 mt-1">Our clinical team is reviewing your medical necessity.</p>
                </div>
              </div>

              <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${currentStep >= 3 ? 'is-active' : ''}`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f1115] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${currentStep >= 3 ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(150,0,255,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}>
                  {currentStep > 3 ? <CheckCircle2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${currentStep >= 3 ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/5 bg-zinc-900/50'}`}>
                  <h3 className={`font-bold ${currentStep >= 3 ? 'text-purple-400' : 'text-zinc-500'}`}>Step 3: Authorization</h3>
                  <p className="text-xs text-zinc-400 mt-1">Verifying benefits and securing Prior Authorization from insurance.</p>
                </div>
              </div>

              <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${currentStep >= 4 ? 'is-active' : ''}`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f1115] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${currentStep >= 4 ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(0,255,100,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}>
                  {currentStep > 4 ? <CheckCircle2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${currentStep >= 4 ? 'border-green-500/30 bg-green-500/5' : 'border-white/5 bg-zinc-900/50'}`}>
                  <h3 className={`font-bold ${currentStep >= 4 ? 'text-green-400' : 'text-zinc-500'}`}>Step 4: Assessment</h3>
                  <p className="text-xs text-zinc-400 mt-1">Scheduling and conducting your initial BCBA assessment.</p>
                </div>
              </div>

              <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${currentStep >= 5 ? 'is-active' : ''}`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f1115] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${currentStep >= 5 ? 'bg-brand-orange-500 text-white shadow-[0_0_20px_rgba(255,107,0,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}>
                  {currentStep > 5 ? <CheckCircle2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${currentStep >= 5 ? 'border-brand-orange-500/30 bg-brand-orange-500/5' : 'border-white/5 bg-zinc-900/50'}`}>
                  <h3 className={`font-bold ${currentStep >= 5 ? 'text-brand-orange-400' : 'text-zinc-500'}`}>Step 5: Treatment Plan</h3>
                  <p className="text-xs text-zinc-400 mt-1">Reviewing and signing your customized treatment plan.</p>
                </div>
              </div>

              <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${currentStep >= 6 ? 'is-active' : ''}`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f1115] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${currentStep >= 6 ? 'bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}>
                  {currentStep > 6 ? <CheckCircle2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${currentStep >= 6 ? 'border-pink-500/30 bg-pink-500/5' : 'border-white/5 bg-zinc-900/50'}`}>
                  <h3 className={`font-bold ${currentStep >= 6 ? 'text-pink-400' : 'text-zinc-500'}`}>Step 6: Staffing & Scheduling</h3>
                  <p className="text-xs text-zinc-400 mt-1">You will be assigned a BCBA, RBT, and Case Coordinator, and build your schedule.</p>
                </div>
              </div>

              <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${currentStep >= 7 ? 'is-active' : ''}`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f1115] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${currentStep >= 7 ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${currentStep >= 7 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-zinc-900/50'}`}>
                  <h3 className={`font-bold ${currentStep >= 7 ? 'text-emerald-400' : 'text-zinc-500'}`}>Step 7: Active Services</h3>
                  <p className="text-xs text-zinc-400 mt-1">Congratulations! Your ongoing ABA services have begun.</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && hasSchedule && (
          <div className="animate-slide-up">
            <ClientScheduleBuilder client={client} paRequests={client.paRequests || []} />
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="animate-slide-up flex flex-col h-[70vh] bg-[#0f1115] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/5 bg-zinc-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-blue-500/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-brand-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-white">Clinic Concierge</h3>
                <p className="text-xs text-zinc-400">Usually replies in a few hours</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0a0a0c]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.isFromClient ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm ${msg.isFromClient ? 'bg-brand-blue-600 text-white rounded-br-none' : 'bg-zinc-800 border border-white/5 text-zinc-200 rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 px-1">{msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-zinc-900 flex gap-3">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 bg-zinc-950 border border-white/10 rounded-full px-5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue-500 transition-colors"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={isPending || !messageText.trim()}
                className="bg-brand-blue-600 hover:bg-brand-blue-700 disabled:opacity-50 text-white rounded-full px-6 font-semibold text-sm transition-colors shadow-lg"
              >
                {isPending ? '...' : 'Send'}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
