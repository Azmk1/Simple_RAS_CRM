import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

import ClientPortalView from '@/components/magic-link/ClientPortalView';

export const dynamic = 'force-dynamic';

export default async function MagicLinkPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ success?: string }> }) {
  const params = await props.params;
  
  const packet = await prisma.intakePacket.findUnique({
    where: { magicLinkToken: params.id },
    include: { client: true }
  });

  if (!packet || !packet.client) {
    notFound();
  }

  // DEVICE LOCKING LOGIC
  const headersList = await headers();
  const currentFingerprint = headersList.get('x-device-fingerprint');

  if (!currentFingerprint) {
    // If somehow middleware didn't run, fallback to soft warning or pass
    console.warn("No device fingerprint found in headers. Middleware might not be running.");
  } else {
    if (!packet.deviceFingerprint) {
      // First time clicking link, lock the device
      await prisma.intakePacket.update({
        where: { id: packet.id },
        data: { deviceFingerprint: currentFingerprint }
      });
      packet.deviceFingerprint = currentFingerprint;
    } else if (packet.deviceFingerprint !== currentFingerprint) {
      // Mismatch! Security lock.
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0c] bg-grid-pattern relative">
          <div className="max-w-md w-full bg-[#0f1115] border border-red-500/30 p-10 rounded-[2rem] shadow-[0_0_50px_rgba(255,0,0,0.15)] text-center animate-slide-up">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-heading font-black text-white text-glow mb-4">Device Locked</h1>
            <p className="text-slate-400 leading-relaxed">
              For your security and HIPAA compliance, this portal is locked to the original device that opened this link. 
              Please return to your original device, or contact the clinic to request a new secure link.
            </p>
          </div>
        </div>
      );
    }
  }

  // To keep compatibility with ContinuousIntakeForm
  const client = { ...packet.client, intakePacket: [packet] };

  // Fetch Message History
  const messages = await prisma.clientMessage.findMany({
    where: { clientId: packet.clientId },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <ClientPortalView packet={packet} client={client} messages={messages} />
  );
}
