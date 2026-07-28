'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function approveClinicalReview(clientId: string) {
  let isSuccess = false;
  try {
    await prisma.client.update({
      where: { id: clientId },
      data: { status: 'CLINICAL_REVIEW_APPROVED' }
    });

    revalidatePath(`/client/${clientId}`);
    revalidatePath('/portal-case/clients');
    revalidatePath('/clinical-support/clients');
    isSuccess = true;
  } catch (error: any) {
    console.error('Failed to approve clinical review:', error);
    return { success: false, error: error.message };
  }
  
  if (isSuccess) redirect('/clinical-support/clients');
}

export async function rejectClinicalReview(clientId: string, documentKey: string, note: string) {
  let isSuccess = false;
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { intakePacket: true }
    });

    if (!client || !client.intakePacket) {
      throw new Error('Client or Intake Packet not found');
    }

    const currentDetails = typeof client.intakePacket.rejectionDetails === 'object' && client.intakePacket.rejectionDetails !== null 
      ? (client.intakePacket.rejectionDetails as Record<string, string>) 
      : {};

    currentDetails[documentKey] = `[Clinical Review] ${note}`;

    // Clear the formData so the client can re-upload if it's a document
    let parsed1 = typeof client.intakePacket.formData === 'string' ? JSON.parse(client.intakePacket.formData) : (client.intakePacket.formData || {});
    let formData = typeof parsed1 === 'string' ? JSON.parse(parsed1) : parsed1;
    
    const uploadMap: Record<string, string> = {
      insuranceCardFrontUploaded: 'docInsuranceFront',
      insuranceCardBackUploaded: 'docInsuranceBack',
      medicaidCardFrontUploaded: 'docMedicaidFront',
      medicaidCardBackUploaded: 'docMedicaidBack',
      diagnosticEvalUploaded: 'docEval',
      physicianRxUploaded: 'docReferral',
      iepUploaded: 'docIEP',
      custodyDocsUploaded: 'docCustody',
      priorAbaRecordsUploaded: 'docPriorABA'
    };
    
    const formKey = uploadMap[documentKey];
    if (formKey) {
      delete formData[formKey];
    }

    // Return the client to the Intake queue so Intake can manage the parent communication
    await prisma.client.update({
      where: { id: clientId },
      data: { status: 'DOCS_SUBMITTED' }
    });

    // Update packet to PENDING_CLIENT_SUBMISSION, store the note, set the specific doc to false
    let packetUpdateData: any = {
      status: 'PENDING_CLIENT_SUBMISSION',
      rejectionNotes: note,
      rejectionDetails: currentDetails,
      formData: formData
    };

    if (documentKey === 'form01') {
      packetUpdateData.intakeFormComplete = false;
    } else if (documentKey === 'form02') {
      packetUpdateData.consentFormComplete = false;
    } else {
      packetUpdateData[documentKey] = false;
    }

    await prisma.intakePacket.update({
      where: { id: client.intakePacket.id },
      data: packetUpdateData
    });

    revalidatePath(`/client/${clientId}`);
    revalidatePath('/portal-case/clients');
    revalidatePath('/clinical-support/clients');
    isSuccess = true;
  } catch (error: any) {
    console.error('Failed to reject clinical review:', error);
    return { success: false, error: error.message };
  }
  
  if (isSuccess) redirect('/clinical-support/clients');
}

export async function rejectClinicalFormFieldsBulk(clientId: string, packetId: string, fields: { fieldId: string, reason: string }[]) {
  const packet = await prisma.intakePacket.findUnique({ where: { id: packetId } });
  if (!packet) return;

  const currentDetails = typeof packet.rejectionDetails === 'object' && packet.rejectionDetails !== null 
    ? (packet.rejectionDetails as Record<string, string>) 
    : {};

  let parsed2 = typeof packet.formData === 'string' ? JSON.parse(packet.formData) : (packet.formData || {});
  let formData = typeof parsed2 === 'string' ? JSON.parse(parsed2) : parsed2;
  
  // Actually we don't strictly need to set intakeFormComplete / consentFormComplete here because we are in clinical review,
  // but if we send it back, the client needs to re-fill them, so we SHOULD set them to false.
  let intakeFormComplete = packet.intakeFormComplete;
  let consentFormComplete = packet.consentFormComplete;

  fields.forEach(({ fieldId, reason }) => {
    currentDetails[`formField_${fieldId}`] = `[Clinical Review] ${reason}`;
    delete formData[fieldId];
    
    // Check which form the field belonged to (form02 is usually cpt97151 etc)
    const form02Keys = ['cpt97151', 'cpt97153', 'cpt97155', 'cpt97156', 'cpt97157', 'cpt97158', 'cpt97154', 'photoInitial', 'cancelInitial', 'hipaaInitial', 'eSignInitial', 'sig1Name', 'sig1Date'];
    if (form02Keys.includes(fieldId)) {
      consentFormComplete = false;
    } else {
      intakeFormComplete = false;
    }
  });

  // We do not change client.status, so it stays in Clinical Support's queue.

  await prisma.intakePacket.update({
    where: { id: packetId },
    data: { 
      formData,
      rejectionDetails: currentDetails,
      status: 'PENDING_CLIENT_SUBMISSION',
      intakeFormComplete,
      consentFormComplete
    }
  });
  
  revalidatePath(`/client/${clientId}`);
  revalidatePath('/portal-case/clients');
  revalidatePath('/clinical-support/clients');
}

export async function resolveP2PDenial(paId: string, notes: string) {
  try {
    const pa = await prisma.pARequest.update({
      where: { id: paId },
      data: { 
        p2pResolved: true,
        p2pNotes: notes
      }
    });

    revalidatePath(`/client/${pa.clientId}`);
    revalidatePath('/clinical-support/clients');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to resolve P2P denial:', error);
    return { success: false, error: error.message };
  }
}
