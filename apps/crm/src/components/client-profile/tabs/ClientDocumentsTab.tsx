'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, DownloadCloud, ClipboardList } from 'lucide-react';

export default function ClientDocumentsTab({ client }: { client: any }) {
  const packet = client.intakePacket;
  
  if (!packet) {
    return (
      <div className="text-zinc-500 py-10 text-center">
        No documents available for this client yet.
      </div>
    );
  }

  let parsedFormData: any = {};
  if (packet.formData) {
    try {
      let parsed = typeof packet.formData === 'string' ? JSON.parse(packet.formData) : packet.formData;
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      parsedFormData = parsed || {};
    } catch (e) {}
  }

  const documentFields = [
    { key: 'docInsuranceFront', label: 'Insurance Card (Front)' },
    { key: 'docInsuranceBack', label: 'Insurance Card (Back)' },
    { key: 'docMedicaidFront', label: 'Medicaid Card (Front)' },
    { key: 'docMedicaidBack', label: 'Medicaid Card (Back)' },
    { key: 'docEval', label: 'Diagnostic Evaluation' },
    { key: 'docReferral', label: 'Physician Referral' },
    { key: 'docIEP', label: 'IEP Document' },
    { key: 'docCustody', label: 'Custody Documents' },
    { key: 'docPriorABA', label: 'Prior ABA Records' },
  ];

  const availableDocs = documentFields.filter(doc => !!parsedFormData[doc.key]?.url);

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-950 border border-white/5">
        <CardHeader className="border-b border-white/5 pb-4 bg-zinc-900/50">
          <CardTitle className="text-lg text-white flex items-center">
            <FileText className="w-5 h-5 text-brand-blue-500 mr-2" />
            Client Clinical Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {availableDocs.length === 0 ? (
            <p className="text-zinc-500 text-sm">No clinical documents have been uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableDocs.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <div className="flex items-center text-zinc-300 font-medium">
                    <FileText className="w-4 h-4 mr-3 text-zinc-500" />
                    {doc.label}
                  </div>
                  <a 
                    href={parsedFormData[doc.key].url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs bg-brand-blue-500 hover:bg-brand-blue-600 text-white px-3 py-1.5 rounded-md shadow-sm transition-colors"
                  >
                    <DownloadCloud className="w-3.5 h-3.5 mr-1.5" /> View / Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border border-white/5">
        <CardHeader className="border-b border-white/5 pb-4 bg-zinc-900/50">
          <CardTitle className="text-lg text-white flex items-center">
            <ClipboardList className="w-5 h-5 text-brand-blue-500 mr-2" />
            Intake Form (Form 01) Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {Object.entries(parsedFormData)
              .filter(([key]) => !key.startsWith('doc') && !key.toLowerCase().includes('signature') && !key.toLowerCase().includes('consent'))
              .map(([key, value]) => {
                // formatting the camelCase key to readable text
                const formattedKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase());
                
                return (
                  <div key={key} className="border-b border-white/5 pb-3">
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">{formattedKey}</label>
                    <div className="text-sm text-zinc-300 font-medium">
                      {typeof value === 'boolean' 
                        ? (value ? 'Yes' : 'No') 
                        : (value ? String(value) : <span className="text-zinc-600 italic">Not Provided</span>)}
                    </div>
                  </div>
                );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
