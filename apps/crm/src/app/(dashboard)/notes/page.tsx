import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { prisma } from '@/lib/prisma';
import NotesPipelineClient from '@/components/notes/NotesPipelineClient';

export default async function NotesDashboard() {
  // Step 8b: The Note Sweep
  // Find all SessionNotes where all 3 signatures are present, but it hasn't been sent to billing yet
  const pendingNotes = await prisma.sessionNote.findMany({
    where: {
      rbtSigned: true,
      parentSigned: true,
      bcbaSigned: true,
      isConverted: false
    },
    include: {
      session: {
        include: {
          client: true,
          rbt: true,
          bcba: true
        }
      },
      deficiencies: {
        where: { status: 'OPEN' }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Session Notes Sweep</h1>
        <p className="text-slate-500">Verify completed session notes and route them to Billing.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ready for Sweep</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-gold-500">{pendingNotes.length}</div>
            <p className="text-xs text-slate-500 mt-1">Signatures complete</p>
          </CardContent>
        </Card>
      </div>

      <NotesPipelineClient pendingNotes={pendingNotes} />
    </div>
  );
}
