'use client';

import React, { useState } from 'react';
import BillingPaQueue from './BillingPaQueue';
import TreatmentPaQueue from './TreatmentPaQueue';

export default function BillingQueueTabs({ assessmentClients, treatmentClients }: { assessmentClients: any[], treatmentClients: any[] }) {
  const [activeTab, setActiveTab] = useState<'assessment' | 'treatment'>('assessment');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('assessment')}
          className={`pb-4 -mb-4 px-2 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'assessment' ? 'border-brand-gold-500 text-brand-gold-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Assessment PAs (97151)
        </button>
        <button
          onClick={() => setActiveTab('treatment')}
          className={`pb-4 -mb-4 px-2 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'treatment' ? 'border-brand-gold-500 text-brand-gold-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Treatment PAs (97153, 97155, 97156)
        </button>
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-300">
        {activeTab === 'assessment' ? (
          <BillingPaQueue clients={assessmentClients} />
        ) : (
          <TreatmentPaQueue clients={treatmentClients} />
        )}
      </div>
    </div>
  );
}
