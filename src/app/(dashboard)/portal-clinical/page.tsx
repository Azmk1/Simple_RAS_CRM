import React from 'react';
import { prisma } from '@/lib/prisma';
import ClinicalReviewQueue from '@/components/portal-clinical/ClinicalReviewQueue';
import { Card, CardContent } from '@/components/ui/Card';
import { Stethoscope, AlertTriangle, FileCheck, Users } from 'lucide-react';

export default async function ClinicalPortalPage() {
  const clientsForReview = await prisma.client.findMany({
    where: { status: 'DOCS_APPROVED_INTAKE' },
    include: { intakePacket: true },
    orderBy: { updatedAt: 'desc' }
  });

  const allClients = await prisma.client.findMany();

  // Metrics
  const pendingReview = clientsForReview.length;
  const approvedDocs = allClients.filter(c => 
    ['CLINICAL_REVIEW_APPROVED', 'VOB_COMPLETED', 'PA_SUBMITTED', 'PA_APPROVED'].includes(c.status)
  ).length;
  
  // Note: We don't have a direct "rejected count" unless we query packets, but this is fine for now
  const activeAssessments = allClients.filter(c => c.status === 'PA_APPROVED').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-black text-brand-orange-500 ">CLINICAL PORTAL</h1>
        <p className="text-brand-blue-400">Clinical Support review of intake documents prior to PA.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up">
        <Card className="border-[var(--color-border)] bg-brand-black-800/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-brand-orange-400 font-semibold uppercase tracking-wider">Pending Review</p>
                <h3 className="text-3xl font-black text-white mt-2">{pendingReview}</h3>
              </div>
              <Stethoscope className="text-brand-orange-500 w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-brand-black-800/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-green-400 font-semibold uppercase tracking-wider">Approved by Clincal</p>
                <h3 className="text-3xl font-black text-white mt-2">{approvedDocs}</h3>
              </div>
              <FileCheck className="text-green-500 w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-brand-black-800/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">Flagged/Rejected</p>
                <h3 className="text-3xl font-black text-white mt-2">0</h3>
              </div>
              <AlertTriangle className="text-red-500 w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-brand-black-800/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-brand-blue-400 font-semibold uppercase tracking-wider">Ready for Assessment</p>
                <h3 className="text-3xl font-black text-white mt-2">{activeAssessments}</h3>
              </div>
              <Users className="text-brand-blue-500 w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-6 border-t border-brand-black-700">
        <ClinicalReviewQueue clients={clientsForReview} />
      </div>
    </div>
  );
}
