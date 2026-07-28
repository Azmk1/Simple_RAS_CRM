import React, { useState, useEffect, useRef, useContext } from 'react';
import { FieldWrapper, AdminReviewContext, ReadOnlyDisplay } from './FormUIHelpers';

export function AutoSaveAddressInput({ label, fieldId, defaultValue, onBlur, required, onAddressSelect }: any) {
  const { readOnly, adminReviewMode } = useContext(AdminReviewContext);
  const [val, setVal] = useState(defaultValue || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!val || val.length < 5) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch 15 results to ensure we have enough after filtering
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&countrycodes=us&limit=15`, {
          headers: {
            'Accept-Language': 'en-US'
          }
        });
        const data = await res.json();
        const nyNjData = (data || []).filter((d: any) => {
          const state = d.address?.state;
          return state === 'New York' || state === 'New Jersey';
        });
        setSuggestions(nyNjData.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch address suggestions", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchAddresses();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [val]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: any) => {
    const { address } = suggestion;
    
    // Parse address details safely
    const street = `${address.house_number || ''} ${address.road || ''}`.trim();
    const city = address.city || address.town || address.village || address.hamlet || '';
    const state = address.state || '';
    const zip = address.postcode || '';

    const fullAddress = [street, city, state, zip].filter(Boolean).join(', ');

    // Update local value to full address
    setVal(fullAddress);
    setShowDropdown(false);

    // Pass the parsed components up
    if (onAddressSelect) {
      onAddressSelect({ street, city, state, zip });
    }
  };

  if (readOnly && !adminReviewMode) return <ReadOnlyDisplay label={label} value={val} />;
  if (adminReviewMode) return <FieldWrapper fieldId={fieldId}><ReadOnlyDisplay label={label} value={val} /></FieldWrapper>;

  const isMissing = required && !val;

  return (
    <FieldWrapper fieldId={fieldId}>
      <div className={`field relative ${isMissing ? 'missing' : ''}`} ref={dropdownRef}>
        <label>{label}</label>
        <input 
          type="text" 
          value={val}
          placeholder="Start typing an address..."
          onChange={(e) => {
            setVal(e.target.value);
            setShowDropdown(true);
          }}
          onBlur={() => {
            onBlur(fieldId, val);
            // Don't close dropdown immediately to allow clicks on suggestions
            setTimeout(() => setShowDropdown(false), 200);
          }}
          onFocus={() => setShowDropdown(true)}
          autoComplete="off"
        />
        
        {showDropdown && (suggestions.length > 0 || loading) && (
          <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-slate-400 text-sm text-center">Searching addresses...</div>
            ) : (
              <ul>
                {suggestions.map((s, idx) => (
                  <li 
                    key={s.place_id || idx}
                    className="p-3 border-b border-white/5 hover:bg-brand-blue-500/20 cursor-pointer transition-colors"
                    onClick={() => handleSelect(s)}
                  >
                    <div className="text-white text-sm font-medium">{s.address?.house_number} {s.address?.road}</div>
                    <div className="text-slate-400 text-xs mt-1">
                      {[s.address?.city || s.address?.town, s.address?.state, s.address?.postcode].filter(Boolean).join(', ')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
