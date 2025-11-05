require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Todo = require('./models/Todo');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URL || process.env.DATABASE_URL || 'mongodb://localhost:27017/todoapp';

console.log('🔍 Environment check:');
console.log('PORT:', PORT);
console.log('All MongoDB env vars:');
Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('DATABASE')).forEach(key => {
  console.log(`${key}:`, process.env[key] ? 'Set ✅' : 'Not set ❌');
});
console.log('MONGODB_URI:', MONGODB_URI ? 'Set ✅' : 'Not set ❌');
console.log('MongoDB URI (masked):', MONGODB_URI ? MONGODB_URI.replace(/:\/\/.*@/, '://***@') : 'None');

app.use(cors({
  origin: ['http://localhost:4200', 'https://to-do-using-mean.onrender.com'],
  credentials: true
}));
app.use(bodyParser.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Serve static files from Angular build
app.use(express.static(path.join(__dirname, '../frontend/dist/todo-frontend')));

// Also try alternative path
app.use(express.static(path.join(__dirname, '../frontend/dist')));

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
}).catch(err => {
  console.log('❌ Initial MongoDB connection failed:', err.message);
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
      return res.json([]);
    }
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    console.log('Error fetching todos:', error.message);
    res.json([]);
  }
});

// POST new todo
app.post('/api/todos', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const todo = new Todo({ title: req.body.title });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    console.log('Error creating todo:', error.message);
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
  const indexPath = path.join(__dirname, '../frontend/dist/todo-frontend/index.html');
  console.log('Serving index from:', indexPath);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.log('Error serving index:', err);
      // Fallback HTML with basic todo functionality
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Todo App</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .todo-input { width: 70%; padding: 10px; margin-right: 10px; }
            .add-btn { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
            .todo-item { padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
            .delete-btn { background: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>📝 Todo App</h1>
          <div>
            <input type="text" id="todoInput" placeholder="Add new todo..." class="todo-input">
            <button onclick="addTodo()" class="add-btn">Add</button>
          </div>
          <div id="todoList"></div>
          <script>
            let todos = [];
            async function loadTodos() {
              try {
                const response = await fetch('/api/todos');
                todos = await response.json();
                renderTodos();
              } catch (error) { console.log('Error loading todos'); }
            }
            async function addTodo() {
              const input = document.getElementById('todoInput');
              const title = input.value.trim();
              if (!title) return;
              try {
                const response = await fetch('/api/todos', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title })
                });
                const todo = await response.json();
                todos.push(todo);
                input.value = '';
                renderTodos();
              } catch (error) { console.log('Error adding todo'); }
            }
            async function deleteTodo(id) {
              try {
                await fetch('/api/todos/' + id, { method: 'DELETE' });
                todos = todos.filter(t => t._id != id);
                renderTodos();
              } catch (error) { console.log('Error deleting todo'); }
            }
            function renderTodos() {
              const list = document.getElementById('todoList');
              list.innerHTML = todos.map(todo => 
                '<div class="todo-item"><span>' + todo.title + '</span><button class="delete-btn" onclick="deleteTodo(\'' + todo._id + '\')">&times;</button></div>'
              ).join('');
            }
            loadTodos();
          </script>
        </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});