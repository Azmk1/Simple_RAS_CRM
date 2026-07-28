'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react';

export default function OpsDashboardClient({ agedSessions, atRiskAuths }: any) {
  return (
    <div className="mt-8 grid gap-8 md:grid-cols-2 max-w-6xl">
      
      {/* COLUMN 1: AGED UNCONVERTED SESSIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading">Aged Unconverted Sessions</h2>
          <Badge variant="danger">High Priority</Badge>
        </div>

        <div className="grid gap-4">
          {agedSessions.map((note: any) => {
            const ageInDays = Math.floor((new Date().getTime() - new Date(note.createdAt).getTime()) / (1000 * 3600 * 24));
            
            return (
              <Card key={note.id} className="border-red-200 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{note.session.client.firstName} {note.session.client.lastName}</p>
                      <p className="text-xs text-slate-500">Session on {new Date(note.session.scheduledStart).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={ageInDays > 3 ? "danger" : "warning"} className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {ageInDays} Days Old
                    </Badge>
                  </div>
                  
                  <div className="text-xs bg-[var(--color-surface-hover)] p-2 rounded-md border space-y-1">
                    <p className="font-medium">Missing/Flags:</p>
                    {!note.rbtSigned && <p className="text-red-500">• Missing RBT Signature</p>}
                    {!note.parentSigned && <p className="text-red-500">• Missing Parent Signature</p>}
                    {!note.bcbaSigned && <p className="text-red-500">• Missing BCBA Signature</p>}
                    {note.deficiencies.length > 0 && (
                      <p className="text-amber-600">• {note.deficiencies.length} Open Deficiencies routed back to author</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {agedSessions.length === 0 && (
            <div className="text-center p-8 text-slate-500 border rounded-xl border-dashed">
              No aged notes! Pipeline is perfectly clean.
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 2: AUTHORIZATION RISK */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading">Authorizations at Risk (&lt; 30 days)</h2>
        </div>

        <div className="grid gap-4">
          {atRiskAuths.map((auth: any) => (
            <Card key={auth.id} className="border-amber-200 shadow-sm bg-amber-50/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      {auth.client.firstName} {auth.client.lastName}
                    </p>
                    <p className="text-xs text-slate-500">Auth #{auth.authNumber} ({auth.type})</p>
                  </div>
                </div>
                <div className="text-xs font-medium text-amber-700 bg-amber-100 p-2 rounded-md">
                  Expires: {new Date(auth.endDate).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}

          {atRiskAuths.length === 0 && (
            <div className="text-center p-8 text-slate-500 border rounded-xl border-dashed">
              No authorizations expiring within 30 days.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
