'use client';

import React, { useState } from 'react';
import { useStorage } from '@/context/StorageContext';
import { ActivityCard } from '@/components/ActivityCard';
import { sortItems } from '@/utils/storage';
import { AddModal } from '@/components/AddModal';
import { Plus, Search, Activity } from 'lucide-react';

export default function ActivitiesPage() {
  const { data, addActivity, updateActivity } = useStorage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = data.activities.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const sortedActivities = sortItems(filteredActivities, data.settings.sortActivitiesBy);

  return (
    <div className="min-h-screen pb-24 pt-safe animate-fade-up">
      <header className="px-6 pt-6 pb-4 sticky top-0 bg-bg/80 backdrop-blur-xl z-30">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-text1">Activities</h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-10 h-10 bg-accent-2 text-bg rounded-xl flex items-center justify-center hover:bg-accent-2/90 transition-colors shadow-accent"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text3" />
          <input 
            type="text" 
            placeholder="Search activities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-text1 placeholder-text3 focus:outline-none focus:border-accent-2 transition-colors"
          />
        </div>
      </header>

      <div className="px-6 mt-4 flex flex-col gap-4">
        {sortedActivities.length === 0 ? (
          <div className="bg-surface/50 border border-border rounded-2xl p-8 text-center mt-8">
            <Activity size={48} className="mx-auto text-border mb-4" />
            <h3 className="text-text1 font-bold mb-2">No activities found</h3>
            <p className="text-sm text-text3">
              {searchQuery ? 'Try adjusting your search query.' : 'Create your first activity to get started.'}
            </p>
          </div>
        ) : (
          sortedActivities.map(activity => (
            <ActivityCard 
              key={activity.id} 
              activity={activity} 
              onTogglePin={(id, pinned) => updateActivity(id, { pinned })}
            />
          ))
        )}
      </div>

      <AddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        type="activity"
        onSubmit={addActivity}
      />
    </div>
  );
}
