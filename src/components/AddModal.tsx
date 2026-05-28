'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Calendar as CalendarIcon, Clock, Tag } from 'lucide-react';
import { PROJECT_COLORS, EMOJIS } from '@/utils/storage';
import { TaskStatus, Recurrence } from '@/types';

type ModalType = 'project' | 'activity' | 'task';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalType;
  parentType?: 'project' | 'activity';
  onSubmit: (data: any) => void;
}

export function AddModal({ isOpen, onClose, type, parentType, onSubmit }: AddModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Project/Activity specific
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [targetHours, setTargetHours] = useState('');
  const [category, setCategory] = useState('Kesehatan');

  // Task specific
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [tagsStr, setTagsStr] = useState('');

  // Default values based on parentType
  useEffect(() => {
    if (isOpen && type === 'task') {
      if (parentType === 'activity') {
        setRecurrence('daily'); // Default untuk habit
      } else {
        setRecurrence('none');
      }
    }
  }, [isOpen, type, parentType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (type === 'task') {
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
      onSubmit({ 
        title, 
        description, 
        priority, 
        status, 
        dueDate: dueDate || undefined,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        recurrence,
        tags: tags.length > 0 ? tags : undefined
      });
    } else if (type === 'project') {
      onSubmit({ 
        title, 
        description, 
        color, 
        emoji, 
        status: 'active',
        startDate: startDate || undefined,
        deadline: deadline || undefined,
        targetHours: targetHours ? parseFloat(targetHours) : undefined
      });
    } else if (type === 'activity') {
      onSubmit({ 
        title, 
        description, 
        color, 
        emoji, 
        status: 'active',
        category
      });
    }
    
    // Reset state
    setTitle('');
    setDescription('');
    setColor(PROJECT_COLORS[0]);
    setEmoji(EMOJIS[0]);
    setPriority('medium');
    setStatus('todo');
    setDueDate('');
    setEstimatedMinutes('');
    setRecurrence('none');
    setTagsStr('');
    setStartDate('');
    setDeadline('');
    setTargetHours('');
    setCategory('Kesehatan');
    onClose();
  };

  const getTitleText = () => {
    if (type === 'project') return 'Proyek Baru';
    if (type === 'activity') return 'Aktivitas Kebiasaan Baru';
    if (type === 'task') return parentType === 'activity' ? 'Kebiasaan Baru' : 'Tugas Baru';
    return '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="w-full max-w-lg rounded-[28px] border border-border bg-surface shadow-2xl max-h-[88vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border bg-surface/95 sticky top-0 z-10">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-text3">Tambah</p>
                  <h2 className="text-xl font-bold text-text1">{getTitleText()}</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-full bg-card text-text2 hover:text-text1 transition-colors" type="button" aria-label="Tutup modal">
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[calc(88vh-80px)] overflow-y-auto px-5 pb-5 pt-4">
                <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="text"
                  placeholder={`Nama ${type === 'project' ? 'Proyek' : type === 'activity' ? 'Aktivitas' : 'Tugas'}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl p-4 text-text1 placeholder-text3 focus:outline-none focus:border-accent font-bold"
                />
              </div>

              <div>
                <textarea
                  placeholder="Deskripsi atau Catatan (opsional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl p-4 text-text1 placeholder-text3 focus:outline-none focus:border-accent resize-none h-20 text-sm"
                />
              </div>

              {type === 'project' && (
                <div className="space-y-4 rounded-2xl border border-border bg-surface/60 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text2 mb-2 uppercase">Tanggal Mulai</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-card border border-border rounded-xl p-3 text-sm text-text1 focus:border-accent outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text2 mb-2 uppercase">Tenggat Waktu</label>
                      <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full bg-card border border-border rounded-xl p-3 text-sm text-text1 focus:border-accent outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text2 mb-2 uppercase">Target Jam</label>
                    <input type="number" min="0" step="0.5" placeholder="Contoh: 12" value={targetHours} onChange={(e) => setTargetHours(e.target.value)} className="w-full bg-card border border-border rounded-xl p-3 text-sm text-text1 focus:border-accent outline-none" />
                  </div>
                  <p className="text-xs text-text3">Ini adalah wadah proyek. Setelah dibuat, Anda bisa menambahkan tugas-tugas kecil di halaman detail proyek.</p>
                </div>
              )}

              {type === 'activity' && (
                <div className="space-y-4 rounded-2xl border border-border bg-surface/60 p-4">
                  <div>
                    <label className="block text-xs font-bold text-text2 mb-2 uppercase">Kategori Kebiasaan</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {['Kesehatan', 'Belajar', 'Finansial', 'Karir', 'Hobi'].map(c => (
                        <button key={c} type="button" onClick={() => setCategory(c)} className={`px-4 py-2 rounded-xl text-sm font-medium shrink-0 transition-colors ${category === c ? 'bg-accent-2 text-white shadow-md' : 'bg-card text-text2 border border-border'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-text3">Ini difokuskan untuk kebiasaan berulang: checklist harian, riwayat selesai, dan grafik konsistensi akan muncul di halaman aktivitas.</p>
                </div>
              )}

              {(type === 'project' || type === 'activity') && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-text2 mb-2 uppercase">Warna</label>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_COLORS.map(c => (
                        <button key={c} type="button" onClick={() => setColor(c)} className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ backgroundColor: c }}>
                          {color === c && <Check size={16} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-text2 mb-2 uppercase">Ikon</label>
                    <div className="flex flex-wrap gap-2">
                      {EMOJIS.map(e => (
                        <button key={e} type="button" onClick={() => setEmoji(e)} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-colors ${emoji === e ? 'bg-accent/20 border-2 border-accent' : 'bg-card border border-border'}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {type === 'task' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text2 mb-2 uppercase"><CalendarIcon size={12} className="inline mr-1" /> Tenggat Waktu</label>
                      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-card border border-border rounded-xl p-3 text-sm text-text1 focus:border-accent outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text2 mb-2 uppercase"><Clock size={12} className="inline mr-1" /> Estimasi (Menit)</label>
                      <input type="number" placeholder="misal: 30" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} className="w-full bg-card border border-border rounded-xl p-3 text-sm text-text1 focus:border-accent outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text2 mb-2 uppercase">Perulangan</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {['none', 'daily', 'weekly', 'monthly'].map(r => (
                        <button key={r} type="button" onClick={() => setRecurrence(r as Recurrence)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize shrink-0 transition-colors ${recurrence === r ? 'bg-accent text-white shadow-md' : 'bg-card text-text2 border border-border'}`}>
                          {r === 'none' ? 'Tidak Ada' : r === 'daily' ? 'Harian' : r === 'weekly' ? 'Mingguan' : 'Bulanan'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text2 mb-2 uppercase">Prioritas</label>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high'].map(p => (
                        <button key={p} type="button" onClick={() => setPriority(p as any)} className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${priority === p ? 'bg-accent text-white shadow-md' : 'bg-card text-text2 border border-border'}`}>
                          {p === 'low' ? 'Rendah' : p === 'medium' ? 'Sedang' : 'Tinggi'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text2 mb-2 uppercase"><Tag size={12} className="inline mr-1"/> Label (pisahkan koma)</label>
                    <input type="text" placeholder="misal: penting, kode, belajar" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} className="w-full bg-card border border-border rounded-xl p-3 text-sm text-text1 focus:border-accent outline-none" />
                  </div>
                </>
              )}

                  <button
                    type="submit"
                    disabled={!title.trim()}
                    className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-xl mt-4 disabled:opacity-50 transition-colors shadow-accent"
                  >
                    Buat
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
