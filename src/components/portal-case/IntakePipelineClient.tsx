'use client';

import React, { useActionState, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createIntakeClient } from '@/app/(dashboard)/portal-case/actions';
import { Plus } from 'lucide-react';

const initialState = { error: '', success: false };

export default function IntakePipelineClient({ clients }: { clients: any[] }) {
  const [state, formAction, isPending] = useActionState(createIntakeClient, initialState);
  const [showAddForm, setShowAddForm] = useState(false);

  // Calculate Metrics
  const totalClients = clients.length;
  const newInquiries = clients.filter(c => c.status === 'INQUIRY').length;
  const pendingReview = clients.filter(c => c.status === 'DOCS_SUBMITTED').length;
  const activeClients = clients.filter(c => c.status === 'ACTIVE' || c.status === 'DOCS_APPROVED_INTAKE').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between mb-[26px]">
        <div>
          <h1 className="font-heading text-[29px] font-semibold m-0 mb-[6px] text-[var(--ink-100)]">
            Intake Clients
          </h1>
          <div className="text-[var(--ink-500)] text-[13.5px]">
            Add new clients, generate magic links, and collect initial data.
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          style={{ background: 'var(--grad-horizon)' }}
          className="border-none text-[var(--navy-950)] px-[18px] py-[10px] rounded-[10px] text-[13px] font-bold cursor-pointer shadow-[0_0_18px_rgba(255,122,69,0.3)] hover:opacity-90 transition-opacity whitespace-nowrap mt-[4px]"
        >
          {showAddForm ? 'Close Form' : '+ Add New Client'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-[16px] mb-[32px]">
        <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
          <div className="flex items-center justify-between mb-[22px]">
            <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--ink-500)] uppercase">Total Clients</div>
            <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">👥</div>
          </div>
          <div className="font-heading text-[38px] font-semibold leading-none">{totalClients}</div>
          <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
            <div className="h-full bg-[var(--grad-horizon)]" style={{ width: '100%' }}></div>
          </div>
          <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">All time</div>
        </div>

        <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
          <div className="flex items-center justify-between mb-[22px]">
            <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--dawn-hot)] uppercase">New Inquiries</div>
            <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">◍</div>
          </div>
          <div className="font-heading text-[38px] font-semibold leading-none">{newInquiries}</div>
          <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
            <div className="h-full bg-[var(--grad-horizon)]" style={{ width: totalClients > 0 ? `${(newInquiries / totalClients) * 100}%` : '0%' }}></div>
          </div>
          <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">Awaiting action</div>
        </div>

        <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
          <div className="flex items-center justify-between mb-[22px]">
            <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--ink-500)] uppercase">Pending Review</div>
            <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">◷</div>
          </div>
          <div className="font-heading text-[38px] font-semibold leading-none">{pendingReview}</div>
          <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
            <div className="h-full bg-[var(--grad-horizon)]" style={{ width: totalClients > 0 ? `${(pendingReview / totalClients) * 100}%` : '0%' }}></div>
          </div>
          <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">Documents submitted</div>
        </div>

        <div className="glass-panel px-[20px] pt-[20px] pb-[18px] transition-[0.2s] hover:border-[var(--line-hi)]">
          <div className="flex items-center justify-between mb-[22px]">
            <div className="font-mono text-[10.5px] font-semibold tracking-[1px] text-[var(--teal)] uppercase">Active/Approved</div>
            <div className="w-[28px] h-[28px] rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[var(--line-hi)] flex items-center justify-center text-[12px]">✓</div>
          </div>
          <div className="font-heading text-[38px] font-semibold leading-none">{activeClients}</div>
          <div className="h-[2px] rounded-[2px] bg-[rgba(255,255,255,0.06)] mt-[16px] overflow-hidden">
            <div className="h-full bg-[var(--grad-horizon)]" style={{ width: totalClients > 0 ? `${(activeClients / totalClients) * 100}%` : '0%' }}></div>
          </div>
          <div className="font-mono text-[10px] text-[var(--ink-500)] mt-[10px]">Successfully onboarded</div>
        </div>
      </div>

      <div className="mb-[16px]">
        <h3 className="font-mono text-[12.5px] font-semibold tracking-[1px] text-[var(--ink-500)] uppercase m-0">Intake Roster · {clients.length} record{clients.length !== 1 ? 's' : ''}</h3>
      </div>

      {showAddForm && (
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle>New Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Child Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 border-b pb-2">Child Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">First Name *</label>
                      <input type="text" name="firstName" required className="w-full text-sm border p-2 rounded-md" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Last Name *</label>
                      <input type="text" name="lastName" required className="w-full text-sm border p-2 rounded-md" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Gender (Optional)</label>
                      <input type="text" name="childGender" className="w-full text-sm border p-2 rounded-md" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Age (Optional)</label>
                      <input type="number" name="childAge" className="w-full text-sm border p-2 rounded-md" />
                    </div>
                  </div>
                </div>

                {/* Parent Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 border-b pb-2">Parent / Guardian Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Parent Name *</label>
                      <input type="text" name="parentName" required className="w-full text-sm border p-2 rounded-md" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Parent Gender *</label>
                      <select name="parentGender" required className="w-full text-sm border p-2 rounded-md bg-[var(--color-surface)]">
                        <option value="">Select...</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Phone Number *</label>
                      <input type="tel" name="guardianPhone" required className="w-full text-sm border p-2 rounded-md" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Address *</label>
                      <input type="text" name="parentAddress" required className="w-full text-sm border p-2 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>

              {state.error && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{state.error}</div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-brand-blue-500" isLoading={isPending}>Create Client & Go To Profile</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Client List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[16px]">
        {clients.map((client) => (
          <a key={client.id} href={`/client/${client.id}`} className="block group">
            <div className="glass-panel px-[20px] pt-[20px] pb-[18px] relative overflow-hidden transition-[0.2s] cursor-pointer hover:border-[rgba(255,122,69,0.3)] hover:-translate-y-[2px]">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--grad-horizon)]"></div>
              
              <div className="flex items-center gap-[12px] mb-[14px]">
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[var(--navy-800)] flex items-center justify-center text-[13px] font-bold text-[var(--ink-100)] border border-[var(--line-hi)]">
                  {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-[15px] leading-tight text-[var(--ink-100)] group-hover:text-[var(--dawn-hot)] transition-colors flex items-center gap-[8px]">
                    {client.firstName} {client.lastName}
                    {(() => {
                      const packet = client.intakePacket; // one-to-one, not array
                      let isReview = client.status === 'DOCS_SUBMITTED';
                      if (packet) {
                        isReview = packet.status === 'SUBMITTED';
                      }
                      return isReview;
                    })() && (
                      <span className="bg-[rgba(255,122,69,0.15)] text-[var(--dawn-hot)] border border-[rgba(255,122,69,0.3)] text-[8.5px] font-mono font-bold px-[5px] py-[2px] rounded-[4px] animate-pulse">
                        REVIEW
                      </span>
                    )}
                  </div>
                  {(() => {
                    let displayStatus = client.status.replace(/_/g, ' ');
                    let isChangesNeeded = false;
                    const packet = client.intakePacket; // one-to-one, not array
                    if (packet) {
                      const rejections = typeof packet.rejectionDetails === 'object' && packet.rejectionDetails !== null ? packet.rejectionDetails : {};
                      if (packet.status === 'PENDING_CLIENT_SUBMISSION') {
                        displayStatus = 'CHANGES NEEDED';
                        isChangesNeeded = true;
                      } else if (packet.status === 'SUBMITTED') {
                        displayStatus = 'REVIEW NEEDED';
                      }
                    }
                    
                    const textColor = isChangesNeeded ? 'text-red-500' : 'text-[var(--dawn-hot)]';
                    const shadowColor = isChangesNeeded ? 'shadow-[0_0_5px_rgba(239,68,68,1)]' : 'shadow-[0_0_5px_var(--dawn-hot)]';
                    const bgColor = isChangesNeeded ? 'bg-red-500' : '';
                    
                    return (
                      <div className={`flex items-center gap-[5px] font-mono text-[10px] font-semibold tracking-[.5px] mt-[3px] ${textColor}`}>
                        <span className={`dot-live !w-[4px] !h-[4px] ${shadowColor} ${bgColor}`}></span>
                        {displayStatus}
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              <div className="border-t border-[var(--line)] my-[14px] mx-[0]"></div>
              
              <div className="flex justify-between text-[12.5px] mb-[7px]">
                <span className="text-[var(--ink-500)]">Parent</span>
                <span className="text-[var(--ink-300)] font-mono text-[12px]">{client.guardianName}</span>
              </div>
              <div className="flex justify-between text-[12.5px] mb-[7px]">
                <span className="text-[var(--ink-500)]">Phone</span>
                <span className="text-[var(--ink-300)] font-mono text-[12px]">{client.guardianPhone}</span>
              </div>
            </div>
          </a>
        ))}


      </div>

    </div>
  );
}
