'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import { ProgressRing } from './ProgressRing';
import { calcProgress } from '@/utils/storage';
import { Pin, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onTogglePin?: (id: string, pinned: boolean) => void;
}

export function ProjectCard({ project, onTogglePin }: ProjectCardProps) {
  const progress = calcProgress(project.tasks);

  return (
    <div className="relative block bg-card rounded-2xl p-5 border border-border shadow-card hover:border-accent/30 transition-colors">
      
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
            style={{ backgroundColor: `${project.color}20`, border: `1px solid ${project.color}50` }}
          >
            {project.emoji || '📁'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text1 leading-tight">{project.title}</h3>
            <span className="text-xs text-text3 font-medium">{project.tasks.length} Tasks</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onTogglePin && (
            <button 
              onClick={() => onTogglePin(project.id, !project.pinned)}
              className={`p-2 rounded-lg transition-colors ${project.pinned ? 'text-accent bg-accent/10' : 'text-text3 hover:text-text2 hover:bg-surface'}`}
            >
              <Pin size={16} className={project.pinned ? 'fill-accent' : ''} />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 flex items-end justify-between mt-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text2 font-medium">Progress</span>
          <div className="w-32 h-2 bg-surface rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%`, backgroundColor: project.color }}
            />
          </div>
        </div>
        <ProgressRing progress={progress} size={40} strokeWidth={3} color={project.color} />
      </div>
      
      {project.deadline && (
        <div className="relative z-10 flex items-center gap-1.5 mt-4 text-xs text-text3 font-medium">
          <Calendar size={14} />
          <span>Due {format(new Date(project.deadline), 'MMM d, yyyy')}</span>
        </div>
      )}

      <div className="mt-5 border-t border-border pt-4">
        <Link 
          href={`/projects/${project.id}`} 
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-surface border border-border hover:border-accent hover:text-accent text-sm font-bold text-text2 transition-colors"
        >
          Manage Project <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
