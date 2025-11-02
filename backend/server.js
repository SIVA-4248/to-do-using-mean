require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Todo = require('./models/Todo');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp';

console.log('🔍 Environment check:');
console.log('PORT:', PORT);
console.log('All MongoDB env vars:');
Object.keys(process.env).filter(key => key.includes('MONGO')).forEach(key => {
  console.log(`${key}:`, process.env[key] ? 'Set ✅' : 'Not set ❌');
});
console.log('MONGODB_URI:', MONGODB_URI ? 'Set ✅' : 'Not set ❌');
console.log('MongoDB URI (masked):', MONGODB_URI ? MONGODB_URI.replace(/:\/\/.*@/, '://***@') : 'None');

app.use(cors({
  origin: ['http://localhost:4200', 'https://your-app-name.netlify.app'],
  credentials: true
}));
app.use(bodyParser.json());

// Serve static files from Angular build
app.use(express.static(path.join(__dirname, '../frontend/dist/todo-frontend')));

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// GET all todos
app.get('/api/todos', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new todo
app.post('/api/todos', async (req, res) => {
  try {
    const todo = new Todo({ title: req.body.title });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/todo-frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});