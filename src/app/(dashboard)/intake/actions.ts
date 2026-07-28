'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createInquiry(prevState: any, formData: FormData) {
  try {
    const firstName = String(formData.get('firstName'))
    const lastName = String(formData.get('lastName'))
    const guardianName = String(formData.get('guardianName') || '')
    const guardianEmail = String(formData.get('guardianEmail') || '')
    const guardianPhone = String(formData.get('guardianPhone') || '')

    if (!firstName || !lastName) {
      return { error: 'First and Last name are required.' }
    }

    await prisma.client.create({
      data: {
        firstName,
        lastName,
        guardianName,
        guardianEmail,
        guardianPhone,
        status: 'INQUIRY'
      }
    })

    revalidatePath('/intake')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to create inquiry.' }
  }
}

export async function verifyDocuments(clientId: string) {
  try {
    // Represents Step 2: "Cross-check File: Names, DOB, Diagnosis Match Across Documents"
    // Move client to AUTH_INITIATED status
    await prisma.client.update({
      where: { id: clientId },
      data: { status: 'AUTH_INITIATED' }
    })
    
    revalidatePath('/intake')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to verify documents.' }
  }
}

export async function approveAssessmentAuth(prevState: any, formData: FormData) {
  try {
    const clientId = String(formData.get('clientId'))
    const authNumber = String(formData.get('authNumber'))
    const unitsStr = String(formData.get('unitsApproved'))
    const unitsApproved = parseInt(unitsStr, 10) || 0
    const startDateStr = String(formData.get('startDate'))
    const endDateStr = String(formData.get('endDate'))

    if (!clientId || !authNumber || !startDateStr || !endDateStr) {
      return { error: 'Missing required authorization fields.' }
    }

    // Step 3: Record Auth #: Approved Units, Effective Date & Expiration Date
    await prisma.$transaction([
      prisma.authorization.create({
        data: {
          clientId,
          type: 'ASSESSMENT',
          status: 'APPROVED',
          authNumber,
          startDate: new Date(startDateStr),
          endDate: new Date(endDateStr),
          unitsApproved,
          cptCodes: {
            create: [
              { code: '97151', unitsApproved }
            ]
          }
        }
      }),
      // Move Client to next stage
      prisma.client.update({
        where: { id: clientId },
        data: { status: 'AUTHORIZED' } 
      })
    ])

    revalidatePath('/intake')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to approve authorization.' }
  }
}

export async function approveTreatmentAuth(prevState: any, formData: FormData) {
  try {
    const authId = String(formData.get('authId'))
    const authNumber = String(formData.get('authNumber'))
    const unitsStr = String(formData.get('unitsApproved'))
    const unitsApproved = parseInt(unitsStr, 10) || 0
    const startDateStr = String(formData.get('startDate'))
    const endDateStr = String(formData.get('endDate'))

    if (!authId || !authNumber || !startDateStr || !endDateStr) {
      return { error: 'Missing required authorization fields.' }
    }

    // Step 5: Approve Treatment PA
    await prisma.authorization.update({
      where: { id: authId },
      data: {
        status: 'APPROVED',
        authNumber,
        startDate: new Date(startDateStr),
        endDate: new Date(endDateStr),
        unitsApproved,
        cptCodes: {
          create: [
            { code: '97153', unitsApproved },
            { code: '97155', unitsApproved }
          ]
        }
      }
    })

    revalidatePath('/intake')
    revalidatePath('/case')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to approve treatment authorization.' }
  }
}
