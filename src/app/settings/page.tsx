'use client';

import React, { useRef, useState } from 'react';
import { useStorage } from '@/context/StorageContext';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun, Download, Upload, Trash2, Palette, Type, ShieldAlert } from 'lucide-react';
import { sortItems } from '@/utils/storage';

export default function SettingsPage() {
  const { data, updateSettings, importData } = useStorage();
  const { toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progesme-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const success = importData(event.target?.result as string);
        setImportStatus(success ? 'success' : 'error');
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearData = () => {
    if (confirm('DANGER: This will delete ALL your projects, activities, and tasks. Are you absolutely sure?')) {
      if (confirm('Are you REALLY sure? This cannot be undone.')) {
        localStorage.removeItem('progesme_data');
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-safe animate-fade-up">
      <header className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-text1">Settings</h1>
        <p className="text-sm text-text3 mt-1">Customize your experience and manage data.</p>
      </header>

      <div className="px-6 space-y-6 mt-4">
        
        {/* Appearance */}
        <section>
          <h2 className="text-sm font-bold text-text2 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Palette size={16} /> Appearance
          </h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div>
                <div className="font-medium text-text1">Theme</div>
                <div className="text-xs text-text3">Toggle dark or light mode</div>
              </div>
              <button 
                onClick={toggleTheme}
                className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center border border-border hover:border-accent transition-colors text-text1"
              >
                {data.settings.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>

            <div className="p-4 flex items-center justify-between border-b border-border">
              <div>
                <div className="font-medium text-text1">Accent Color</div>
                <div className="text-xs text-text3">Choose your primary color</div>
              </div>
              <input 
                type="color" 
                value={data.settings.accentColor}
                onChange={(e) => updateSettings({ accentColor: e.target.value })}
                className="w-12 h-12 rounded-xl cursor-pointer border-0 p-1 bg-surface"
              />
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div>
                <div className="font-medium text-text1 flex items-center gap-2"><Type size={16}/> Font Size</div>
                <div className="text-xs text-text3">Adjust the global text size</div>
              </div>
              <div className="flex gap-2">
                {['small', 'medium', 'large'].map(size => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ fontSize: size as any })}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${data.settings.fontSize === size ? 'bg-accent text-white' : 'bg-surface text-text2 border border-border hover:border-accent/50'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Data Management */}
        <section>
          <h2 className="text-sm font-bold text-text2 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldAlert size={16} /> Data Management
          </h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            
            <button 
              onClick={handleExport}
              className="w-full p-4 flex items-center justify-between border-b border-border hover:bg-surface transition-colors text-left"
            >
              <div>
                <div className="font-medium text-text1">Export Backup</div>
                <div className="text-xs text-text3">Save all your data to a JSON file</div>
              </div>
              <Download size={20} className="text-accent" />
            </button>

            <label className="w-full p-4 flex items-center justify-between border-b border-border hover:bg-surface transition-colors cursor-pointer">
              <div>
                <div className="font-medium text-text1">Import Backup</div>
                <div className="text-xs text-text3">
                  {importStatus === 'success' ? <span className="text-accent-2">Import successful!</span> : 
                   importStatus === 'error' ? <span className="text-accent-red">Import failed. Invalid file.</span> : 
                   'Restore data from a JSON file'}
                </div>
              </div>
              <Upload size={20} className="text-accent" />
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImport}
              />
            </label>

            <button 
              onClick={handleClearData}
              className="w-full p-4 flex items-center justify-between hover:bg-accent-red/10 transition-colors text-left group"
            >
              <div>
                <div className="font-medium text-accent-red">Clear All Data</div>
                <div className="text-xs text-accent-red/70">Permanently delete everything</div>
              </div>
              <Trash2 size={20} className="text-accent-red opacity-50 group-hover:opacity-100" />
            </button>

          </div>
        </section>

      </div>
    </div>
  );
}
