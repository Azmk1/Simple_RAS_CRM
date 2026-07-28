'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { requestClientChanges } from '@/app/actions/intake';
import { RefreshCw, CheckCircle } from 'lucide-react';

export function RequestAccessButton({ magicLinkToken }: { magicLinkToken: string }) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [notes, setNotes] = useState('');
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!notes.trim()) {
      alert("Please provide a brief reason for requesting access.");
      return;
    }
    
    setLoading(true);
    const res = await requestClientChanges(magicLinkToken, notes);
    setLoading(false);
    
    if (res?.success) {
      setRequested(true);
      setIsRequesting(false);
    } else {
      alert("Failed to submit request.");
    }
  };

  if (requested) {
    return (
      <div className="mt-6 bg-brand-orange-500/10 border border-brand-orange-500 rounded-xl p-4 flex flex-col items-center justify-center space-y-2">
        <CheckCircle className="text-brand-orange-500 w-6 h-6" />
        <p className="text-brand-orange-500 text-sm font-bold">Access Requested</p>
        <p className="text-slate-400 text-xs">The administration team has been notified and will unlock your packet shortly.</p>
      </div>
    );
  }

  if (isRequesting) {
    return (
      <div className="mt-8 bg-[#1a1d24] border border-white/10 rounded-xl p-4 text-left animate-in fade-in zoom-in-95">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Reason for Changes</label>
        <textarea 
          className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-brand-orange-500 outline-none min-h-[100px] resize-y mb-4"
          placeholder="I forgot to upload my child's IEP..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setIsRequesting(false)}>Cancel</Button>
          <Button variant="primary" className="flex-1 bg-brand-orange-500 hover:bg-brand-orange-600 text-black border-none" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 flex justify-center">
      <Button 
        onClick={() => setIsRequesting(true)}
        variant="secondary"
        className="text-brand-orange-500 border-brand-orange-500/50 hover:bg-brand-orange-500/10 hover:text-brand-orange-400 bg-transparent"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Need to make changes? Request Access
      </Button>
    </div>
  );
}
