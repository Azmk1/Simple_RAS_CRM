'use server';

import { prisma } from '@repo/db';
import { revalidatePath } from 'next/cache';

export async function dispatchRbtCandidate(clientId: string, rbtCandidateId: string, candidateName: string) {
  try {
    // 1. Update Client with assigned candidate & transition status to STAFFED
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        rbtId: rbtCandidateId,
        status: 'ACTIVE',
      },
    });

    // 2. Notify Case Coordinators in CRM
    const caseCoordinators = await prisma.user.findMany({
      where: { role: 'CASE_COORDINATOR' },
      select: { id: true }
    });

    if (caseCoordinators.length > 0) {
      await prisma.notification.createMany({
        data: caseCoordinators.map(cc => ({
          userId: cc.id,
          title: '⚡ RBT Candidate Dispatched from HR',
          message: `HR has assigned RBT candidate ${candidateName} to Client ${updatedClient.firstName} ${updatedClient.lastName}. Status updated to STAFFED.`,
          type: 'SUCCESS',
          linkUrl: `/client/${clientId}?mode=case-coord`
        }))
      });
    }

    revalidatePath('/clients');
    return { success: true, client: updatedClient };
  } catch (error: any) {
    console.error('Error dispatching RBT candidate:', error);
    return { success: false, error: error.message || 'Failed to dispatch RBT candidate' };
  }
}
