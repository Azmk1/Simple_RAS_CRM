'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPaRequest(formData: FormData) {
  const clientId = String(formData.get('clientId'));

  const paRequest = await prisma.pARequest.create({
    data: {
      clientId,
      type: 'ASSESSMENT',
      status: 'NOT_STARTED'
    }
  });

  await prisma.client.update({
    where: { id: clientId },
    data: { status: 'VOB_COMPLETED' }
  });

  revalidatePath('/portal-billing');
  revalidatePath(`/client/${clientId}`);
}

export async function updateVob(formData: FormData) {
  const paId = String(formData.get('paId'));
  const vobCompleted = formData.get('vobCompleted') === 'true';
  const providerCredentialed = formData.get('providerCredentialed') === 'true';

  await prisma.pARequest.update({
    where: { id: paId },
    data: { vobCompleted, providerCredentialed }
  });

  revalidatePath('/portal-billing');
}

export async function submitPa(formData: FormData) {
  const paId = String(formData.get('paId'));
  const clientId = String(formData.get('clientId'));

  await prisma.pARequest.update({
    where: { id: paId },
    data: { status: 'SUBMITTED' }
  });

  await prisma.client.update({
    where: { id: clientId },
    data: { status: 'PA_SUBMITTED' }
  });

  revalidatePath('/portal-billing');
  revalidatePath(`/client/${clientId}`);
}

export async function logPaOutcome(formData: FormData) {
  const paId = String(formData.get('paId'));
  const clientId = String(formData.get('clientId'));
  const outcome = String(formData.get('outcome'));

  if (outcome === 'APPROVED') {
    const authNumber = String(formData.get('authNumber'));
    const approvedUnits = parseInt(String(formData.get('approvedUnits')), 10);
    const effectiveDate = new Date(String(formData.get('effectiveDate')));
    const expirationDate = new Date(String(formData.get('expirationDate')));

    await prisma.pARequest.update({
      where: { id: paId },
      data: {
        status: 'APPROVED',
        authNumber,
        approvedUnits,
        effectiveDate,
        expirationDate
      }
    });

    // We also create an actual Authorization record for legacy compatibility
    await prisma.authorization.create({
      data: {
        clientId,
        type: 'ASSESSMENT',
        status: 'APPROVED',
        authNumber,
        unitsApproved: approvedUnits,
        startDate: effectiveDate,
        endDate: expirationDate
      }
    });

    await prisma.client.update({
      where: { id: clientId },
      data: { status: 'PA_APPROVED' }
    });

  } else if (outcome === 'DENIED_CLERICAL' || outcome === 'DENIED_CLINICAL') {
    await prisma.pARequest.update({
      where: { id: paId },
      data: { status: outcome as any }
    });
  }

  revalidatePath('/portal-billing');
  revalidatePath(`/client/${clientId}`);
}
