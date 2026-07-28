'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { approveClinicalDocs, rejectClinicalDocs } from '@/app/(dashboard)/portal-clinical/actions';
import { CheckCircle, AlertTriangle, FileText } from 'lucide-react';

export default function ClinicalReviewQueue({ clients }: { clients: any[] }) {
  if (clients.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 border rounded-xl border-dashed bg-[var(--color-surface)]">
        No packets waiting for Clinical Review.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {clients.map(client => {
        const packet = client.intakePacket;

        return (
          <Card key={client.id} className="border-teal-200 shadow-sm">
            <CardHeader className="bg-teal-50 border-b border-teal-100">
              <CardTitle className="text-lg text-teal-900 flex justify-between">
                <span>{client.firstName} {client.lastName} - Clinical Review</span>
                <a href={`/client/${client.id}`} className="text-xs font-medium bg-[var(--color-surface)] px-3 py-1 rounded shadow-sm hover:bg-teal-100">
                  View Full Profile
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4 border-r pr-6">
                  <h4 className="text-sm font-semibold text-slate-700">Documents Submitted (Approved by Intake)</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm p-2 bg-[var(--color-surface-hover)] rounded">
                      <span className="flex items-center"><FileText className="w-4 h-4 mr-2 text-slate-400"/> Registration, Medical Hx, Consents</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 bg-[var(--color-surface-hover)] rounded">
                      <span>Insurance & Medicaid Cards</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 bg-[var(--color-surface-hover)] rounded">
                      <span>Diagnostic Eval & Rx</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700">Decision</h4>
                  <p className="text-xs text-slate-500">
                    If the clinical documents (Diagnostic Eval, Rx) are valid and ready for PA, approve them. If not, reject them back to the Intake Coordinator with notes on what is missing.
                  </p>

                  <form action={approveClinicalDocs}>
                    <input type="hidden" name="clientId" value={client.id} />
                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                      Approve & Route to PA (Billing)
                    </Button>
                  </form>

                  <form action={rejectClinicalDocs} className="space-y-2 border-t pt-4">
                    <input type="hidden" name="packetId" value={packet.id} />
                    <input type="hidden" name="clientId" value={client.id} />
                    <textarea 
                      name="notes"
                      placeholder="e.g. The Diagnostic Eval is expired (over 3 years old)."
                      className="w-full text-sm border p-2 rounded-md bg-red-50/50 h-16"
                      required
                    />
                    <Button type="submit" variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Flag Back to Intake Coordinator
                    </Button>
                  </form>
                </div>
              </div>

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
