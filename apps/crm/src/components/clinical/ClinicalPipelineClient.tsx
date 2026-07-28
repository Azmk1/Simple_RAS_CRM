'use client';

import React, { useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { submitTreatmentPlan } from '@/app/(dashboard)/clinical/actions';
import { FileSignature } from 'lucide-react';

export default function ClinicalPipelineClient({ assessmentClients }: any) {
  const [isPending, startTransition] = useTransition();

  const handleCompletePlan = (clientId: string) => {
    startTransition(async () => {
      await submitTreatmentPlan(clientId);
    });
  };

  return (
    <div className="mt-8 space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-heading">4. Assessment & Treatment Plan</h2>
        <Badge variant="secondary">{assessmentClients.length}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {assessmentClients.map((client: any) => (
          <Card key={client.id} className="border-indigo-200 dark:border-indigo-900 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">{client.firstName} {client.lastName}</p>
                  <p className="text-xs text-slate-500">Status: Assessment Phase (97151)</p>
                </div>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700">BCBA Action</Badge>
              </div>
              
              <div className="text-xs text-slate-500 border-t pt-2 space-y-1">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-indigo-400"/> Schedule Meet & Greet</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-indigo-400"/> Perform 97151 Assessment</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-indigo-400"/> Write Treatment Plan</div>
              </div>
              
              <Button 
                variant="primary" 
                size="sm" 
                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                onClick={() => handleCompletePlan(client.id)}
                disabled={isPending}
              >
                <FileSignature className="w-4 h-4 mr-2" />
                Submit Treatment Plan
              </Button>
            </CardContent>
          </Card>
        ))}

        {assessmentClients.length === 0 && (
          <div className="col-span-2 text-center p-8 text-slate-500 border rounded-xl border-dashed">
            No pending assessments found.
          </div>
        )}
      </div>
    </div>
  );
}
