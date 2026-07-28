'use client';

import React, { useState, useTransition } from 'react';
import { Calendar, Clock, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { saveClientSchedule } from '@/app/actions/intake';

function formatTimeDisplay(time24: string) {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mStr} ${period}`;
}

function TimePickerWizard({ 
  label,
  onChange,
  onClose
}: { 
  label: string,
  onChange: (val: string) => void,
  onClose: () => void
}) {
  const [step, setStep] = useState<'hour'|'minute'|'period'>('hour');
  const [temp, setTemp] = useState({ h: '', m: '', p: '' });

  const handleSelect = (val: string) => {
    if (step === 'hour') { setTemp(p => ({ ...p, h: val })); setStep('minute'); }
    else if (step === 'minute') { setTemp(p => ({ ...p, m: val })); setStep('period'); }
    else if (step === 'period') { 
      const pStr = val;
      let h = parseInt(temp.h, 10);
      if (pStr === 'PM' && h !== 12) h += 12;
      if (pStr === 'AM' && h === 12) h = 0;
      onChange(`${h.toString().padStart(2, '0')}:${temp.m}`);
      onClose();
    }
  };

  const getGrid = () => {
    if (step === 'hour') return [1,2,3,4,5,6,7,8,9,10,11,12].map(String);
    if (step === 'minute') return ['00', '15', '30', '45'];
    if (step === 'period') return ['AM', 'PM'];
    return [];
  };

  return (
    <div className="absolute top-full left-0 mt-2 z-50 bg-[#0f1115] border border-brand-blue-500/50 rounded-xl shadow-2xl p-4 w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          {label}
          <span className="text-xs font-normal text-brand-blue-400 bg-brand-blue-500/10 px-2 py-0.5 rounded">
            {step}
          </span>
        </h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {getGrid().map(item => (
          <button
            key={item}
            onClick={() => handleSelect(item)}
            className="bg-zinc-900 border border-white/5 hover:border-brand-blue-500 hover:bg-brand-blue-500/10 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ClientScheduleBuilder({ client, paRequests }: { client: any, paRequests: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);
  
  const treatmentPa = paRequests?.find((p: any) => p.type === 'TREATMENT');
  
  // Try to use approvedUnits from PA (1 hour = 4 units per user request)
  // Fallback to treatmentPlan.hours97153 if missing
  const totalApprovedHours = treatmentPa?.approvedUnits 
    ? Math.floor(treatmentPa.approvedUnits / 4) 
    : (client.treatmentPlan?.hours97153 || 0);
  
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];


  let existingSchedule = null;
  try {
    const tp = typeof client?.treatmentPlan === 'string' ? JSON.parse(client.treatmentPlan) : client?.treatmentPlan;
    existingSchedule = tp?.preferredSchedule;
  } catch (e) {}

  const [schedule, setSchedule] = useState<Record<string, { start: string, end: string } | null>>(
    existingSchedule || {
      Monday: null,
      Tuesday: null,
      Wednesday: null,
      Thursday: null,
      Friday: null
    }
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [preferences, setPreferences] = useState({ gender: '', race: '', age: '', language: '', notes: '' });

  React.useEffect(() => {
    let freshSchedule = null;
    let freshPrefs = null;
    try {
      const tp = typeof client?.treatmentPlan === 'string' ? JSON.parse(client.treatmentPlan) : client?.treatmentPlan;
      freshSchedule = tp?.preferredSchedule;
      freshPrefs = tp?.staffingPreferences;
    } catch (e) {}

    if (freshSchedule) {
      setSchedule(freshSchedule);
    }
    if (freshPrefs) {
      setPreferences(freshPrefs);
    }
  }, [client?.treatmentPlan]);

  const [activeWizard, setActiveWizard] = useState<{ day: string, type: 'start'|'end' } | null>(null);

  const calculateTotalScheduledHours = () => {
    let totalMinutes = 0;
    
    Object.values(schedule).forEach(day => {
      if (!day) return;
      if (!day.start || !day.end) return;
      const parseTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const startMinutes = parseTime(day.start);
      const endMinutes = parseTime(day.end);
      if (endMinutes > startMinutes) {
        totalMinutes += (endMinutes - startMinutes);
      }
    });
    
    return totalMinutes / 60;
  };

  const handleTimeChange = (day: string, field: 'start'|'end', val: string) => {
    setSchedule(prev => {
      const existing = prev[day] || { start: '09:00', end: '11:00' };
      return { ...prev, [day]: { ...existing, [field]: val } };
    });
  };

  const getLogicalErrors = () => {
    const errors: Record<string, string> = {};
    const parse = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    Object.entries(schedule).forEach(([day, val]) => {
      if (val && val.start && val.end) {
        if (parse(val.end) <= parse(val.start)) {
          errors[day] = "End time must be after start time.";
        }
      }
    });
    return errors;
  };

  const logicalErrors = getLogicalErrors();
  const hasLogicalErrors = Object.keys(logicalErrors).length > 0;

  const currentScheduledHours = calculateTotalScheduledHours();
  const minRequiredHours = totalApprovedHours * 0.8;
  const isOverLimit = currentScheduledHours > totalApprovedHours;
  const isUnderLimit = currentScheduledHours < minRequiredHours;
  const isComplete = currentScheduledHours > 0 && !isOverLimit && !isUnderLimit && !hasLogicalErrors;

  const isPreferencesComplete = !!(preferences.gender && preferences.race && preferences.age && preferences.language);

  const handleSave = () => {
    startTransition(async () => {
      await saveClientSchedule(client.id, schedule, preferences);
      setIsSaved(true);
      setStep(1);
    });
  };

  if (isSaved) {
    return (
      <div className="bg-[#0f1115] border border-green-500/30 p-8 rounded-2xl text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Schedule Preferences Saved!</h2>
        <p className="text-zinc-400 mb-6">Our operations team will use this to assign your BCBA and RBT.</p>
        <button 
          onClick={() => setIsSaved(false)}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          Edit Schedule
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1115] border border-brand-blue-500/30 p-6 rounded-2xl shadow-[0_0_50px_rgba(0,200,255,0.1)]">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-brand-blue-500/20 rounded-lg">
          <Calendar className="w-6 h-6 text-brand-blue-400" />
        </div>
        <h2 className="text-xl font-bold">Build Your Weekly Schedule</h2>
      </div>
      
      <p className="text-sm text-zinc-400 mb-6">
        Your authorization for <strong>{totalApprovedHours} hours/week</strong> has been approved. 
        Please select your preferred times for in-home therapy. We require scheduling at least 80% ({minRequiredHours} hours) of your authorized time to ensure optimal clinical outcomes.
      </p>

      {/* Progress Bar */}
      <div className="bg-zinc-950 rounded-xl p-4 border border-white/5 mb-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Scheduled vs Approved</div>
            <div className={`text-2xl font-bold ${isOverLimit ? 'text-red-500' : (isUnderLimit ? 'text-amber-500' : 'text-green-500')}`}>
              {currentScheduledHours.toFixed(2)} <span className="text-sm text-zinc-500 font-normal">/ {totalApprovedHours} hours</span>
            </div>
          </div>
          <div className="text-right">
            {isOverLimit ? (
              <span className="text-xs text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded">Over Limit</span>
            ) : isUnderLimit ? (
              <span className="text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded">Min {minRequiredHours} hrs required</span>
            ) : (
              <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">Ready to Submit!</span>
            )}
          </div>
        </div>
        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden relative">
          {/* Minimum Marker Line */}
          <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-zinc-600 z-10" />
          <div 
            className={`h-full transition-all duration-300 relative z-0 ${isOverLimit ? 'bg-red-500' : (isUnderLimit ? 'bg-amber-500' : 'bg-green-500')}`}
            style={{ width: `${Math.min(100, (currentScheduledHours / totalApprovedHours) * 100)}%` }}
          />
        </div>
      </div>

      {/* Days Grid */}
      <div className="space-y-3">
        {DAYS.map(day => {
          const isSelected = schedule[day] !== null;
          const errorMsg = logicalErrors[day];

          return (
            <div key={day} className="flex flex-col">
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors gap-4 ${isSelected ? (errorMsg ? 'bg-red-500/10 border-red-500/50' : 'bg-zinc-900/80 border-brand-blue-500/30') : 'bg-zinc-950 border-white/5'}`}>
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSchedule(prev => ({ ...prev, [day]: { start: '09:00', end: '11:00' } }));
                      } else {
                        setSchedule(prev => ({ ...prev, [day]: null }));
                      }
                    }}
                    className="w-5 h-5 rounded border-zinc-700 text-brand-blue-500 focus:ring-brand-blue-500 bg-zinc-900 cursor-pointer"
                  />
                  <span className={`font-semibold ${isSelected ? (errorMsg ? 'text-red-400' : 'text-white') : 'text-zinc-500'}`}>{day}</span>
                </div>
                
                {isSelected && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Start Time Picker */}
                    <div className="relative">
                      <button 
                        onClick={() => setActiveWizard(activeWizard?.day === day && activeWizard?.type === 'start' ? null : { day, type: 'start' })}
                        className={`flex items-center gap-2 bg-zinc-950 border hover:bg-white/5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${activeWizard?.day === day && activeWizard?.type === 'start' ? 'border-brand-blue-500' : 'border-white/10'}`}
                      >
                        <Clock className="w-4 h-4 text-brand-blue-400" />
                        <span className="text-white text-sm font-medium">
                          {formatTimeDisplay(schedule[day]?.start || '09:00')}
                        </span>
                      </button>

                      {activeWizard?.day === day && activeWizard?.type === 'start' && (
                        <TimePickerWizard 
                          label="Start Time"
                          onChange={(val) => handleTimeChange(day, 'start', val)}
                          onClose={() => setActiveWizard(null)}
                        />
                      )}
                    </div>

                    <span className="text-zinc-600 font-medium">to</span>

                    {/* End Time Picker */}
                    <div className="relative">
                      <button 
                        onClick={() => setActiveWizard(activeWizard?.day === day && activeWizard?.type === 'end' ? null : { day, type: 'end' })}
                        className={`flex items-center gap-2 bg-zinc-950 border hover:bg-white/5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${activeWizard?.day === day && activeWizard?.type === 'end' ? 'border-brand-blue-500' : 'border-white/10'}`}
                      >
                        <Clock className="w-4 h-4 text-brand-blue-400" />
                        <span className="text-white text-sm font-medium">
                          {formatTimeDisplay(schedule[day]?.end || '11:00')}
                        </span>
                      </button>

                      {activeWizard?.day === day && activeWizard?.type === 'end' && (
                        <TimePickerWizard 
                          label="End Time"
                          onChange={(val) => handleTimeChange(day, 'end', val)}
                          onClose={() => setActiveWizard(null)}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Logical Error Message */}
              {isSelected && errorMsg && (
                <div className="mt-1 ml-4 text-xs text-red-500 font-medium flex items-center gap-1">
                  <span>⚠️</span> {errorMsg} Adjust the start or end time to fix.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {step === 1 ? (
        <button
          onClick={() => setStep(2)}
          disabled={!isComplete}
          className={`w-full mt-6 font-bold py-4 rounded-xl transition-all duration-300 ${
            isComplete
              ? 'bg-brand-blue-500 hover:bg-brand-blue-400 text-white shadow-[0_0_20px_rgba(0,150,255,0.4)] cursor-pointer'
              : 'bg-zinc-900 text-zinc-500 cursor-not-allowed border border-white/5'
          }`}
        >
          Next: Staffing Preferences <ChevronRight className="inline w-5 h-5 ml-1" />
        </button>
      ) : (
        <div className="mt-8 pt-8 border-t border-white/5 animate-slide-up">
          <h2 className="text-xl font-bold mb-2">Staffing Preferences</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Please let us know your preferences so we can find the best match for your child. All fields except Notes are required.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Preferred Gender</label>
                <select 
                  value={preferences.gender} 
                  onChange={e => setPreferences({...preferences, gender: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:border-brand-blue-500 outline-none"
                >
                  <option value="">Select gender...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="No Preference">No Preference</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Preferred Race/Ethnicity</label>
                <select 
                  value={preferences.race} 
                  onChange={e => setPreferences({...preferences, race: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:border-brand-blue-500 outline-none"
                >
                  <option value="">Select race/ethnicity...</option>
                  <option value="Asian">Asian</option>
                  <option value="Black/African American">Black/African American</option>
                  <option value="Hispanic/Latino">Hispanic/Latino</option>
                  <option value="White">White</option>
                  <option value="Other">Other</option>
                  <option value="No Preference">No Preference</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Preferred Age Range</label>
                <select 
                  value={preferences.age} 
                  onChange={e => setPreferences({...preferences, age: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:border-brand-blue-500 outline-none"
                >
                  <option value="">Select age range...</option>
                  <option value="20s">20s</option>
                  <option value="30s">30s</option>
                  <option value="40s+">40s+</option>
                  <option value="No Preference">No Preference</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Preferred Language</label>
                <select 
                  value={preferences.language} 
                  onChange={e => setPreferences({...preferences, language: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:border-brand-blue-500 outline-none"
                >
                  <option value="">Select language...</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Other">Other</option>
                  <option value="No Preference">No Preference</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Additional Notes (Optional)</label>
              <textarea 
                value={preferences.notes} 
                onChange={e => setPreferences({...preferences, notes: e.target.value})}
                placeholder="Any other specific requests or context for our clinical team..."
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:border-brand-blue-500 outline-none min-h-[100px] resize-y"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-4 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors cursor-pointer border border-white/5"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={!isPreferencesComplete || isPending}
              className={`flex-1 font-bold py-4 rounded-xl transition-all duration-300 ${
                isPreferencesComplete && !isPending
                  ? 'bg-brand-blue-500 hover:bg-brand-blue-400 text-white shadow-[0_0_20px_rgba(0,150,255,0.4)] cursor-pointer'
                  : 'bg-zinc-900 text-zinc-500 cursor-not-allowed border border-white/5'
              }`}
            >
              {isPending ? 'Saving...' : 'Submit Staffing Package'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
