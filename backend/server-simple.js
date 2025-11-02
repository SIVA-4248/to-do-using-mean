const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from Angular build
app.use(express.static(path.join(__dirname, '../frontend/dist/todo-frontend')));

// In-memory storage for now
let todos = [];
let nextId = 1;

// GET all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// POST new todo
app.post('/api/todos', (req, res) => {
  const todo = {
    _id: nextId++,
    title: req.body.title,
    completed: false,
    createdAt: new Date()
  };
  todos.push(todo);
  res.status(201).json(todo);
});

// PUT update todo
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t._id === id);
  if (todo) {
    Object.assign(todo, req.body);
    res.json(todo);
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(t => t._id !== id);
  res.status(204).send();
});

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/todo-frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});