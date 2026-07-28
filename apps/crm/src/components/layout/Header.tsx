'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, User, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { Input } from '../ui/Input';

export function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between px-[30px] border-b border-[var(--line)] bg-[rgba(8,10,18,0.55)] backdrop-blur-[18px] relative z-10">
      <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-[var(--grad-scan)] opacity-50 z-20"></div>
      
      <div className="flex-1 max-w-[440px] bg-[var(--glass)] border border-[var(--line)] rounded-[10px] px-[14px] py-[9px] text-[var(--ink-500)] text-[13px] flex items-center gap-[8px] font-mono">
        <span>🔍</span>
        <input 
          suppressHydrationWarning
          type="text" 
          placeholder="search clients, auths, action_items…" 
          className="bg-transparent border-none outline-none w-full text-[var(--ink-300)] placeholder:text-[var(--ink-500)]"
        />
      </div>
      
      <div className="flex items-center gap-[16px]">
        <NotificationBell />
        
        <div className="relative" ref={dropdownRef}>
          <div 
            className="w-[32px] h-[32px] rounded-[9px] avatar-glow flex items-center justify-center text-[11.5px] font-bold text-[var(--navy-950)] cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            JD
          </div>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--glass)] backdrop-blur-xl border border-[var(--line)] rounded-[10px] shadow-lg py-1 z-50">
              <button 
                className="w-full text-left px-4 py-2 text-[13px] text-[var(--ink-300)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-colors flex items-center gap-2"
                onClick={() => {
                  console.log('Signing out...');
                  // Implement actual sign out logic here
                }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
