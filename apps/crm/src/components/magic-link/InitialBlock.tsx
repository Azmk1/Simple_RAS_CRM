import React, { useState, useContext } from 'react';
import { PenTool, CheckCircle } from 'lucide-react';
import { FieldWrapper, AdminReviewContext, ReadOnlyDisplay } from './FormUIHelpers';

export function InitialBlock({ label, fieldId, description, required, currentValue, onChange, globalInitials }: any) {
  const { readOnly, adminReviewMode } = useContext(AdminReviewContext);
  const isAgreed = !!currentValue;
  const timestamp = isAgreed ? new Date(currentValue.timestamp).toLocaleString() : null;
  const initial = isAgreed ? currentValue.initials : null;

  const handleTap = () => {
    if (isAgreed) {
      // Toggle off
      onChange(fieldId, null);
    } else {
      if (!globalInitials) {
        alert("Please enter your initials at the top of this form before agreeing to sections.");
        return;
      }
      onChange(fieldId, {
        initials: globalInitials,
        timestamp: new Date().toISOString()
      });
    }
  };

  if (readOnly && !adminReviewMode) {
    const displayVal = isAgreed ? `Initialed: ${initial} (${timestamp})` : 'Not initialed';
    return <ReadOnlyDisplay label={label} value={displayVal} />;
  }

  const isMissing = required && !isAgreed;

  return (
    <FieldWrapper fieldId={fieldId}>
      <div className={`consent-item ${isAgreed ? 'signed' : ''} ${isMissing ? 'missing' : ''}`}>
        <div className="consent-text">
          <div className="consent-title">
            {label} 
            {required && <span className="req-badge">REQUIRED</span>}
          </div>
          {description && <div className="consent-desc">{description}</div>}
        </div>
        
        <button 
          onClick={handleTap}
          className={`initial-btn ${isAgreed ? 'signed' : ''}`}
        >
          {isAgreed ? (
            `✓ ${initial}`
          ) : (
            'TAP TO INITIAL'
          )}
        </button>
      </div>
    </FieldWrapper>
  );
}
