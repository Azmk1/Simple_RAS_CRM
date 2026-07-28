'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function submitMagicLinkPacket(formData: FormData) {
  const clientId = String(formData.get('clientId'))

  // For prototype purposes, hitting submit simply checks off all required items.
  await prisma.intakePacket.updateMany({
    where: { clientId: clientId },
    data: {
      status: 'SUBMITTED',
      intakeFormComplete: true,
      consentFormComplete: true,
      insuranceCardFrontUploaded: true,
      insuranceCardBackUploaded: true,
      medicaidCardFrontUploaded: true,
      medicaidCardBackUploaded: true,
      diagnosticEvalUploaded: true,
      physicianRxUploaded: true,
      iepUploaded: true,
      custodyDocsUploaded: true,
      priorAbaRecordsUploaded: true
    }
  })

  await prisma.client.update({
    where: { id: clientId },
    data: { status: 'DOCS_SUBMITTED' }
  })

  const packet = await prisma.intakePacket.findUnique({
    where: { clientId }
  })

  // Redirect them to a success state page
  if (packet?.magicLinkToken) {
    redirect(`/magic-link/${packet.magicLinkToken}?success=true`)
  }
}
