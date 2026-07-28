'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, CheckCircle, Package } from 'lucide-react';
import { scheduleAssessment } from '@/app/(dashboard)/portal-case/actions/clinical-support';

export default function AssessmentPrepTab({ client }: { client: any }) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [materialsChecked, setMaterialsChecked] = useState(false);

  const isScheduled = ['ASSESSMENT_SCHEDULED', 'REPORT_ASSEMBLED', 'ACTIVE'].includes(client.status);

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="border-brand-orange-500/20 shadow-sm w-full relative overflow-hidden bg-zinc-950/50">
        <CardHeader className="pb-4 border-b border-white/5">
          <div>
            <CardTitle className="text-lg text-white flex items-center gap-3">
              <Calendar className="w-5 h-5 text-brand-orange-500" /> Assessment Scheduling & Prep
              {isScheduled && (
                <span className="text-[10px] font-bold border px-2.5 py-1 rounded-md tracking-wider uppercase bg-green-500/10 border-green-500/30 text-green-400">
                  SCHEDULED
                </span>
              )}
            </CardTitle>
            <p className="text-sm text-zinc-400 mt-1">Coordinate with the BCBA and Family to schedule the assessment.</p>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-6">
            
            <div className={`bg-zinc-900 border ${isScheduled ? 'border-green-500/20' : 'border-white/10'} p-5 rounded-xl`}>
              <h3 className="text-base font-semibold text-white mb-4 flex items-center">
                <Package className="w-4 h-4 mr-2 text-zinc-400" />
                Assessment Logistics
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-brand-orange-500 focus:ring-brand-orange-500 focus:ring-offset-zinc-900" 
                    checked={materialsChecked || isScheduled}
                    onChange={(e) => setMaterialsChecked(e.target.checked)}
                    disabled={isScheduled}
                  />
                  <div>
                    <p className={`text-sm font-medium ${materialsChecked || isScheduled ? 'text-zinc-300' : 'text-zinc-400'} group-hover:text-white transition-colors`}>
                      Materials & Forms Prepared
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">Assembled the required materials and assessment forms per BCBA request.</p>
                  </div>
                </label>

                {!isScheduled && (
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <label className="text-xs font-semibold text-zinc-400 uppercase">Assessment Date & Time</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="datetime-local" 
                        value={scheduledDate}
                        onChange={e => setScheduledDate(e.target.value)}
                        className="bg-zinc-950 border border-white/10 rounded-md p-2 text-zinc-300 outline-none focus:border-brand-orange-500 [color-scheme:dark]" 
                      />
                      <form action={async () => {
                        await scheduleAssessment(client.id, new Date(scheduledDate));
                      }}>
                        <Button type="submit" variant="primary" className="bg-brand-orange-600 hover:bg-brand-orange-700 text-white" disabled={!materialsChecked || !scheduledDate}>
                          Confirm & Schedule
                        </Button>
                      </form>
                    </div>
                  </div>
                )}
                
                {isScheduled && (
                  <div className="pt-2">
                    <div className="flex items-center text-green-400 text-sm font-medium bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                      <CheckCircle className="w-4 h-4 mr-2" /> Assessment Scheduled. Waiting for BCBA to complete evaluation.
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
