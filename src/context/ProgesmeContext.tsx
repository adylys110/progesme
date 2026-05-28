'use client'
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { AppData, Project, Activity, Task, AppSettings } from '@/types'
import { loadData, saveData, newId, DEFAULT_SETTINGS } from '@/utils/storage'

interface ProgesmeCtx {
  data: AppData
  addProject: (p: Omit<Project,'id'|'createdAt'|'updatedAt'|'tasks'>) => void
  updateProject: (id: string, p: Partial<Project>) => void
  deleteProject: (id: string) => void
  addActivity: (a: Omit<Activity,'id'|'createdAt'|'updatedAt'|'tasks'>) => void
  updateActivity: (id: string, a: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  addTask: (type:'project'|'activity', parentId: string, task: Omit<Task,'id'|'createdAt'|'order'>) => void
  updateTask: (type:'project'|'activity', parentId: string, taskId: string, t: Partial<Task>) => void
  deleteTask: (type:'project'|'activity', parentId: string, taskId: string) => void
  reorderTasks: (type:'project'|'activity', parentId: string, tasks: Task[]) => void
  updateSettings: (s: Partial<AppSettings>) => void
  exportData: () => void
  importData: (json: string) => boolean
  clearAll: () => void
}

const Ctx = createContext<ProgesmeCtx | null>(null)

export function ProgesmeProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({ projects:[], activities:[], settings:DEFAULT_SETTINGS, lastUpdated:'' })

  useEffect(() => { setData(loadData()) }, [])

  const persist = useCallback((d: AppData) => { setData({...d}); saveData(d) }, [])

  const addProject = useCallback((p: Omit<Project,'id'|'createdAt'|'updatedAt'|'tasks'>) => {
    const now = new Date().toISOString()
    const d = loadData()
    d.projects.push({ ...p, id: newId(), tasks: [], createdAt: now, updatedAt: now })
    persist(d)
  }, [persist])

  const updateProject = useCallback((id: string, p: Partial<Project>) => {
    const d = loadData()
    d.projects = d.projects.map(x => x.id === id ? { ...x, ...p, updatedAt: new Date().toISOString() } : x)
    persist(d)
  }, [persist])

  const deleteProject = useCallback((id: string) => {
    const d = loadData(); d.projects = d.projects.filter(x => x.id !== id); persist(d)
  }, [persist])

  const addActivity = useCallback((a: Omit<Activity,'id'|'createdAt'|'updatedAt'|'tasks'>) => {
    const now = new Date().toISOString()
    const d = loadData()
    d.activities.push({ ...a, id: newId(), tasks: [], createdAt: now, updatedAt: now })
    persist(d)
  }, [persist])

  const updateActivity = useCallback((id: string, a: Partial<Activity>) => {
    const d = loadData()
    d.activities = d.activities.map(x => x.id === id ? { ...x, ...a, updatedAt: new Date().toISOString() } : x)
    persist(d)
  }, [persist])

  const deleteActivity = useCallback((id: string) => {
    const d = loadData(); d.activities = d.activities.filter(x => x.id !== id); persist(d)
  }, [persist])

  const getMutator = (type:'project'|'activity') => ({
    getList: (d: AppData) => type === 'project' ? d.projects : d.activities,
    setList: (d: AppData, list: (Project|Activity)[]) => { if(type==='project') d.projects=list as Project[]; else d.activities=list as Activity[] }
  })

  const addTask = useCallback((type:'project'|'activity', parentId: string, task: Omit<Task,'id'|'createdAt'|'order'>) => {
    const d = loadData(); const {getList,setList} = getMutator(type)
    const list = getList(d)
    const parent = list.find(x => x.id === parentId)
    if (!parent) return
    const order = parent.tasks.length
    parent.tasks.push({ ...task, id: newId(), createdAt: new Date().toISOString(), order });
    (parent as Project|Activity).updatedAt = new Date().toISOString()
    setList(d, list); persist(d)
  }, [persist])

  const updateTask = useCallback((type:'project'|'activity', parentId: string, taskId: string, t: Partial<Task>) => {
    const d = loadData(); const {getList,setList} = getMutator(type)
    const list = getList(d); const parent = list.find(x => x.id === parentId)
    if (!parent) return
    parent.tasks = parent.tasks.map(x => x.id === taskId ? {...x,...t} : x)
    ;(parent as Project|Activity).updatedAt = new Date().toISOString()
    setList(d, list); persist(d)
  }, [persist])

  const deleteTask = useCallback((type:'project'|'activity', parentId: string, taskId: string) => {
    const d = loadData(); const {getList,setList} = getMutator(type)
    const list = getList(d); const parent = list.find(x => x.id === parentId)
    if (!parent) return
    parent.tasks = parent.tasks.filter(x => x.id !== taskId)
    setList(d, list); persist(d)
  }, [persist])

  const reorderTasks = useCallback((type:'project'|'activity', parentId: string, tasks: Task[]) => {
    const d = loadData(); const {getList,setList} = getMutator(type)
    const list = getList(d); const parent = list.find(x => x.id === parentId)
    if (!parent) return
    parent.tasks = tasks.map((t,i) => ({...t,order:i}))
    setList(d, list); persist(d)
  }, [persist])

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    const d = loadData(); d.settings = {...d.settings,...s}; persist(d)
  }, [persist])

  const exportData = useCallback(() => {
    const d = loadData()
    const blob = new Blob([JSON.stringify(d,null,2)],{type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`progesme-${Date.now()}.json`; a.click()
  }, [])

  const importData = useCallback((json: string) => {
    try { const d = JSON.parse(json) as AppData; persist(d); return true } catch { return false }
  }, [persist])

  const clearAll = useCallback(() => {
    const d = loadData(); d.projects=[]; d.activities=[]; persist(d)
  }, [persist])

  return (
    <Ctx.Provider value={{ data,addProject,updateProject,deleteProject,addActivity,updateActivity,deleteActivity,addTask,updateTask,deleteTask,reorderTasks,updateSettings,exportData,importData,clearAll }}>
      {children}
    </Ctx.Provider>
  )
}

export const useProgesme = () => { const c = useContext(Ctx); if(!c) throw new Error('useProgesme outside provider'); return c }
