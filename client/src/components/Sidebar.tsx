import type { DueFilter, Stats } from '../types'

interface SidebarProps {
  stats: Stats
  dueFilter: DueFilter
  onDueFilterChange: (filter: DueFilter) => void
  categories: string[]
  categoryFilter: string
  onCategoryFilterChange: (category: string) => void
  showCompleted: boolean
  onShowCompletedChange: (value: boolean) => void
}

const dueFilters: { key: DueFilter; label: string }[] = [
  { key: 'all', label: 'All tasks' },
  { key: 'today', label: 'Due today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'none', label: 'No due date' },
]

export function Sidebar({
  stats,
  dueFilter,
  onDueFilterChange,
  categories,
  categoryFilter,
  onCategoryFilterChange,
  showCompleted,
  onShowCompletedChange,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <h1>Daily Tasks</h1>
        <p>Stay on top of today</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.dueToday}</span>
          <span className="stat-label">Due today</span>
        </div>
        <div className="stat-card overdue">
          <span className="stat-value">{stats.overdue}</span>
          <span className="stat-label">Overdue</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.done}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      <nav className="filter-nav">
        <h2>Filter</h2>
        <ul>
          {dueFilters.map((f) => (
            <li key={f.key}>
              <button
                className={dueFilter === f.key ? 'active' : ''}
                onClick={() => onDueFilterChange(f.key)}
              >
                {f.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {categories.length > 0 && (
        <nav className="filter-nav">
          <h2>Category</h2>
          <ul>
            <li>
              <button className={categoryFilter === '' ? 'active' : ''} onClick={() => onCategoryFilterChange('')}>
                All categories
              </button>
            </li>
            {categories.map((c) => (
              <li key={c}>
                <button className={categoryFilter === c ? 'active' : ''} onClick={() => onCategoryFilterChange(c)}>
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <label className="toggle-row">
        <input
          type="checkbox"
          checked={showCompleted}
          onChange={(e) => onShowCompletedChange(e.target.checked)}
        />
        <span>Show completed tasks</span>
      </label>
    </aside>
  )
}
