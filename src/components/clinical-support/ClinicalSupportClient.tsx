'use client';

import React, { useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { verifyDocuments, submitTreatmentPacket } from '@/app/(dashboard)/clinical-support/actions';
import { CheckCircle, FileText, UploadCloud } from 'lucide-react';

export default function ClinicalSupportClient({ pendingVerification, pendingAssessments }: any) {
  const [isPending, startTransition] = useTransition();

  const handleVerify = (clientId: string) => {
    startTransition(async () => {
      await verifyDocuments(clientId);
    });
  };

  const handleSubmit = (clientId: string) => {
    startTransition(async () => {
      await submitTreatmentPacket(clientId);
    });
  };

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-2 max-w-5xl">
      
      {/* COLUMN 1: DOCUMENT CROSS-CHECK */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading">4. Document Cross-Check</h2>
          <Badge variant="secondary">{pendingVerification.length}</Badge>
        </div>

        <div className="grid gap-4">
          {pendingVerification.map((client: any) => (
            <Card key={client.id} className="border-slate-200 shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">{client.firstName} {client.lastName}</p>
                    <p className="text-xs text-slate-500">Intake collected documents</p>
                  </div>
                  <Badge variant="warning">Verify</Badge>
                </div>
                
                <div className="bg-[var(--color-surface-hover)] p-3 rounded-md text-xs space-y-2 border">
                  <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-slate-400" /> Consent & HIPAA</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1"><FileText className="w-3 h-3 text-slate-400" /> Diagnostic Eval (&lt; 3 yrs)</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-slate-400" /> ABA Referral</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-slate-400" /> Insurance Cards</div>
                </div>
                
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="w-full bg-brand-blue-500"
                  onClick={() => handleVerify(client.id)}
                  isLoading={isPending}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Verify Complete & Route to PA
                </Button>
              </CardContent>
            </Card>
          ))}

          {pendingVerification.length === 0 && (
            <div className="text-center p-8 text-slate-500 border rounded-xl border-dashed">
              No files pending cross-check.
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 2: ASSESSMENT PREP & ROUTING */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading">Assessment Packet Assembly</h2>
          <Badge variant="secondary">{pendingAssessments.length}</Badge>
        </div>

        <div className="grid gap-4">
          {pendingAssessments.map((client: any) => (
            <Card key={client.id} className="border-brand-gold-200 shadow-sm bg-brand-gold-50/10">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">{client.firstName} {client.lastName}</p>
                    <p className="text-xs text-slate-500">97151 Authorized</p>
                  </div>
                  <Badge variant="outline" className="bg-brand-gold-50 text-brand-gold-700">Prep</Badge>
                </div>
                
                <div className="text-xs text-slate-600 border-t pt-2 space-y-2">
                  <p>1. Ensure BCBA schedule in Artemis</p>
                  <p>2. Finalize packet in Artemis</p>
                  <p>3. Hand off to Plutus for Treatment PA</p>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-slate-600 border-slate-200 hover:bg-slate-50"
                  onClick={() => handleSubmit(client.id)}
                  isLoading={isPending}
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Confirm sent to Plutus
                </Button>
              </CardContent>
            </Card>
          ))}

          {pendingAssessments.length === 0 && (
            <div className="text-center p-8 text-slate-500 border rounded-xl border-dashed">
              No assessments currently pending prep.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
