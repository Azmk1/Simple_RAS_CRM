'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  
  return (
    <button 
      onClick={() => router.back()}
      className="inline-flex items-center text-sm font-medium text-brand-orange-400 hover:text-brand-blue-400 transition-colors mb-4 group"
    >
      <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
      Back to Portal
    </button>
  );
}
