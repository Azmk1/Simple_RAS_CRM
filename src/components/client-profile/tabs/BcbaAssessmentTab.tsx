'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, CheckCircle, Stethoscope, Video } from 'lucide-react';
import { scheduleAssessment } from '@/app/(dashboard)/portal-case/actions/clinical-support';

export default function BcbaAssessmentTab({ client }: { client: any }) {
  const [meetGreetDate, setMeetGreetDate] = useState('');
  const [assessmentDate, setAssessmentDate] = useState('');

  const isScheduled = ['ASSESSMENT_SCHEDULED', 'REPORT_ASSEMBLED', 'ACTIVE'].includes(client.status);

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="border-brand-orange-500/20 shadow-sm w-full relative overflow-hidden bg-zinc-950/50">
        <CardHeader className="pb-4 border-b border-white/5">
          <div>
            <CardTitle className="text-lg text-white flex items-center gap-3">
              <Stethoscope className="w-5 h-5 text-brand-orange-500" /> Assessment Scheduling
              {isScheduled && (
                <span className="text-[10px] font-bold border px-2.5 py-1 rounded-md tracking-wider uppercase bg-green-500/10 border-green-500/30 text-green-400">
                  ASSESSMENT COMPLETED
                </span>
              )}
            </CardTitle>
            <p className="text-sm text-zinc-400 mt-1">Schedule the initial Meet & Greet and the formal 97151 Evaluation.</p>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-8">
            
            {/* Step 1: Meet & Greet */}
            <div className={`bg-zinc-900 border ${isScheduled ? 'border-green-500/20' : 'border-white/10'} p-5 rounded-xl`}>
              <h3 className="text-base font-semibold text-white mb-4 flex items-center">
                <Video className="w-4 h-4 mr-2 text-zinc-400" />
                Step 1: Family Meet & Greet
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-zinc-400">Schedule a 15-30 minute intro call with the parents before the formal assessment.</p>
                <div className="flex items-center gap-4">
                  <input 
                    type="datetime-local" 
                    value={meetGreetDate}
                    onChange={e => setMeetGreetDate(e.target.value)}
                    className="bg-zinc-950 border border-white/10 rounded-md p-2 text-zinc-300 outline-none focus:border-brand-orange-500 [color-scheme:dark]" 
                  />
                  <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => {
                    alert('Zoom link generated and sent to Family Portal (Mock)');
                  }}>
                    Generate Virtual Meeting Link
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 2: Formal Assessment */}
            <div className={`bg-zinc-900 border ${isScheduled ? 'border-green-500/20' : 'border-white/10'} p-5 rounded-xl`}>
              <h3 className="text-base font-semibold text-white mb-4 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-zinc-400" />
                Step 2: Formal 97151 Assessment
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-zinc-400">Schedule the in-person functional behavior assessment.</p>
                
                {!isScheduled && (
                  <div className="flex items-center gap-4">
                    <input 
                      type="datetime-local" 
                      value={assessmentDate}
                      onChange={e => setAssessmentDate(e.target.value)}
                      className="bg-zinc-950 border border-white/10 rounded-md p-2 text-zinc-300 outline-none focus:border-brand-orange-500 [color-scheme:dark]" 
                    />
                    <form action={async () => {
                      await scheduleAssessment(client.id, new Date(assessmentDate));
                    }}>
                      <Button type="submit" variant="primary" className="bg-brand-orange-600 hover:bg-brand-orange-700 text-white" disabled={!assessmentDate}>
                        Mark Assessment Complete
                      </Button>
                    </form>
                  </div>
                )}

                {isScheduled && (
                  <div className="pt-2">
                    <div className="flex items-center text-green-400 text-sm font-medium bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                      <CheckCircle className="w-4 h-4 mr-2" /> Assessment phase completed. You can now write the Treatment Plan.
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
