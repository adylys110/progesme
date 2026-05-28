'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: string;
}

export function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
  return (
    <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20`, color: color }}
      >
        <Icon size={24} />
      </div>
      <div>
        <span className="text-xs font-medium text-text3 block">{title}</span>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-text1 leading-none mt-1">{value}</span>
          {trend && <span className="text-[10px] text-accent-2 font-medium mb-0.5">{trend}</span>}
        </div>
      </div>
    </div>
  );
}
