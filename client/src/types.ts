export type Priority = 'low' | 'medium' | 'high'
export type Status = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  status: Status
  category: string
  due_date: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface TaskInput {
  title: string
  description?: string
  priority?: Priority
  status?: Status
  category?: string
  due_date?: string | null
}

export interface Stats {
  total: number
  done: number
  dueToday: number
  overdue: number
}

export type DueFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'none'
