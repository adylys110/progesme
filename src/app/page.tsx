'use client';

import React, { useState, useMemo } from 'react';
import { useStorage } from '@/context/StorageContext';
import { StatsCard } from '@/components/StatsCard';
import { ProjectCard } from '@/components/ProjectCard';
import { ActivityCard } from '@/components/ActivityCard';
import { TaskItem } from '@/components/TaskItem';
import { FolderKanban, CheckSquare, Activity as ActivityIcon, TrendingUp, Plus, Target, Flame } from 'lucide-react';
import { sortItems } from '@/utils/storage';
import { AddModal } from '@/components/AddModal';
import { isToday, isPast, subDays, format } from 'date-fns';
import { AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { data, updateProject, updateActivity, addProject, addActivity, updateTask, deleteTask } = useStorage();
  const [modalType, setModalType] = useState<'project' | 'activity' | null>(null);

  // Stats calculation
  const totalProjects = data.projects.length;
  const totalActivities = data.activities.length;
  
  const allTasks = useMemo(() => [
    ...data.projects.flatMap(p => p.tasks.map(t => ({ ...t, parentId: p.id, parentType: 'project' as const, parentName: p.title }))),
    ...data.activities.flatMap(a => a.tasks.map(t => ({ ...t, parentId: a.id, parentType: 'activity' as const, parentName: a.title })))
  ], [data]);

  const completedTasks = allTasks.filter(t => t.completed).length;
  const taskProgress = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

  // Focus tasks (Due today or overdue, not completed)
  const focusTasks = allTasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    const date = new Date(t.dueDate);
    return isToday(date) || isPast(date);
  }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  // Heatmap calculation (last 7 days completions)
  const heatmapData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = d.toISOString().split('T')[0];
      // Count tasks completed on this day (from completionHistory)
      const count = allTasks.reduce((acc, t) => {
        const historyCount = t.completionHistory?.filter(h => h.startsWith(dateStr)).length || 0;
        return acc + historyCount;
      }, 0);
      days.push({ date: d, count });
    }
    return days;
  }, [allTasks]);

  // Pinned items
  const pinnedProjects = sortItems(data.projects.filter(p => p.pinned), 'date');
  const pinnedActivities = sortItems(data.activities.filter(a => a.pinned), 'date');

  return (
    <div className="min-h-screen pb-24 pt-safe animate-fade-up">
      <header className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-text1">Dasbor</h1>
        <p className="text-sm text-text3 mt-1">Selamat datang kembali! Berikut ringkasan Anda.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-6">
        <StatsCard title="Proyek" value={totalProjects} icon={FolderKanban} color="var(--accent)" />
        <StatsCard title="Aktivitas" value={totalActivities} icon={ActivityIcon} color="var(--accent-2)" />
        <StatsCard title="Selesai" value={completedTasks} icon={CheckSquare} color="var(--accent-amber)" />
        <StatsCard title="Total Progres" value={`${taskProgress}%`} icon={TrendingUp} color="var(--accent-red)" />
      </div>

      {/* Quick Add Buttons */}
      <div className="px-6 flex gap-4 mb-8">
        <button 
          onClick={() => setModalType('project')}
          className="flex-1 bg-surface border border-border rounded-xl py-3 flex items-center justify-center gap-2 text-text1 font-bold shadow-sm hover:border-accent transition-colors"
        >
          <Plus size={18} /> Proyek Baru
        </button>
        <button 
          onClick={() => setModalType('activity')}
          className="flex-1 bg-surface border border-border rounded-xl py-3 flex items-center justify-center gap-2 text-text1 font-bold shadow-sm hover:border-accent-2 transition-colors"
        >
          <Plus size={18} /> Aktivitas Baru
        </button>
      </div>

      {/* Consistency Heatmap */}
      <section className="px-6 mb-8">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-text2 uppercase flex items-center gap-1"><Flame size={14} className="text-accent-amber"/> Konsistensi (7 Hari)</h2>
          </div>
          <div className="flex gap-2 justify-between">
            {heatmapData.map((day, i) => {
              const intensity = day.count === 0 ? 'bg-surface border-border' : day.count < 3 ? 'bg-accent/40 border-accent/50' : 'bg-accent border-accent';
              return (
                <div key={i} className="flex flex-col items-center gap-1" title={`${day.count} selesai`}>
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold ${intensity} ${day.count > 0 ? 'text-white' : 'text-text3'}`}>
                    {day.count > 0 ? day.count : ''}
                  </div>
                  <span className="text-[10px] text-text3 font-medium">{format(day.date, 'EEEEE')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Today's Focus */}
      {focusTasks.length > 0 && (
        <section className="px-6 mb-8">
          <h2 className="text-lg font-bold text-text1 mb-4 flex items-center gap-2"><Target size={20} className="text-accent-red" /> Fokus Hari Ini</h2>
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {focusTasks.map(task => (
                <div key={task.id} className="relative">
                  <span className="absolute -top-2 left-4 bg-surface text-[10px] font-bold text-text2 px-2 rounded-full border border-border z-10">{task.parentName}</span>
                  <TaskItem
                    task={task as any}
                    onToggle={(taskId, completed) => updateTask(task.parentId, task.parentType, taskId, { completed, status: completed ? 'done' : 'todo' })}
                    onDelete={(taskId) => deleteTask(task.parentId, task.parentType, taskId)}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Pinned Projects */}
      {pinnedProjects.length > 0 && (
        <section className="px-6 mb-8">
          <h2 className="text-lg font-bold text-text1 mb-4">Proyek Disematkan</h2>
          <div className="flex flex-col gap-4">
            {pinnedProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onTogglePin={(id, pinned) => updateProject(id, { pinned })}
              />
            ))}
          </div>
        </section>
      )}

      {/* Pinned Activities */}
      {pinnedActivities.length > 0 && (
        <section className="px-6 mb-8">
          <h2 className="text-lg font-bold text-text1 mb-4">Aktivitas Disematkan</h2>
          <div className="flex flex-col gap-4">
            {pinnedActivities.map(activity => (
              <ActivityCard 
                key={activity.id} 
                activity={activity} 
                onTogglePin={(id, pinned) => updateActivity(id, { pinned })}
              />
            ))}
          </div>
        </section>
      )}

      <AddModal 
        isOpen={modalType !== null} 
        onClose={() => setModalType(null)} 
        type={modalType || 'project'} 
        onSubmit={(data) => {
          if (modalType === 'project') addProject(data);
          else if (modalType === 'activity') addActivity(data);
        }} 
      />
    </div>
  );
}
