'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { MessageCircle, X, ChevronLeft, Send, Users } from 'lucide-react';
import { getStaffMembers, getStaffMessages, sendStaffMessage } from '@/app/actions/chat';

export function GlobalStaffChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen && staff.length === 0) {
      getStaffMembers().then(setStaff);
    }
  }, [isOpen, staff.length]);

  useEffect(() => {
    if (activeChatId) {
      getStaffMessages(activeChatId).then(setMessages);
      // Basic polling for real-time feel (optional, but good for UX)
      const interval = setInterval(() => {
        getStaffMessages(activeChatId).then(setMessages);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeChatId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeChatId) return;

    const newMsg = {
      id: 'temp-' + Date.now(),
      senderId: 'me',
      receiverId: activeChatId,
      content: text,
      createdAt: new Date().toISOString(),
      isMine: true
    };
    
    setMessages(prev => [...prev, newMsg]);
    setText('');

    startTransition(async () => {
      await sendStaffMessage(activeChatId, newMsg.content);
    });
  };

  const activeStaff = staff.find(s => s.id === activeChatId);

  return (
    <>
      {/* Floating Button */}
      <button 
        suppressHydrationWarning
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center transition-all z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-110'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[350px] h-[550px] max-h-[80vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="h-16 bg-indigo-600 text-white px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {activeChatId ? (
              <button suppressHydrationWarning onClick={() => setActiveChatId(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <Users className="w-5 h-5" />
            )}
            <span className="font-bold">
              {activeStaff ? `${activeStaff.firstName} ${activeStaff.lastName}` : 'Clinic Staff Chat'}
            </span>
          </div>
          <button suppressHydrationWarning onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!activeChatId ? (
          // Staff List
          <div className="flex-1 overflow-y-auto p-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider p-2 mb-1">Direct Messages</p>
            {staff.map(s => (
              <button 
                key={s.id}
                onClick={() => setActiveChatId(s.id)}
                className="w-full text-left flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {s.firstName?.[0]}{s.lastName?.[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{s.firstName} {s.lastName}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{s.role.replace(/_/g, ' ')}</div>
                </div>
              </button>
            ))}
            {staff.length === 0 && (
              <div className="text-center text-zinc-500 text-sm mt-10">Loading staff...</div>
            )}
          </div>
        ) : (
          // Chat Interface
          <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-[#0a0a0c]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                  <p className="text-sm">Start a conversation with {activeStaff?.firstName}</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.isMine ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 text-zinc-800 dark:text-zinc-200 rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-white/10 flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 bg-zinc-100 dark:bg-zinc-950 border border-transparent dark:border-white/10 focus:border-indigo-500 rounded-full px-4 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none transition-colors"
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={isPending || !text.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        )}

      </div>
    </>
  );
}
