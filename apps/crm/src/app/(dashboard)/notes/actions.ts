'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function convertNoteToBillable(noteId: string) {
  try {
    // Step 8b: Note Sweep Verification
    await prisma.sessionNote.update({
      where: { id: noteId },
      data: { isConverted: true } // Ready for Plutus
    })

    revalidatePath('/notes')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to convert note.' }
  }
}

export async function flagDeficiency(prevState: any, formData: FormData) {
  try {
    const noteId = String(formData.get('noteId'))
    const authorId = String(formData.get('authorId'))
    const description = String(formData.get('description'))
    const flaggedById = '00000000-0000-0000-0000-000000000000' // Mock current user ID for testing

    if (!description) return { error: 'Description required.' }

    // Create a new NoteDeficiency (routes the note back to the author)
    await prisma.noteDeficiency.create({
      data: {
        noteId,
        authorId,
        flaggedById,
        description,
        status: 'OPEN'
      }
    })

    // Remove signatures since the note needs to be corrected
    await prisma.sessionNote.update({
      where: { id: noteId },
      data: {
        rbtSigned: false,
        parentSigned: false,
        bcbaSigned: false
      }
    })

    revalidatePath('/notes')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to flag deficiency.' }
  }
}
