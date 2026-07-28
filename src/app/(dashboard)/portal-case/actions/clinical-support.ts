'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function scheduleAssessment(clientId: string, date: Date) {
  try {
    await prisma.client.update({
      where: { id: clientId },
      data: { status: 'ASSESSMENT_SCHEDULED' }
    });

    // In a full implementation, we'd create a Session record or an Assessment record here.
    // For now, we update the status.

    revalidatePath(`/client/${clientId}`);
    revalidatePath('/clinical-support');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to schedule assessment:', error);
    return { success: false, error: error.message };
  }
}

export async function assembleReport(clientId: string) {
  try {
    await prisma.client.update({
      where: { id: clientId },
      data: { status: 'REPORT_ASSEMBLED' }
    });

    revalidatePath(`/client/${clientId}`);
    revalidatePath('/clinical-support');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to assemble report:', error);
    return { success: false, error: error.message };
  }
}

export async function saveTreatmentPlan(clientId: string, treatmentPlanData: any, isSubmit: boolean = false) {
  try {
    const dataToUpdate: any = { treatmentPlan: treatmentPlanData };
    if (isSubmit) {
      dataToUpdate.treatmentPlan.status = 'COMPLETED';
    }

    await prisma.client.update({
      where: { id: clientId },
      data: dataToUpdate
    });

    revalidatePath(`/client/${clientId}`);
    revalidatePath('/clinical-support');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save treatment plan:', error);
    return { success: false, error: error.message };
  }
}

export async function getGoalTemplates(type?: string) {
  try {
    const whereClause = type ? { type } : {};
    const templates = await prisma.goalTemplate.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, templates };
  } catch (error: any) {
    console.error('Failed to get goal templates:', error);
    return { success: false, error: error.message };
  }
}

export async function saveGoalTemplate(payload: any) {
  try {
    const template = await prisma.goalTemplate.create({
      data: payload
    });
    return { success: true, template };
  } catch (error: any) {
    console.error('Failed to save goal template:', error);
    return { success: false, error: error.message };
  }
}
