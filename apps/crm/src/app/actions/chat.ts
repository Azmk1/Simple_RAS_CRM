'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Mock logged in user for now (since we don't have auth implemented in the CRM yet)
const CURRENT_USER_ID = "00000000-0000-0000-0000-000000000001"; // We'll just pretend this exists or fetch the first user

async function getMe() {
  const user = await prisma.user.findFirst();
  return user?.id || CURRENT_USER_ID;
}

export async function getStaffMembers() {
  const me = await getMe();
  const users = await prisma.user.findMany({
    where: { isActive: true, NOT: { id: me } },
    select: { id: true, firstName: true, lastName: true, role: true }
  });
  return users;
}

export async function getStaffMessages(receiverId: string) {
  const me = await getMe();
  
  const messages = await prisma.staffMessage.findMany({
    where: {
      OR: [
        { senderId: me, receiverId },
        { senderId: receiverId, receiverId: me }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
  
  return messages.map(m => ({
    ...m,
    isMine: m.senderId === me
  }));
}

export async function sendStaffMessage(receiverId: string, content: string) {
  const me = await getMe();
  
  await prisma.staffMessage.create({
    data: {
      senderId: me,
      receiverId,
      content
    }
  });
  
  // Hard to know exactly which path to revalidate since it's global, 
  // but we can just return success and let the client optimistically append
  return { success: true };
}
