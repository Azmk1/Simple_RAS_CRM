'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function completeVobAndCreds(clientId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { paRequests: true }
    });

    if (!client) throw new Error('Client not found');

    // Create or update PARequest
    const pa = client.paRequests.find(p => p.type === 'ASSESSMENT');
    
    if (pa) {
      await prisma.pARequest.update({
        where: { id: pa.id },
        data: { vobCompleted: true, providerCredentialed: true }
      });
    } else {
      await prisma.pARequest.create({
        data: {
          clientId,
          type: 'ASSESSMENT',
          vobCompleted: true,
          providerCredentialed: true,
          status: 'NOT_STARTED'
        }
      });
    }

    // Move client to VOB_COMPLETED
    await prisma.client.update({
      where: { id: clientId },
      data: { status: 'VOB_COMPLETED' }
    });

    revalidatePath(`/client/${clientId}`);
    revalidatePath('/portal-case/clients');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to complete VOB:', error);
    return { success: false, error: error.message };
  }
}

export async function submitPaRequest(clientId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { paRequests: true }
    });

    if (!client) throw new Error('Client not found');

    const pa = client.paRequests.find(p => p.type === 'ASSESSMENT');
    if (!pa) throw new Error('PA Request record not found. Complete VOB first.');

    await prisma.pARequest.update({
      where: { id: pa.id },
      data: { status: 'SUBMITTED' }
    });

    await prisma.client.update({
      where: { id: clientId },
      data: { status: 'PA_SUBMITTED' }
    });

    revalidatePath(`/client/${clientId}`);
    revalidatePath('/portal-case/clients');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to submit PA:', error);
    return { success: false, error: error.message };
  }
}

export async function denyPaRequest(paId: string, isClinical: boolean) {
  try {
    const pa = await prisma.pARequest.update({
      where: { id: paId },
      data: { status: isClinical ? 'DENIED_CLINICAL' : 'DENIED_CLERICAL' }
    });

    revalidatePath(`/client/${pa.clientId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to deny PA:', error);
    return { success: false, error: error.message };
  }
}

export async function approvePaRequest(paId: string, data: { authNumber: string, approvedUnits: number, effectiveDate: Date, expirationDate: Date }) {
  try {
    if (new Date(data.expirationDate) < new Date(data.effectiveDate)) {
      return { success: false, error: 'Expiration date cannot be before the effective date.' };
    }
    const pa = await prisma.pARequest.update({
      where: { id: paId },
      data: { 
        status: 'APPROVED',
        authNumber: data.authNumber,
        approvedUnits: data.approvedUnits,
        effectiveDate: data.effectiveDate,
        expirationDate: data.expirationDate
      }
    });

    await prisma.client.update({
      where: { id: pa.clientId },
      data: { status: 'PA_APPROVED' } // Eventually moves to ACTIVE after scheduling
    });

    revalidatePath(`/client/${pa.clientId}`);
    revalidatePath('/portal-case/clients');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to approve PA:', error);
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------
// TREATMENT PA ACTIONS
// ---------------------------------------------------------

export async function submitTreatmentPaRequest(clientId: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { paRequests: true }
    });

    if (!client) throw new Error('Client not found');

    let pa = client.paRequests.find(p => p.type === 'TREATMENT');
    
    if (pa) {
      await prisma.pARequest.update({
        where: { id: pa.id },
        data: { status: 'SUBMITTED' }
      });
    } else {
      await prisma.pARequest.create({
        data: {
          clientId,
          type: 'TREATMENT',
          status: 'SUBMITTED'
        }
      });
    }

    await prisma.client.update({
      where: { id: clientId },
      data: { status: 'TX_PA_SUBMITTED' }
    });

    revalidatePath(`/client/${clientId}`);
    revalidatePath('/portal-billing/clients');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to submit Treatment PA:', error);
    return { success: false, error: error.message };
  }
}

export async function approveTreatmentPaRequest(paId: string, data: { authNumber: string, approvedUnits: number, effectiveDate: Date, expirationDate: Date }) {
  try {
    if (new Date(data.expirationDate) < new Date(data.effectiveDate)) {
      return { success: false, error: 'Expiration date cannot be before the effective date.' };
    }
    const pa = await prisma.pARequest.update({
      where: { id: paId },
      data: { 
        status: 'APPROVED',
        authNumber: data.authNumber,
        approvedUnits: data.approvedUnits,
        effectiveDate: data.effectiveDate,
        expirationDate: data.expirationDate
      }
    });

    await prisma.client.update({
      where: { id: pa.clientId },
      data: { status: 'TX_PA_APPROVED' } // Eventually maps to ACTIVE
    });

    revalidatePath(`/client/${pa.clientId}`);
    revalidatePath('/portal-billing/clients');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to approve Treatment PA:', error);
    return { success: false, error: error.message };
  }
}
