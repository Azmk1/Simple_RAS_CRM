'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, ExternalLink, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/notifications';
import Link from 'next/link';

export default function NotificationBell({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    getNotifications(userId).then(res => {
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    });
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markNotificationAsRead(id).then(res => {
      if (res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(userId).then(res => {
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        suppressHydrationWarning
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50 overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-brand-orange-500/20 text-brand-orange-400 border border-brand-orange-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-brand-orange-400 hover:text-brand-orange-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                No notifications right now.
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  className={`p-4 transition-colors flex items-start gap-3 ${
                    item.isRead ? 'bg-zinc-950/40 opacity-75' : 'bg-zinc-900/40 hover:bg-zinc-900'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.type === 'ALERT' ? (
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                    ) : item.type === 'WARNING' ? (
                      <AlertTriangle className="w-4 h-4 text-brand-orange-400" />
                    ) : (
                      <Info className="w-4 h-4 text-brand-blue-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                      {!item.isRead && (
                        <button
                          onClick={(e) => handleMarkRead(item.id, e)}
                          className="text-zinc-500 hover:text-white cursor-pointer shrink-0"
                          title="Mark read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.message}</p>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <span className="text-[10px] text-zinc-500">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {item.linkUrl && (
                        <Link
                          href={item.linkUrl}
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] font-bold text-brand-orange-400 hover:text-brand-orange-300 inline-flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
