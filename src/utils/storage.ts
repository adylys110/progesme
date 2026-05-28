import { AppData, AppSettings, Project, Activity } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: '#7C6DFA',
  fontSize: 'medium',
  defaultView: 'dashboard',
  showCompletedTasks: true,
  sortProjectsBy: 'pinned',
  sortActivitiesBy: 'pinned',
  compactMode: false,
  showProgressRing: true,
  confirmDelete: true,
}

export const PROJECT_COLORS = [
  '#7C6DFA', '#3DD9B3', '#FF5E7D', '#F5A623', '#4FC3F7',
  '#AB7CF5', '#68D391', '#FC8181', '#F6AD55', '#63B3ED',
]

export const EMOJIS = ['📁','🚀','💡','🎯','⚡','🔥','🌟','💎','🛠️','📱','🎨','📊','🏆','🌈','⚙️']

export function loadData(): AppData {
  if (typeof window === 'undefined') return getDefaultData()
  try {
    const raw = localStorage.getItem('progesme_data')
    if (!raw) return getDefaultData()
    return JSON.parse(raw) as AppData
  } catch { return getDefaultData() }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return
  data.lastUpdated = new Date().toISOString()
  localStorage.setItem('progesme_data', JSON.stringify(data))
}

export function getDefaultData(): AppData {
  return { projects: [], activities: [], settings: DEFAULT_SETTINGS, lastUpdated: new Date().toISOString() }
}

export function calcProgress(tasks: { completed: boolean }[]): number {
  if (!tasks.length) return 0
  return Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
}

export function newId() { return uuidv4() }

export function sortItems<T extends { pinned?: boolean; title?: string; createdAt?: string; updatedAt?: string }>(
  items: T[], by: string
): T[] {
  return [...items].sort((a, b) => {
    if (by === 'pinned') {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.updatedAt || b.createdAt || '').getTime() - new Date(a.updatedAt || a.createdAt || '').getTime()
    }
    if (by === 'name') return (a.title || '').localeCompare(b.title || '')
    if (by === 'date') return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
    return 0
  })
}
