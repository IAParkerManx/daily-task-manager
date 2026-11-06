import type { DueFilter, Stats, Task, TaskInput } from './types'

const BASE = '/api/tasks'

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error || `Request failed with status ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export interface TaskFilters {
  status?: string
  category?: string
  due?: DueFilter
}

export const api = {
  listTasks(filters: TaskFilters = {}): Promise<Task[]> {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.category) params.set('category', filters.category)
    if (filters.due && filters.due !== 'all') params.set('due', filters.due)
    const qs = params.toString()
    return fetch(`${BASE}${qs ? `?${qs}` : ''}`).then((r) => handle<Task[]>(r))
  },

  listCategories(): Promise<string[]> {
    return fetch(`${BASE}/categories`).then((r) => handle<string[]>(r))
  },

  getStats(): Promise<Stats> {
    return fetch(`${BASE}/stats`).then((r) => handle<Stats>(r))
  },

  createTask(input: TaskInput): Promise<Task> {
    return fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then((r) => handle<Task>(r))
  },

  updateTask(id: string, input: TaskInput): Promise<Task> {
    return fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then((r) => handle<Task>(r))
  },

  toggleTask(id: string): Promise<Task> {
    return fetch(`${BASE}/${id}/toggle`, { method: 'PATCH' }).then((r) => handle<Task>(r))
  },

  deleteTask(id: string): Promise<void> {
    return fetch(`${BASE}/${id}`, { method: 'DELETE' }).then((r) => handle<void>(r))
  },
}
