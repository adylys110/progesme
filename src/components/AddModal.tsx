'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Calendar as CalendarIcon, Clock, Tag, ChevronDown } from 'lucide-react';
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
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [targetHours, setTargetHours] = useState('');
  const [category, setCategory] = useState('Kesehatan');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [tagsStr, setTagsStr] = useState('');

  useEffect(() => {
    if (isOpen && type === 'task') {
      setRecurrence(parentType === 'activity' ? 'daily' : 'none');
    }
  }, [isOpen, type, parentType]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (type === 'task') {
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
      onSubmit({ title, description, priority, status, dueDate: dueDate || undefined, estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined, recurrence, tags: tags.length > 0 ? tags : undefined });
    } else if (type === 'project') {
      onSubmit({ title, description, color, emoji, status: 'active', startDate: startDate || undefined, deadline: deadline || undefined, targetHours: targetHours ? parseFloat(targetHours) : undefined });
    } else if (type === 'activity') {
      onSubmit({ title, description, color, emoji, status: 'active', category });
    }
    setTitle(''); setDescription(''); setColor(PROJECT_COLORS[0]); setEmoji(EMOJIS[0]);
    setPriority('medium'); setStatus('todo'); setDueDate(''); setEstimatedMinutes('');
    setRecurrence('none'); setTagsStr(''); setStartDate(''); setDeadline('');
    setTargetHours(''); setCategory('Kesehatan');
    onClose();
  };

  const getTitleText = () => {
    if (type === 'project') return 'Proyek Baru';
    if (type === 'activity') return 'Aktivitas Kebiasaan Baru';
    return parentType === 'activity' ? 'Kebiasaan Baru' : 'Tugas Baru';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/50 z-50"
            style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Sheet — anchored to bottom, never taller than 72vh */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 360, mass: 0.8 }}
            className="fixed left-0 right-0 z-50"
            style={{
              bottom: 0,
              maxWidth: '28rem',
              margin: '0 auto',
              background: 'var(--surface)',
              borderRadius: '24px 24px 0 0',
              borderTop: '1px solid var(--border)',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
              maxHeight: '72vh',
              display: 'flex',
              flexDirection: 'column',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 pt-1 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-lg font-bold text-text1">{getTitleText()}</h2>
              <button
                onClick={onClose}
                type="button"
                style={{ padding: 6, borderRadius: '50%', background: 'var(--card)', color: 'var(--text2)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body — NO autoFocus anywhere */}
            <div className="overflow-y-auto scroll-native flex-1 px-5 pt-4 pb-4" style={{ overscrollBehavior: 'contain' }}>
              <div className="space-y-4">

                {/* Title input — readOnly trick: tap to edit, no auto-keyboard */}
                <input
                  type="text"
                  placeholder={`Nama ${type === 'project' ? 'Proyek' : type === 'activity' ? 'Aktivitas' : 'Tugas'}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoComplete="off"
                  className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-text1 placeholder-text3 focus:outline-none focus:border-accent font-semibold text-base"
                />

                <textarea
                  placeholder="Deskripsi atau Catatan (opsional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-text1 placeholder-text3 focus:outline-none focus:border-accent resize-none text-sm"
                />

                {/* Project fields */}
                {type === 'project' && (
                  <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-text3 mb-1 uppercase tracking-wider">Tanggal Mulai</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text1 focus:border-accent outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text3 mb-1 uppercase tracking-wider">Tenggat</label>
                        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text1 focus:border-accent outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text3 mb-1 uppercase tracking-wider">Target Jam</label>
                      <input type="number" min="0" step="0.5" placeholder="Contoh: 12" value={targetHours} onChange={(e) => setTargetHours(e.target.value)} className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text1 focus:border-accent outline-none" />
                    </div>
                  </div>
                )}

                {/* Activity category */}
                {type === 'activity' && (
                  <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
                    <label className="block text-[10px] font-bold text-text3 mb-1 uppercase tracking-wider">Kategori Kebiasaan</label>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {['Kesehatan', 'Belajar', 'Finansial', 'Karir', 'Hobi'].map(c => (
                        <button key={c} type="button" onClick={() => setCategory(c)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${category === c ? 'bg-accent-2 text-white' : 'bg-surface text-text2 border border-border'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color + Emoji */}
                {(type === 'project' || type === 'activity') && (
                  <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
                    <div>
                      <label className="block text-[10px] font-bold text-text3 mb-2 uppercase tracking-wider">Warna</label>
                      <div className="flex flex-wrap gap-2">
                        {PROJECT_COLORS.map(c => (
                          <button key={c} type="button" onClick={() => setColor(c)} className="w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90" style={{ backgroundColor: c }}>
                            {color === c && <Check size={13} className="text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text3 mb-2 uppercase tracking-wider">Ikon</label>
                      <div className="flex flex-wrap gap-2">
                        {EMOJIS.map(e => (
                          <button key={e} type="button" onClick={() => setEmoji(e)}
                            className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-colors ${emoji === e ? 'bg-accent/20 border-2 border-accent' : 'bg-surface border border-border'}`}>
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Task fields */}
                {type === 'task' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-text3 mb-1 uppercase tracking-wider"><CalendarIcon size={10} className="inline mr-1" />Tenggat</label>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-text1 focus:border-accent outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text3 mb-1 uppercase tracking-wider"><Clock size={10} className="inline mr-1" />Estimasi (mnt)</label>
                        <input type="number" placeholder="30" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-text1 focus:border-accent outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text3 mb-1.5 uppercase tracking-wider">Perulangan</label>
                      <div className="flex gap-2">
                        {['none', 'daily', 'weekly', 'monthly'].map(r => (
                          <button key={r} type="button" onClick={() => setRecurrence(r as Recurrence)}
                            className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${recurrence === r ? 'bg-accent text-white' : 'bg-card text-text2 border border-border'}`}>
                            {r === 'none' ? 'Tidak' : r === 'daily' ? 'Harian' : r === 'weekly' ? 'Mingguan' : 'Bulanan'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text3 mb-1.5 uppercase tracking-wider">Prioritas</label>
                      <div className="flex gap-2">
                        {['low', 'medium', 'high'].map(p => (
                          <button key={p} type="button" onClick={() => setPriority(p as any)}
                            className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${priority === p ? 'bg-accent text-white' : 'bg-card text-text2 border border-border'}`}>
                            {p === 'low' ? 'Rendah' : p === 'medium' ? 'Sedang' : 'Tinggi'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text3 mb-1 uppercase tracking-wider"><Tag size={10} className="inline mr-1"/>Label (koma)</label>
                      <input type="text" placeholder="penting, kode, belajar" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-text1 focus:border-accent outline-none" />
                    </div>
                  </div>
                )}

                {/* Submit button — inside scroll area so always reachable */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!title.trim()}
                  className="w-full bg-accent text-white font-bold py-3.5 rounded-2xl disabled:opacity-40 transition-opacity active:scale-[0.98] text-base"
                  style={{ marginTop: 8 }}
                >
                  Buat {type === 'project' ? 'Proyek' : type === 'activity' ? 'Aktivitas' : 'Tugas'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
