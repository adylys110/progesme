'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStorage } from '@/context/StorageContext';
import { TaskItem } from '@/components/TaskItem';
import { AddModal } from '@/components/AddModal';
import { ChevronLeft, Plus, MoreVertical, Trash2, Flame, Download } from 'lucide-react';
import { ProgressRing } from '@/components/ProgressRing';
import { calcProgress } from '@/utils/storage';
import { exportActivityReport } from '@/utils/exportExcel';
import { motion, AnimatePresence } from 'framer-motion';
import { isToday, isPast, subDays, format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, deleteActivity, addTask, updateTask, deleteTask } = useStorage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activity = data.activities.find(a => a.id === params.id);

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center animate-fade-up">
        <div>
          <h2 className="text-xl font-bold mb-2">Aktivitas Tidak Ditemukan</h2>
          <button onClick={() => router.push('/activities')} className="text-accent-2 underline">Kembali</button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (data.settings.confirmDelete && !confirm('Yakin ingin menghapus aktivitas ini?')) return;
    deleteActivity(activity.id);
    router.push('/activities');
  };

  // Habit tracking logic
  const todayStr = new Date().toISOString().split('T')[0];

  // "Belum Selesai Hari Ini": tasks that are not done today yet
  const pendingTasks = activity.tasks.filter(t => {
    const doneToday = t.completionHistory?.some(h => h.startsWith(todayStr));
    return !t.completed && !doneToday;
  });
  
  // "Selesai Hari Ini": tasks that are completed today via history or current status
  const completedTodayTasks = activity.tasks.filter(t => {
    const doneToday = t.completionHistory?.some(h => h.startsWith(todayStr));
    return doneToday || t.completed;
  });

  // Heatmap specific to this activity
  const heatmapData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = d.toISOString().split('T')[0];
      const count = activity.tasks.reduce((acc, t) => {
        const historyCount = t.completionHistory?.filter(h => h.startsWith(dateStr)).length || 0;
        return acc + historyCount;
      }, 0);
      days.push({ date: d, count });
    }
    return days;
  }, [activity.tasks]);

  const totalCompletions = activity.tasks.reduce((acc, t) => acc + (t.completionHistory?.length || 0), 0);

  return (
    <div className="min-h-screen pb-24 pt-safe animate-fade-up">
      <header className="px-6 pt-6 pb-4 sticky top-0 bg-bg/90 backdrop-blur-xl z-30 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-xl text-text2 hover:text-text1 transition-colors">
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportActivityReport(activity)}
            className="w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-xl text-text2 hover:text-text1 transition-colors"
            title="Download laporan Excel"
          >
            <Download size={18} />
          </button>
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-xl text-text2 hover:text-text1 transition-colors"
            >
              <MoreVertical size={20} />
            </button>
          
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} 
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-12 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <button onClick={handleDelete} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-accent-red hover:bg-bg transition-colors">
                    <Trash2 size={16} /> Hapus Aktivitas
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="px-6 mt-2 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
            style={{ backgroundColor: `${activity.color}20`, border: `1px solid ${activity.color}50` }}
          >
            {activity.emoji || '⚡'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-surface px-2 py-0.5 rounded-md text-text2">{activity.category || 'Aktivitas'}</span>
            </div>
            <h1 className="text-2xl font-bold text-text1 leading-tight">{activity.title}</h1>
            {activity.description && <p className="text-sm text-text3 mt-1">{activity.description}</p>}
          </div>
        </div>
        
        {/* Heatmap / Stats */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm mb-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-bold text-text2 uppercase flex items-center gap-1"><Flame size={14} className="text-accent-amber"/> Konsistensi (7 Hari)</h2>
              <p className="text-xs text-text3 mt-0.5">Total: {totalCompletions} kali dilakukan</p>
            </div>
          </div>
          <div className="flex gap-2 justify-between">
            {heatmapData.map((day, i) => {
              const intensity = day.count === 0 ? 'bg-surface border-border' : day.count < 2 ? 'bg-accent-2/40 border-accent-2/50' : 'bg-accent-2 border-accent-2';
              return (
                <div key={i} className="flex flex-col items-center gap-1" title={`${day.count} selesai`}>
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm font-bold ${intensity} ${day.count > 0 ? 'text-white' : 'text-text3'}`}>
                    {day.count > 0 ? day.count : ''}
                  </div>
                  <span className="text-[10px] text-text3 font-medium">{format(day.date, 'EEEEE', { locale: id })}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-text1">Daftar Kebiasaan</h2>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-bold text-accent-2 hover:text-accent-2/80 transition-colors bg-accent-2/10 px-3 py-1.5 rounded-lg"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>

        {activity.tasks.length === 0 ? (
          <div className="bg-surface/50 border border-border rounded-2xl p-8 text-center mt-4">
            <h3 className="text-text1 font-bold mb-2">Belum ada kebiasaan</h3>
            <p className="text-sm text-text3 mb-4">Tambahkan kebiasaan berulang untuk aktivitas ini.</p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-accent-2 text-bg px-4 py-2 rounded-xl text-sm font-bold"
            >
              <Plus size={16} /> Buat Kebiasaan
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Belum Selesai */}
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-text2 uppercase tracking-wider mb-3">Belum Selesai Hari Ini</h3>
                <div className="flex flex-col gap-3">
                  <AnimatePresence>
                    {pendingTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={(taskId, completed) => updateTask(activity.id, 'activity', taskId, { completed })}
                        onDelete={(taskId) => deleteTask(activity.id, 'activity', taskId)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Selesai Hari Ini */}
            {completedTodayTasks.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-accent-2 uppercase tracking-wider mb-3">Selesai Hari Ini 🎉</h3>
                <div className="flex flex-col gap-3 opacity-60">
                  <AnimatePresence>
                    {completedTodayTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={(taskId, completed) => updateTask(activity.id, 'activity', taskId, { completed })}
                        onDelete={(taskId) => deleteTask(activity.id, 'activity', taskId)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      <AddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        type="task"
        parentType="activity"
        onSubmit={(data) => addTask(activity.id, 'activity', data)}
      />
    </div>
  );
}
