import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db.js';

export const tasksRouter = Router();

const nowIso = () => new Date().toISOString();

function serializeTask(row) {
  return row;
}

// GET /api/tasks?status=&category=&due=today|upcoming|overdue|none
tasksRouter.get('/', (req, res) => {
  const { status, category, due } = req.query;
  const clauses = [];
  const params = {};

  if (status) {
    clauses.push('status = @status');
    params.status = status;
  }
  if (category) {
    clauses.push('category = @category');
    params.category = category;
  }
  if (due === 'today') {
    clauses.push("due_date = @today");
    params.today = new Date().toISOString().slice(0, 10);
  } else if (due === 'overdue') {
    clauses.push("due_date < @today AND status != 'done'");
    params.today = new Date().toISOString().slice(0, 10);
  } else if (due === 'upcoming') {
    clauses.push("due_date > @today");
    params.today = new Date().toISOString().slice(0, 10);
  } else if (due === 'none') {
    clauses.push('due_date IS NULL');
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db
    .prepare(
      `SELECT * FROM tasks ${where} ORDER BY
        CASE status WHEN 'done' THEN 1 ELSE 0 END,
        CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
        due_date ASC,
        created_at DESC`
    )
    .all(params);

  res.json(rows.map(serializeTask));
});

tasksRouter.get('/categories', (req, res) => {
  const rows = db
    .prepare(
      `SELECT DISTINCT category FROM tasks WHERE category IS NOT NULL AND category != '' ORDER BY category ASC`
    )
    .all();
  res.json(rows.map((r) => r.category));
});

tasksRouter.get('/stats', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const total = db.prepare('SELECT COUNT(*) AS c FROM tasks').get().c;
  const done = db.prepare("SELECT COUNT(*) AS c FROM tasks WHERE status = 'done'").get().c;
  const dueToday = db.prepare('SELECT COUNT(*) AS c FROM tasks WHERE due_date = ?').get(today).c;
  const overdue = db
    .prepare("SELECT COUNT(*) AS c FROM tasks WHERE due_date < ? AND status != 'done'")
    .get(today).c;

  res.json({ total, done, dueToday, overdue });
});

tasksRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Task not found' });
  res.json(serializeTask(row));
});

tasksRouter.post('/', (req, res) => {
  const { title, description = '', priority = 'medium', category = '', due_date = null, status = 'todo' } =
    req.body ?? {};

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const id = nanoid();
  const timestamp = nowIso();

  db.prepare(
    `INSERT INTO tasks (id, title, description, priority, status, category, due_date, created_at, updated_at, completed_at)
     VALUES (@id, @title, @description, @priority, @status, @category, @due_date, @created_at, @updated_at, @completed_at)`
  ).run({
    id,
    title: title.trim(),
    description,
    priority,
    status,
    category,
    due_date,
    created_at: timestamp,
    updated_at: timestamp,
    completed_at: status === 'done' ? timestamp : null,
  });

  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.status(201).json(row);
});

tasksRouter.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const {
    title = existing.title,
    description = existing.description,
    priority = existing.priority,
    status = existing.status,
    category = existing.category,
    due_date = existing.due_date,
  } = req.body ?? {};

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const wasDone = existing.status === 'done';
  const isDone = status === 'done';
  const completed_at = isDone ? (wasDone ? existing.completed_at : nowIso()) : null;

  db.prepare(
    `UPDATE tasks SET title = @title, description = @description, priority = @priority,
     status = @status, category = @category, due_date = @due_date, updated_at = @updated_at,
     completed_at = @completed_at WHERE id = @id`
  ).run({
    id: req.params.id,
    title: title.trim(),
    description,
    priority,
    status,
    category,
    due_date,
    updated_at: nowIso(),
    completed_at,
  });

  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(row);
});

tasksRouter.patch('/:id/toggle', (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const nextStatus = existing.status === 'done' ? 'todo' : 'done';
  const completed_at = nextStatus === 'done' ? nowIso() : null;

  db.prepare(
    'UPDATE tasks SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?'
  ).run(nextStatus, completed_at, nowIso(), req.params.id);

  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(row);
});

tasksRouter.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Task not found' });
  res.status(204).send();
});
