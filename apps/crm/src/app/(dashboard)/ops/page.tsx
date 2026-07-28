import React from 'react';
import { prisma } from '@repo/db';
import OpsDashboardClient from '@/components/ops/OpsDashboardClient';

export default async function MasterOperationsPortal() {
  const agedSessions = await prisma.sessionNote.findMany({
    where: {
      isConverted: false,
      createdAt: {
        lte: new Date(Date.now() - 48 * 60 * 60 * 1000)
      }
    },
    include: {
      session: {
        include: {
          client: true
        }
      }
    },
    take: 10
  });

  const atRiskAuths = await prisma.pARequest.findMany({
    where: {
      status: 'APPROVED',
      expirationDate: {
        lte: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      }
    },
    include: {
      client: true
    },
    take: 10
  });

  return (
    <OpsDashboardClient agedSessions={agedSessions} atRiskAuths={atRiskAuths} />
  );
}
