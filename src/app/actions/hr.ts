'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function assignHrStaff(clientId: string, data: { bcbaId?: string | null, rbtId?: string | null }) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return { success: false, error: 'Client not found.' };
    }

    const updatedData: any = { ...data };
    if (data.rbtId !== undefined) {
      updatedData.rbtApproved = false;
    }

    // Check if activating
    const currentBcba = data.bcbaId !== undefined ? data.bcbaId : client.bcbaId;
    const currentRbt = data.rbtId !== undefined ? data.rbtId : client.rbtId;
    const currentCoordinator = client.caseCoordinatorId;
    const isRbtApproved = data.rbtId !== undefined ? false : client.rbtApproved;

    if (client.status === 'STAFFING_PENDING') {
      if (currentBcba && currentRbt && currentCoordinator && isRbtApproved) {
        updatedData.status = 'ACTIVE';
      }
    }

    const result = await prisma.client.update({
      where: { id: clientId },
      data: updatedData
    });

    revalidatePath('/', 'layout');

    return { success: true, data: result };
  } catch (error) {
    console.error('Action failed [assignHrStaff]:', error instanceof Error ? error.message : 'Unknown error');
    return { success: false, error: 'Operation failed. Please try again.' };
  }
}

export async function getHrStaffingOptions() {
  try {
    const bcbas = await prisma.user.findMany({
      where: { role: 'BCBA', isActive: true },
      select: { id: true, firstName: true, lastName: true }
    });

    const rbts = await prisma.user.findMany({
      where: { role: 'RBT', isActive: true },
      select: { id: true, firstName: true, lastName: true }
    });

    return { success: true, bcbas, rbts };
  } catch (error) {
    console.error('Error fetching HR staffing options:', error);
    return { success: false, bcbas: [], rbts: [] };
  }
}
