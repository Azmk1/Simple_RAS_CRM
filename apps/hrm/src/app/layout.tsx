import React from 'react';
import './globals.css';
import { HrmSidebar } from '@/components/layout/HrmSidebar';
import { HrmHeader } from '@/components/layout/HrmHeader';
import { HrmDevToolsUI } from '@/components/HrmDevToolsUI';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Enterprise HRM & RBT EMR Suite',
  description: 'Zero-PHI Staff Management & RBT Session EMR System',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[var(--navy-950)] text-[var(--ink-100)] min-h-screen font-sans antialiased overflow-hidden">
        <div className="flex h-screen overflow-hidden bg-transparent">
          {/* Exact CRM Match Sidebar */}
          <HrmSidebar />

          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Exact CRM Match Header Bar */}
            <HrmHeader />

            {/* Main Page Area */}
            <main className="flex-1 overflow-y-auto p-8">
              {children}
            </main>

            <Toaster position="bottom-right" theme="dark" toastOptions={{ style: { background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' } }} />
            <HrmDevToolsUI />
          </div>
        </div>
      </body>
    </html>
  );
}
