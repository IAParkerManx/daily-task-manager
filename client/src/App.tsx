import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { api } from './api'
import { Sidebar } from './components/Sidebar'
import { TaskForm } from './components/TaskForm'
import { TaskItem } from './components/TaskItem'
import type { DueFilter, Stats, Task, TaskInput } from './types'

const emptyStats: Stats = { total: 0, done: 0, dueToday: 0, overdue: 0 }

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [stats, setStats] = useState<Stats>(emptyStats)
  const [dueFilter, setDueFilter] = useState<DueFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showCompleted, setShowCompleted] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const requestIdRef = useRef(0)

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current
    try {
      const [taskList, cats, statsData] = await Promise.all([
        api.listTasks({ due: dueFilter, category: categoryFilter || undefined }),
        api.listCategories(),
        api.getStats(),
      ])
      if (requestId !== requestIdRef.current) return // a newer request has since superseded this one
      setTasks(taskList)
      setCategories(cats)
      setStats(statsData)
      setError(null)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [dueFilter, categoryFilter])

  useEffect(() => {
    refresh()
  }, [refresh])

  const visibleTasks = useMemo(
    () => (showCompleted ? tasks : tasks.filter((t) => t.status !== 'done')),
    [tasks, showCompleted]
  )

  const openNewTaskForm = () => {
    setEditingTask(null)
    setFormOpen(true)
  }

  const openEditForm = (task: Task) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingTask(null)
  }

  const handleSubmit = async (input: TaskInput) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, input)
    } else {
      await api.createTask(input)
    }
    closeForm()
    await refresh()
  }

  const handleToggle = async (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t))
    )
    try {
      await api.toggleTask(id)
    } finally {
      refresh()
    }
  }

  const handleDelete = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    await api.deleteTask(id)
    refresh()
  }

  return (
    <div className="app-shell">
      <Sidebar
        stats={stats}
        dueFilter={dueFilter}
        onDueFilterChange={setDueFilter}
        categories={categories}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
      />

      <main className="main-content">
        <header className="content-header">
          <h2>
            {dueFilter === 'all' && 'All tasks'}
            {dueFilter === 'today' && 'Due today'}
            {dueFilter === 'upcoming' && 'Upcoming tasks'}
            {dueFilter === 'overdue' && 'Overdue tasks'}
            {dueFilter === 'none' && 'No due date'}
            {categoryFilter && ` · ${categoryFilter}`}
          </h2>
          <button className="btn primary" onClick={openNewTaskForm}>
            + New task
          </button>
        </header>

        {error && <p className="banner-error">{error}</p>}

        {loading ? (
          <p className="empty-state">Loading tasks…</p>
        ) : visibleTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks here. Enjoy the clear runway.</p>
            <button className="btn primary" onClick={openNewTaskForm}>
              + Add your first task
            </button>
          </div>
        ) : (
          <ul className="task-list">
            {visibleTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </main>

      {formOpen && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <TaskForm
              initial={editingTask}
              categories={categories}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
