'use client';

import React from 'react';
import Link from 'next/link';
import { Activity } from '@/types';
import { ProgressRing } from './ProgressRing';
import { calcProgress } from '@/utils/storage';
import { Pin, ChevronRight } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onTogglePin?: (id: string, pinned: boolean) => void;
}

export function ActivityCard({ activity, onTogglePin }: ActivityCardProps) {
  const progress = calcProgress(activity.tasks);

  return (
    <div className="relative bg-card rounded-2xl p-4 border border-border shadow-card hover:border-accent-2/30 transition-colors">
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0"
            style={{ backgroundColor: `${activity.color}20` }}
          >
            {activity.emoji || '⚡'}
          </div>
          <div>
            <h3 className="text-base font-bold text-text1 leading-tight mb-1">{activity.title}</h3>
            <span className="text-xs text-text3 font-medium block w-32 truncate">{activity.description || `${activity.tasks.length} Tasks`}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ProgressRing progress={progress} size={44} strokeWidth={4} color={activity.color} />
          
          {onTogglePin && (
            <button 
              onClick={() => onTogglePin(activity.id, !activity.pinned)}
              className={`p-2 rounded-lg transition-colors ${activity.pinned ? 'text-accent bg-accent/10' : 'text-text3 hover:text-text2 hover:bg-surface'}`}
            >
              <Pin size={16} className={activity.pinned ? 'fill-accent' : ''} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <Link 
          href={`/activities/${activity.id}`} 
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-surface border border-border hover:border-accent-2 hover:text-accent-2 text-sm font-bold text-text2 transition-colors"
        >
          Manage Activity <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
