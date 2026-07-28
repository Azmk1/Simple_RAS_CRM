import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { TreatmentPlanPDF } from '@/lib/pdf/TreatmentPlanPDF';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return new NextResponse('Client not found', { status: 404 });
    }

    const treatmentPlan = client.treatmentPlan && typeof client.treatmentPlan === 'object' 
      ? client.treatmentPlan 
      : {};

    const pdfStream = await renderToStream(<TreatmentPlanPDF client={client} treatmentPlan={treatmentPlan} />);

    // Convert stream to standard Web Response ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        pdfStream.on('data', (chunk) => controller.enqueue(chunk));
        pdfStream.on('end', () => controller.close());
        pdfStream.on('error', (err) => controller.error(err));
      }
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Treatment_Plan_${client.lastName}.pdf"`
      }
    });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
