'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function assignStaff(prevState: any, formData: FormData) {
  try {
    const clientId = String(formData.get('clientId'))
    const rbtId = String(formData.get('rbtId'))
    const bcbaId = String(formData.get('bcbaId'))

    if (!clientId || !rbtId || !bcbaId) {
      return { error: 'Both RBT and BCBA must be assigned.' }
    }

    await prisma.client.update({
      where: { id: clientId },
      data: {
        rbtId,
        bcbaId
      }
    })

    revalidatePath('/case')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to assign staff.' }
  }
}

export async function activateClient(clientId: string) {
  try {
    await prisma.client.update({
      where: { id: clientId },
      data: { status: 'ACTIVE' }
    })
    
    revalidatePath('/case')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to activate client.' }
  }
}

export async function collectSignature(noteId: string, signerType: 'PARENT' | 'BCBA') {
  try {
    const dataToUpdate = signerType === 'PARENT' ? { parentSigned: true } : { bcbaSigned: true }

    await prisma.sessionNote.update({
      where: { id: noteId },
      data: dataToUpdate
    })

    revalidatePath('/case')
    revalidatePath('/notes')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to collect signature.' }
  }
}
