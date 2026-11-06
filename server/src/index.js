import express from 'express';
import cors from 'cors';
import './db.js';
import { tasksRouter } from './routes/tasks.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/tasks', tasksRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Daily Task Manager API running on http://localhost:${PORT}`);
});
