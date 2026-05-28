'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, Project, Activity, Task, AppSettings } from '@/types';
import { loadData, saveData, getDefaultData, newId } from '@/utils/storage';

interface StorageContextType {
  data: AppData;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  addTask: (parentId: string, parentType: 'project' | 'activity', task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (parentId: string, parentType: 'project' | 'activity', taskId: string, updates: Partial<Task>) => void;
  deleteTask: (parentId: string, parentType: 'project' | 'activity', taskId: string) => void;
  importData: (jsonData: string) => boolean;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(getDefaultData());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setData(loadData());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveData(data);
    }
  }, [data, isLoaded]);

  const updateData = (newData: AppData) => setData({ ...newData, lastUpdated: new Date().toISOString() });

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    updateData({ ...data, settings: { ...data.settings, ...newSettings } });
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => {
    const newProject: Project = {
      ...projectData,
      id: newId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [],
    };
    updateData({ ...data, projects: [newProject, ...data.projects] });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    updateData({
      ...data,
      projects: data.projects.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
    });
  };

  const deleteProject = (id: string) => {
    updateData({ ...data, projects: data.projects.filter(p => p.id !== id) });
  };

  const addActivity = (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: newId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [],
    };
    updateData({ ...data, activities: [newActivity, ...data.activities] });
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    updateData({
      ...data,
      activities: data.activities.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)
    });
  };

  const deleteActivity = (id: string) => {
    updateData({ ...data, activities: data.activities.filter(a => a.id !== id) });
  };

  const addTask = (parentId: string, parentType: 'project' | 'activity', taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: newId(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    
    if (parentType === 'project') {
      updateData({
        ...data,
        projects: data.projects.map(p => p.id === parentId ? { ...p, tasks: [...p.tasks, newTask], updatedAt: new Date().toISOString() } : p)
      });
    } else {
      updateData({
        ...data,
        activities: data.activities.map(a => a.id === parentId ? { ...a, tasks: [...a.tasks, newTask], updatedAt: new Date().toISOString() } : a)
      });
    }
  };

  const updateTask = (parentId: string, parentType: 'project' | 'activity', taskId: string, updates: Partial<Task>) => {
    const mapTasks = (tasks: Task[]) => tasks.map(t => {
      if (t.id === taskId) {
        let newT = { ...t, ...updates };
        
        // Handle recurrence completion
        if (updates.completed === true && t.recurrence && t.recurrence !== 'none') {
          const history = newT.completionHistory || [];
          history.push(new Date().toISOString());
          newT.completionHistory = history;
          newT.completed = false; // Reset for next occurrence
          
          if (newT.dueDate) {
            const date = new Date(newT.dueDate);
            if (t.recurrence === 'daily') date.setDate(date.getDate() + 1);
            else if (t.recurrence === 'weekly') date.setDate(date.getDate() + 7);
            else if (t.recurrence === 'monthly') date.setMonth(date.getMonth() + 1);
            else if (t.recurrence === 'yearly') date.setFullYear(date.getFullYear() + 1);
            newT.dueDate = date.toISOString().split('T')[0];
          }
        }
        return newT;
      }
      return t;
    });
    
    if (parentType === 'project') {
      updateData({
        ...data,
        projects: data.projects.map(p => p.id === parentId ? { ...p, tasks: mapTasks(p.tasks), updatedAt: new Date().toISOString() } : p)
      });
    } else {
      updateData({
        ...data,
        activities: data.activities.map(a => a.id === parentId ? { ...a, tasks: mapTasks(a.tasks), updatedAt: new Date().toISOString() } : a)
      });
    }
  };

  const deleteTask = (parentId: string, parentType: 'project' | 'activity', taskId: string) => {
    const filterTasks = (tasks: Task[]) => tasks.filter(t => t.id !== taskId);
    
    if (parentType === 'project') {
      updateData({
        ...data,
        projects: data.projects.map(p => p.id === parentId ? { ...p, tasks: filterTasks(p.tasks), updatedAt: new Date().toISOString() } : p)
      });
    } else {
      updateData({
        ...data,
        activities: data.activities.map(a => a.id === parentId ? { ...a, tasks: filterTasks(a.tasks), updatedAt: new Date().toISOString() } : a)
      });
    }
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData) as AppData;
      if (parsed.projects && parsed.activities && parsed.settings) {
        setData(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <StorageContext.Provider value={{
      data, updateSettings, addProject, updateProject, deleteProject,
      addActivity, updateActivity, deleteActivity, addTask, updateTask, deleteTask, importData
    }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}
