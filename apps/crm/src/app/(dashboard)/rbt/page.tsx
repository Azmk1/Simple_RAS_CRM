import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import RbtPipelineClient from '@/components/rbt/RbtPipelineClient';

export default async function RBTDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Find all ACTIVE clients assigned to this RBT
  // For testing purposes, if no user is found, we might fetch all active clients, 
  // but let's assume the user is properly authenticated.
  const activeClients = await prisma.client.findMany({
    where: { 
      status: 'ACTIVE',
      // rbtId: user?.id 
    },
    include: {
      bcba: true
    }
  });

  const returnedNotes = await prisma.noteDeficiency.findMany({
    where: {
      status: 'OPEN',
      // authorId: user?.id 
    },
    include: {
      note: {
        include: {
          session: {
            include: { client: true }
          }
        }
      },
      flaggedBy: true
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">My Schedule</h1>
          <p className="text-slate-500">Upcoming sessions and pending notes.</p>
        </div>
        <Button>Clock In</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Caseload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeClients.length}</div>
            <p className="text-xs text-slate-500 mt-1">Assigned clients</p>
          </CardContent>
        </Card>
      </div>

      <RbtPipelineClient activeClients={activeClients} returnedNotes={returnedNotes} rbtId={user?.id} />
    </div>
  );
}
