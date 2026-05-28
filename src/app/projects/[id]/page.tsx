'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStorage } from '@/context/StorageContext';
import { TaskItem } from '@/components/TaskItem';
import { AddModal } from '@/components/AddModal';
import { ChevronLeft, Plus, MoreVertical, Trash2, Download } from 'lucide-react';
import { ProgressRing } from '@/components/ProgressRing';
import { calcProgress } from '@/utils/storage';
import { exportProjectReport } from '@/utils/exportExcel';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, updateProject, deleteProject, addTask, updateTask, deleteTask } = useStorage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [view, setView] = useState<'list' | 'kanban'>('list');

  const project = data.projects.find(p => p.id === params.id);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center animate-fade-up">
        <div>
          <h2 className="text-xl font-bold mb-2">Proyek Tidak Ditemukan</h2>
          <button onClick={() => router.push('/projects')} className="text-accent underline">Kembali ke Proyek</button>
        </div>
      </div>
    );
  }

  const progress = calcProgress(project.tasks);
  const sortedTasks = project.tasks.slice().sort((a, b) => {
    if (a.completed === b.completed) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return a.completed ? 1 : -1;
  });

  const handleDelete = () => {
    if (data.settings.confirmDelete && !confirm('Yakin ingin menghapus proyek ini?')) return;
    deleteProject(project.id);
    router.push('/projects');
  };

  const renderKanbanColumn = (status: 'todo' | 'in-progress' | 'done', title: string) => {
    const columnTasks = project.tasks.filter(t => (t.status || 'todo') === status);
    return (
      <div className="flex-1 min-w-[280px] bg-surface/30 rounded-2xl p-4 border border-border">
        <h3 className="font-bold text-text1 mb-4 flex items-center justify-between">
          {title} <span className="bg-card text-text3 text-xs px-2 py-1 rounded-full">{columnTasks.length}</span>
        </h3>
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {columnTasks.map(task => (
              <div key={task.id} className="relative group/kanban">
                <TaskItem
                  task={task}
                  onToggle={(taskId, completed) => updateTask(project.id, 'project', taskId, { completed, status: completed ? 'done' : 'todo' })}
                  onDelete={(taskId) => deleteTask(project.id, 'project', taskId)}
                />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/kanban:opacity-100 transition-opacity">
                  {status !== 'todo' && <button onClick={() => updateTask(project.id, 'project', task.id, { status: status === 'done' ? 'in-progress' : 'todo', completed: false })} className="p-1 bg-surface rounded text-xs text-text2">&larr;</button>}
                  {status !== 'done' && <button onClick={() => updateTask(project.id, 'project', task.id, { status: status === 'todo' ? 'in-progress' : 'done', completed: status === 'in-progress' })} className="p-1 bg-surface rounded text-xs text-text2">&rarr;</button>}
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 pt-safe animate-fade-up">
      <header className="px-6 pt-6 pb-4 sticky top-0 bg-bg/90 backdrop-blur-xl z-30 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-xl text-text2 hover:text-text1 transition-colors">
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportProjectReport(project)}
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
                    <Trash2 size={16} /> Hapus Proyek
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
            style={{ backgroundColor: `${project.color}20`, border: `1px solid ${project.color}50` }}
          >
            {project.emoji || '📁'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text1 leading-tight">{project.title}</h1>
            {project.description && <p className="text-sm text-text3 mt-1">{project.description}</p>}
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm mb-4">
          <div>
            <span className="text-xs text-text3 font-medium uppercase tracking-wider">Progres</span>
            <div className="text-xl font-bold text-text1 mt-0.5">{progress}%</div>
            <div className="text-xs text-text2 mt-1">{project.tasks.filter(t => t.completed).length} dari {project.tasks.length} tugas selesai</div>
          </div>
          <ProgressRing progress={progress} size={64} strokeWidth={6} color={project.color} />
        </div>

        <div className="flex gap-2 bg-surface p-1 rounded-xl w-fit border border-border">
          <button onClick={() => setView('list')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${view === 'list' ? 'bg-card shadow-sm text-text1' : 'text-text3 hover:text-text2'}`}>Daftar</button>
          <button onClick={() => setView('kanban')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${view === 'kanban' ? 'bg-card shadow-sm text-text1' : 'text-text3 hover:text-text2'}`}>Papan Kanban</button>
        </div>
      </div>

      <div className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-text1">Tugas</h2>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-bold text-accent hover:text-accent/80 transition-colors bg-accent/10 px-3 py-1.5 rounded-lg"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>

        {project.tasks.length === 0 ? (
          <div className="bg-surface/50 border border-border rounded-2xl p-8 text-center mt-4">
            <h3 className="text-text1 font-bold mb-2">Belum ada tugas</h3>
            <p className="text-sm text-text3 mb-4">Pecah proyek Anda menjadi tugas-tugas kecil.</p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold"
            >
              <Plus size={16} /> Buat Tugas
            </button>
          </div>
        ) : (
          view === 'list' ? (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {sortedTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={(taskId, completed) => updateTask(project.id, 'project', taskId, { completed, status: completed ? 'done' : 'todo' })}
                    onDelete={(taskId) => deleteTask(project.id, 'project', taskId)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
              {renderKanbanColumn('todo', 'Akan Dikerjakan')}
              {renderKanbanColumn('in-progress', 'Sedang Dikerjakan')}
              {renderKanbanColumn('done', 'Selesai')}
            </div>
          )
        )}
      </div>

      <AddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        type="task"
        onSubmit={(data) => addTask(project.id, 'project', data)}
      />
    </div>
  );
}
