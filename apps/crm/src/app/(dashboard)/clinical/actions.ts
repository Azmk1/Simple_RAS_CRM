'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function submitTreatmentPlan(clientId: string) {
  try {
    // Step 4: BCBA Writes Treatment Plan
    // This triggers Step 5 by creating a PENDING Treatment Auth for the PA Coordinator
    await prisma.authorization.create({
      data: {
        clientId,
        type: 'TREATMENT',
        status: 'PENDING'
      }
    })

    revalidatePath('/clinical')
    revalidatePath('/intake')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to submit treatment plan.' }
  }
}
