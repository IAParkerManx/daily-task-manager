import { useEffect, useState } from 'react'
import type { Priority, Status, Task, TaskInput } from '../types'

interface TaskFormProps {
  initial?: Task | null
  categories: string[]
  onSubmit: (input: TaskInput) => Promise<void>
  onCancel: () => void
}

const emptyForm: TaskInput = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  category: '',
  due_date: '',
}

export function TaskForm({ initial, categories, onSubmit, onCancel }: TaskFormProps) {
  const [form, setForm] = useState<TaskInput>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description,
        priority: initial.priority,
        status: initial.status,
        category: initial.category,
        due_date: initial.due_date ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        ...form,
        due_date: form.due_date ? form.due_date : null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{initial ? 'Edit task' : 'New task'}</h2>

      <label className="field">
        <span>Title</span>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="What needs to get done?"
          autoFocus
        />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Optional details"
          rows={3}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Priority</span>
          <select
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label className="field">
          <span>Status</span>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
          >
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Due date</span>
          <input
            type="date"
            value={form.due_date ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
          />
        </label>

        <label className="field">
          <span>Category</span>
          <input
            type="text"
            list="category-options"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="e.g. Work"
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  )
}
