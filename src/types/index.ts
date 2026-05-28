export type Priority = 'low' | 'medium' | 'high'
export type Status = 'active' | 'completed' | 'paused' | 'archived'
export type Theme = 'dark' | 'light'
export type SortBy = 'name' | 'date' | 'progress' | 'deadline' | 'pinned'

export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  completionHistory?: string[] // For recurring tasks
  priority: Priority
  dueDate?: string
  createdAt: string
  order: number
  phase?: string
  tags?: string[]
  estimatedMinutes?: number
  actualMinutes?: number
  notes?: string
  subtasks?: SubTask[]
  status?: TaskStatus
  recurrence?: Recurrence
}

export interface Project {
  id: string
  title: string
  description?: string
  color: string
  emoji?: string
  tasks: Task[]
  createdAt: string
  updatedAt: string
  startDate?: string
  deadline?: string
  status: Status
  tags?: string[]
  pinned?: boolean
  targetHours?: number
}

export interface Activity {
  id: string
  title: string
  description?: string
  color: string
  emoji?: string
  tasks: Task[]
  createdAt: string
  updatedAt: string
  startDate?: string
  status: Status
  pinned?: boolean
  category?: string
}

export interface AppSettings {
  theme: Theme
  accentColor: string
  fontSize: 'small' | 'medium' | 'large'
  defaultView: 'dashboard' | 'projects' | 'activities'
  showCompletedTasks: boolean
  sortProjectsBy: SortBy
  sortActivitiesBy: SortBy
  compactMode: boolean
  showProgressRing: boolean
  confirmDelete: boolean
}

export interface AppData {
  projects: Project[]
  activities: Activity[]
  settings: AppSettings
  lastUpdated: string
}
