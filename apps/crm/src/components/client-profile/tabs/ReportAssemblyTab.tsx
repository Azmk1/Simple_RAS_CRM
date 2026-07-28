'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, CheckCircle, Upload } from 'lucide-react';
import { assembleReport } from '@/app/(dashboard)/portal-case/actions/clinical-support';

export default function ReportAssemblyTab({ client }: { client: any }) {
  const [dataChecked, setDataChecked] = useState(false);
  const [formatChecked, setFormatChecked] = useState(false);

  const isAssembled = ['REPORT_ASSEMBLED', 'ACTIVE'].includes(client.status);
  const plan = client.treatmentPlan && typeof client.treatmentPlan === 'object' ? client.treatmentPlan : {};
  const hasSignature = !!plan.parentSignature;

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="border-purple-500/20 shadow-sm w-full relative overflow-hidden bg-zinc-950/50">
        <CardHeader className="pb-4 border-b border-white/5">
          <div>
            <CardTitle className="text-lg text-white flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-500" /> Report Assembly
              {isAssembled && (
                <span className="text-[10px] font-bold border px-2.5 py-1 rounded-md tracking-wider uppercase bg-green-500/10 border-green-500/30 text-green-400">
                  ASSEMBLED & ROUTED
                </span>
              )}
            </CardTitle>
            <p className="text-sm text-zinc-400 mt-1">Organize the BCBA's findings into the final report packet.</p>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-6">
            
            <div className={`bg-zinc-900 border ${isAssembled ? 'border-green-500/20' : 'border-white/10'} p-5 rounded-xl`}>
              <h3 className="text-base font-semibold text-white mb-4 flex items-center">
                <Upload className="w-4 h-4 mr-2 text-zinc-400" />
                Assemble Report Packet
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-zinc-900" 
                    checked={dataChecked || isAssembled}
                    onChange={(e) => setDataChecked(e.target.checked)}
                    disabled={isAssembled}
                  />
                  <div>
                    <p className={`text-sm font-medium ${dataChecked || isAssembled ? 'text-zinc-300' : 'text-zinc-400'} group-hover:text-white transition-colors`}>
                      Assessment Data Organized
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">Entered/organized the data provided by the BCBA (without altering clinical content).</p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-zinc-900" 
                    checked={formatChecked || isAssembled}
                    onChange={(e) => setFormatChecked(e.target.checked)}
                    disabled={isAssembled}
                  />
                  <div>
                    <p className={`text-sm font-medium ${formatChecked || isAssembled ? 'text-zinc-300' : 'text-zinc-400'} group-hover:text-white transition-colors`}>
                      Packet Formatted & Uploaded
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">Assembled the evaluation, data, and supporting docs into the final PDF.</p>
                  </div>
                </label>

                {!isAssembled && !hasSignature && (
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center text-amber-400 text-sm font-medium bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                      Waiting for Parent Signature on the Treatment Plan before assembly can begin.
                    </div>
                  </div>
                )}

                {!isAssembled && hasSignature && (
                  <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <a href={`/api/generate-report/${client.id}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" type="button" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                          <FileText className="w-4 h-4 mr-2" /> Generate & Preview PDF
                        </Button>
                      </a>
                      <p className="text-xs text-zinc-500">
                        Automatically generates the final packet with signatures.
                      </p>
                    </div>

                    <form action={async () => {
                      await assembleReport(client.id);
                    }}>
                      <Button type="submit" variant="primary" className="bg-purple-600 hover:bg-purple-700 text-white w-full max-w-[200px]" disabled={!dataChecked || !formatChecked}>
                        Route to Billing
                      </Button>
                    </form>
                  </div>
                )}
                
                {isAssembled && (
                  <div className="pt-2">
                    <div className="flex items-center text-green-400 text-sm font-medium bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                      <CheckCircle className="w-4 h-4 mr-2" /> Report Assembled. Routed to Billing for Treatment PA.
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
