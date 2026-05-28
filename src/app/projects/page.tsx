'use client';

import React, { useState } from 'react';
import { useStorage } from '@/context/StorageContext';
import { ProjectCard } from '@/components/ProjectCard';
import { sortItems } from '@/utils/storage';
import { AddModal } from '@/components/AddModal';
import { Plus, Search, FolderKanban } from 'lucide-react';

export default function ProjectsPage() {
  const { data, addProject, updateProject } = useStorage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = data.projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const sortedProjects = sortItems(filteredProjects, data.settings.sortProjectsBy);

  return (
    <div className="min-h-screen pb-24 pt-safe animate-fade-up">
      <header className="px-6 pt-6 pb-4 sticky top-0 bg-bg/80 backdrop-blur-xl z-30">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-text1">Projects</h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center hover:bg-accent/90 transition-colors shadow-accent"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text3" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-text1 placeholder-text3 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </header>

      <div className="px-6 mt-4 flex flex-col gap-4">
        {sortedProjects.length === 0 ? (
          <div className="bg-surface/50 border border-border rounded-2xl p-8 text-center mt-8">
            <FolderKanban size={48} className="mx-auto text-border mb-4" />
            <h3 className="text-text1 font-bold mb-2">No projects found</h3>
            <p className="text-sm text-text3">
              {searchQuery ? 'Try adjusting your search query.' : 'Create your first project to get started.'}
            </p>
          </div>
        ) : (
          sortedProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onTogglePin={(id, pinned) => updateProject(id, { pinned })}
            />
          ))
        )}
      </div>

      <AddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        type="project"
        onSubmit={addProject}
      />
    </div>
  );
}
