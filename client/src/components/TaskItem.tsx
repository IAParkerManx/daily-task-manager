import { useState } from 'react'
import type { Task } from '../types'

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

function formatDueDate(dateStr: string | null): { label: string; className: string } {
  if (!dateStr) return { label: 'No due date', className: 'muted' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${dateStr}T00:00:00`)
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000)

  if (diffDays === 0) return { label: 'Today', className: 'due-today' }
  if (diffDays === 1) return { label: 'Tomorrow', className: 'due-upcoming' }
  if (diffDays < 0) return { label: `Overdue · ${due.toLocaleDateString()}`, className: 'due-overdue' }
  return { label: due.toLocaleDateString(), className: 'due-upcoming' }
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const isDone = task.status === 'done'
  const due = formatDueDate(task.due_date)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <li className={`task-item priority-${task.priority} ${isDone ? 'done' : ''}`}>
      <button
        className="checkbox"
        aria-label={isDone ? 'Mark as not done' : 'Mark as done'}
        onClick={() => onToggle(task.id)}
      >
        {isDone ? '✓' : ''}
      </button>

      <div className="task-body" onClick={() => onEdit(task)}>
        <div className="task-title-row">
          <span className="task-title">{task.title}</span>
          <span className={`badge priority-badge priority-${task.priority}`}>{task.priority}</span>
          {task.status === 'in_progress' && <span className="badge status-badge">In progress</span>}
        </div>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <span className={`due-date ${isDone ? 'muted' : due.className}`}>
            {isDone ? 'Completed' : due.label}
          </span>
          {task.category && <span className="category-tag">{task.category}</span>}
        </div>
      </div>

      {confirmingDelete ? (
        <div className="delete-confirm">
          <button className="icon-btn confirm-btn" aria-label="Confirm delete" onClick={() => onDelete(task.id)}>
            Delete
          </button>
          <button className="icon-btn" aria-label="Cancel delete" onClick={() => setConfirmingDelete(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button className="icon-btn delete-btn" aria-label="Delete task" onClick={() => setConfirmingDelete(true)}>
          ✕
        </button>
      )}
    </li>
  )
}
