'use client';

import React from 'react';
import { Task } from '@/types';
import { Check, Trash2, Edit3, Calendar, Repeat, Tag, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isPast, isToday } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const isDoneToday = task.completed || task.completionHistory?.some(h => h.startsWith(todayStr)) || false;

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'bg-accent-red/20 text-accent-red border-accent-red/30';
      case 'medium': return 'bg-accent-amber/20 text-accent-amber border-accent-amber/30';
      default: return 'bg-surface text-text3 border-border';
    }
  };

  const isOverdue = task.dueDate && !isDoneToday && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
  const subtasksCount = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group flex items-start gap-3 p-4 rounded-xl border transition-colors ${isDoneToday ? 'bg-surface/50 border-transparent' : 'bg-card border-border hover:border-accent/30 shadow-sm'}`}
    >
      <button 
        onClick={() => onToggle(task.id, !isDoneToday)}
        className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isDoneToday ? 'bg-accent border-accent text-white' : 'border-text3 hover:border-accent text-transparent'}`}
      >
        <Check size={14} />
      </button>
      
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-bold truncate transition-colors ${isDoneToday ? 'text-text3 line-through' : 'text-text1'}`}>
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-text3 line-clamp-2 mt-1">{task.description}</p>
        )}
        
        {/* Meta Info Row */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
          {task.dueDate && (
            <div className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-accent-red' : 'text-text3'}`}>
              <Calendar size={12} />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
          
          {task.recurrence && task.recurrence !== 'none' && (
            <div className="flex items-center gap-1 font-medium text-accent-2" title={`Recurs ${task.recurrence}`}>
              <Repeat size={12} />
              <span className="capitalize">{task.recurrence}</span>
            </div>
          )}
          
          {subtasksCount > 0 && (
            <div className={`flex items-center gap-1 font-medium ${completedSubtasks === subtasksCount ? 'text-accent' : 'text-text3'}`}>
              <ListTodo size={12} />
              <span>{completedSubtasks}/{subtasksCount}</span>
            </div>
          )}

          {task.tags?.map(tag => (
            <div key={tag} className="flex items-center gap-1 text-[10px] bg-surface border border-border px-1.5 py-0.5 rounded-md text-text2">
              <Tag size={10} /> {tag}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getPriorityColor()}`}>
          {task.priority}
        </span>
        
        <div className="flex items-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity gap-1 mt-auto">
          {onEdit && (
            <button onClick={() => onEdit(task.id)} className="p-1.5 text-text3 hover:text-accent bg-surface rounded-md">
              <Edit3 size={14} />
            </button>
          )}
          <button onClick={() => onDelete(task.id)} className="p-1.5 text-text3 hover:text-accent-red bg-surface rounded-md">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
