import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { prisma } from '@/lib/prisma';
import IntakePipelineClient from '@/components/intake/IntakePipelineClient';

export default async function IntakeDashboard() {
  // Fetch clients currently in INQUIRY phase
  const inquiries = await prisma.client.findMany({
    where: { status: 'INQUIRY' },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch clients currently in AUTH_INITIATED phase (waiting for CPT 97151 approval)
  const pendingAuths = await prisma.client.findMany({
    where: { status: 'PA_SUBMITTED' },
    orderBy: { updatedAt: 'desc' }
  });

  // Fetch Authorizations expiring soon (Phase 9 Reauth trigger)
  const fortyFiveDaysFromNow = new Date();
  fortyFiveDaysFromNow.setDate(fortyFiveDaysFromNow.getDate() + 45);

  const expiringAuths = await prisma.authorization.findMany({
    where: {
      status: 'APPROVED',
      endDate: {
        lte: fortyFiveDaysFromNow,
        gte: new Date()
      }
    },
    include: { client: true }
  });

  // Fetch pending TREATMENT authorizations (Step 5)
  const pendingTreatmentAuths = await prisma.authorization.findMany({
    where: { type: 'TREATMENT', status: 'PENDING' },
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Intake & PA Pipeline</h1>
        <p className="text-slate-500">Manage incoming documents and track authorization expirations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">New Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiries.length}</div>
            <p className="text-xs text-slate-500 mt-1">Pending document cross-check</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending 97151 Auths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{pendingAuths.length}</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting payer approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Auths Expiring &lt; 45 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{expiringAuths.length}</div>
            <p className="text-xs text-slate-500 mt-1">Requires re-authorization</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Pipeline Board */}
      <IntakePipelineClient inquiries={inquiries} pendingAuths={pendingAuths} expiringAuths={expiringAuths} pendingTreatmentAuths={pendingTreatmentAuths} />
    </div>
  );
}
