'use client';

import React, { useState } from 'react';

// 1. Area Chart Widget (Luminous SVG Gradient Area Chart)
export function AreaChartWidget({ 
  title, 
  subtitle, 
  data, 
  color = '#FF7A45',
  height = 180 
}: { 
  title: string; 
  subtitle?: string; 
  data: { label: string; value: number }[]; 
  color?: string;
  height?: number;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const minVal = 0;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minVal) / (maxVal - minVal)) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  const pathD = `M 0,100 L ${points} L 100,100 Z`;
  const lineD = `M ${points}`;

  return (
    <div className="p-5 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4 shadow-xl">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-bold text-white font-heading">{title}</h4>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <span>+14.2%</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id={`grad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />

          {/* Area Fill */}
          <path d={pathD} fill={`url(#grad-${title.replace(/\s+/g, '')})`} />

          {/* Main Trend Line */}
          <path d={lineD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

          {/* Interactive Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d.value - minVal) / (maxVal - minVal)) * 80 - 10;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={hoveredIdx === i ? 4 : 2.5}
                fill={color}
                stroke="#06070D"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div 
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/20 px-3 py-1.5 rounded-xl shadow-2xl text-[11px] font-mono text-white pointer-events-none flex items-center gap-2"
          >
            <span className="text-zinc-400">{data[hoveredIdx].label}:</span>
            <strong className="text-brand-orange-400">{data[hoveredIdx].value}</strong>
          </div>
        )}
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-white/5">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

// 2. Bar Chart Widget (Glowing Department Bar Chart)
export function BarChartWidget({ 
  title, 
  subtitle, 
  data 
}: { 
  title: string; 
  subtitle?: string; 
  data: { label: string; value: number; color?: string }[]; 
}) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="p-5 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4 shadow-xl">
      <div>
        <h4 className="text-sm font-bold text-white font-heading">{title}</h4>
        {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="space-y-3 pt-1">
        {data.map((d, i) => {
          const pct = Math.round((d.value / maxVal) * 100);
          const barColor = d.color || '#FF7A45';
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold">{d.label}</span>
                <span className="text-white font-bold">{d.value} ({pct}%)</span>
              </div>
              <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 3. Donut Ring Metric Widget
export function DonutChartWidget({ 
  title, 
  percentage, 
  label, 
  color = '#4FE8CE' 
}: { 
  title: string; 
  percentage: number; 
  label: string; 
  color?: string; 
}) {
  const radius = 38;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="p-5 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-between shadow-xl">
      <div className="space-y-1">
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">{title}</span>
        <p className="text-2xl font-black text-white font-mono">{percentage}%</p>
        <p className="text-xs text-zinc-400">{label}</p>
      </div>

      <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
        <svg height="80" width="80" className="transform -rotate-90">
          <circle
            stroke="rgba(255,255,255,0.08)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="40"
            cy="40"
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="40"
            cy="40"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-xs font-mono font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
}
