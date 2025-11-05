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
  console.log('📋 GET /api/todos called');
  try {
    const todos = await Todo.find();
    console.log('📊 Found todos:', todos.length);
    res.json(todos);
  } catch (error) {
    console.log('❌ Error fetching todos:', error.message);
    res.json([]);
  }
});

// POST new todo
app.post('/api/todos', async (req, res) => {
  console.log('📝 POST /api/todos called with:', req.body);
  
  try {
    const todo = new Todo({ title: req.body.title });
    console.log('💾 Saving todo:', todo);
    await todo.save();
    console.log('✅ Todo saved successfully:', todo);
    res.status(201).json(todo);
  } catch (error) {
    console.log('❌ Error creating todo:', error.message);
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
      // Complete modern todo app with beautiful styling
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>📝 Modern Todo App</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 10px;
            }
            .container {
              max-width: 700px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
              width: calc(100% - 20px);
            }
            .header {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              color: white;
              text-align: center;
              padding: 30px 20px;
            }
            .header h1 {
              font-size: 2.5em;
              font-weight: 300;
              margin: 0;
            }
            .subtitle {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 1.1em;
            }
            .add-todo {
              display: flex;
              padding: 30px;
              gap: 15px;
              background: #f8f9fa;
            }
            .todo-input {
              flex: 1;
              padding: 15px 20px;
              border: 2px solid #e9ecef;
              border-radius: 50px;
              font-size: 16px;
              outline: none;
              transition: all 0.3s ease;
            }
            .todo-input:focus {
              border-color: #4facfe;
              box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
            }
            .add-btn {
              padding: 15px 30px;
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              color: white;
              border: none;
              border-radius: 50px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
            }
            .add-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
            }
            .stats {
              display: flex;
              justify-content: space-around;
              padding: 20px;
              background: #f8f9fa;
              border-top: 1px solid #e9ecef;
            }
            .stats span {
              font-weight: 600;
              color: #495057;
            }
            .total { color: #6f42c1; }
            .completed { color: #28a745; }
            .pending { color: #fd7e14; }
            .todo-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .todo-item {
              display: flex;
              align-items: center;
              padding: 20px;
              border-bottom: 1px solid #f1f3f4;
              transition: all 0.3s ease;
            }
            .todo-item:hover {
              background: #f8f9fa;
            }
            .todo-item.completed {
              opacity: 0.7;
              background: #f8f9fa;
            }
            .todo-content {
              display: flex;
              align-items: center;
              flex: 1;
              gap: 15px;
            }
            .todo-checkbox {
              width: 20px;
              height: 20px;
              cursor: pointer;
              accent-color: #4facfe;
            }
            .todo-text {
              flex: 1;
            }
            .todo-title {
              display: block;
              font-size: 16px;
              font-weight: 500;
              color: #212529;
              margin-bottom: 5px;
            }
            .todo-item.completed .todo-title {
              text-decoration: line-through;
              color: #6c757d;
            }
            .todo-date {
              color: #6c757d;
              font-size: 12px;
            }
            .todo-actions {
              display: flex;
              gap: 8px;
            }
            .edit-btn, .save-btn, .cancel-btn, .delete-btn {
              padding: 10px 15px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              transition: all 0.3s ease;
              min-width: 44px;
              min-height: 44px;
            }
            .edit-btn { background: #ffc107; color: white; }
            .save-btn { background: #28a745; color: white; }
            .cancel-btn { background: #6c757d; color: white; }
            .delete-btn { background: #dc3545; color: white; }
            .edit-btn:hover, .save-btn:hover, .cancel-btn:hover, .delete-btn:hover {
              transform: translateY(-1px);
              opacity: 0.9;
            }
            .empty-state {
              text-align: center;
              padding: 60px 20px;
              color: #6c757d;
              font-size: 18px;
            }
            .edit-input {
              flex: 1;
              padding: 10px 15px;
              border: 2px solid #4facfe;
              border-radius: 8px;
              font-size: 16px;
              outline: none;
            }
            @media (max-width: 768px) {
              .container { margin: 5px; width: calc(100% - 10px); border-radius: 15px; }
              .header { padding: 20px 15px; }
              .header h1 { font-size: 1.8em; }
              .add-todo { padding: 20px 15px; flex-direction: column; gap: 15px; }
              .todo-input, .add-btn { font-size: 16px; padding: 15px 20px; width: 100%; }
              .stats { flex-direction: column; gap: 8px; text-align: center; padding: 15px; }
              .todo-item { padding: 15px; flex-direction: column; align-items: flex-start; gap: 10px; }
              .todo-content { width: 100%; }
              .todo-actions { width: 100%; justify-content: center; gap: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 My To-Do List</h1>
              <p class="subtitle">Stay organized and productive</p>
            </div>
            
            <div class="add-todo">
              <input type="text" id="todoInput" placeholder="What needs to be done?" class="todo-input">
              <button onclick="addTodo()" class="add-btn">+ Add Task</button>
            </div>

            <div class="stats">
              <span class="total">Total: <span id="totalCount">0</span></span>
              <span class="completed">Completed: <span id="completedCount">0</span></span>
              <span class="pending">Pending: <span id="pendingCount">0</span></span>
            </div>

            <ul class="todo-list" id="todoList"></ul>
            
            <div id="emptyState" class="empty-state" style="display: none;">
              <p>🎉 No tasks yet! Add one above to get started.</p>
            </div>
          </div>

          <script>
            let todos = [];
            let editingId = null;

            async function loadTodos() {
              try {
                const response = await fetch('/api/todos');
                todos = await response.json();
                renderTodos();
                updateStats();
              } catch (error) {
                console.log('Error loading todos:', error);
              }
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
                updateStats();
              } catch (error) {
                console.log('Error adding todo:', error);
              }
            }

            async function toggleTodo(id) {
              const todo = todos.find(t => t._id === id);
              if (!todo) return;
              
              todo.completed = !todo.completed;
              try {
                await fetch('/api/todos/' + id, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(todo)
                });
                renderTodos();
                updateStats();
              } catch (error) {
                console.log('Error updating todo:', error);
              }
            }

            function startEdit(id) {
              editingId = id;
              renderTodos();
            }

            async function saveEdit(id) {
              const input = document.querySelector('.edit-input');
              const title = input.value.trim();
              if (!title) return;
              
              const todo = todos.find(t => t._id === id);
              todo.title = title;
              
              try {
                await fetch('/api/todos/' + id, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(todo)
                });
                editingId = null;
                renderTodos();
              } catch (error) {
                console.log('Error updating todo:', error);
              }
            }

            function cancelEdit() {
              editingId = null;
              renderTodos();
            }

            async function deleteTodo(id) {
              try {
                await fetch('/api/todos/' + id, { method: 'DELETE' });
                todos = todos.filter(t => t._id !== id);
                renderTodos();
                updateStats();
              } catch (error) {
                console.log('Error deleting todo:', error);
              }
            }

            function renderTodos() {
              const list = document.getElementById('todoList');
              const emptyState = document.getElementById('emptyState');
              
              if (todos.length === 0) {
                list.innerHTML = '';
                emptyState.style.display = 'block';
                return;
              }
              
              emptyState.style.display = 'none';
              list.innerHTML = todos.map(todo => {
                const date = new Date(todo.createdAt).toLocaleString();
                const isEditing = editingId === todo._id;
                
                return '<li class="todo-item' + (todo.completed ? ' completed' : '') + '">' +
                  '<div class="todo-content">' +
                    '<input type="checkbox" class="todo-checkbox" ' + (todo.completed ? 'checked' : '') + ' onchange="toggleTodo(\'' + todo._id + '\')"/>' +
                    (isEditing ? 
                      '<input type="text" class="edit-input" value="' + todo.title + '" onkeyup="if(event.key===\'Enter\')saveEdit(\'' + todo._id + '\'); if(event.key===\'Escape\')cancelEdit()"/>' :
                      '<div class="todo-text"><span class="todo-title">' + todo.title + '</span><small class="todo-date">' + date + '</small></div>'
                    ) +
                  '</div>' +
                  '<div class="todo-actions">' +
                    (isEditing ?
                      '<button class="save-btn" onclick="saveEdit(\'' + todo._id + '\')">✅</button>' +
                      '<button class="cancel-btn" onclick="cancelEdit()">❌</button>' :
                      '<button class="edit-btn" onclick="startEdit(\'' + todo._id + '\')">✏️</button>'
                    ) +
                    '<button class="delete-btn" onclick="deleteTodo(\'' + todo._id + '\')">🗑️</button>' +
                  '</div>' +
                '</li>';
              }).join('');
            }

            function updateStats() {
              const total = todos.length;
              const completed = todos.filter(t => t.completed).length;
              const pending = total - completed;
              
              document.getElementById('totalCount').textContent = total;
              document.getElementById('completedCount').textContent = completed;
              document.getElementById('pendingCount').textContent = pending;
            }

            document.getElementById('todoInput').addEventListener('keypress', function(e) {
              if (e.key === 'Enter') addTodo();
            });

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
});id #4facfe;
              border-radius: 8px;
              font-size: 16px;
              outline: none;
            }
            @media (max-width: 768px) {
              .container { margin: 5px; width: calc(100% - 10px); border-radius: 15px; }
              .header { padding: 20px 15px; }
              .header h1 { font-size: 1.8em; }
              .add-todo { padding: 20px 15px; flex-direction: column; gap: 15px; }
              .todo-input, .add-btn { font-size: 16px; padding: 15px 20px; width: 100%; }
              .stats { flex-direction: column; gap: 8px; text-align: center; padding: 15px; }
              .todo-item { padding: 15px; flex-direction: column; align-items: flex-start; gap: 10px; }
              .todo-content { width: 100%; }
              .todo-actions { width: 100%; justify-content: center; gap: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 My To-Do List</h1>
              <p class="subtitle">Stay organized and productive</p>
            </div>
            
            <div class="add-todo">
              <input type="text" id="todoInput" placeholder="What needs to be done?" class="todo-input">
              <button onclick="addTodo()" class="add-btn">+ Add Task</button>
            </div>

            <div class="stats">
              <span class="total">Total: <span id="totalCount">0</span></span>
              <span class="completed">Completed: <span id="completedCount">0</span></span>
              <span class="pending">Pending: <span id="pendingCount">0</span></span>
            </div>

            <ul class="todo-list" id="todoList"></ul>
            
            <div id="emptyState" class="empty-state" style="display: none;">
              <p>🎉 No tasks yet! Add one above to get started.</p>
            </div>
          </div>

          <script>
            let todos = [];
            let editingId = null;

            async function loadTodos() {
              try {
                const response = await fetch('/api/todos');
                todos = await response.json();
                renderTodos();
                updateStats();
              } catch (error) {
                console.log('Error loading todos:', error);
              }
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
                updateStats();
              } catch (error) {
                console.log('Error adding todo:', error);
              }
            }

            async function toggleTodo(id) {
              const todo = todos.find(t => t._id === id);
              if (!todo) return;
              
              todo.completed = !todo.completed;
              try {
                await fetch('/api/todos/' + id, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(todo)
                });
                renderTodos();
                updateStats();
              } catch (error) {
                console.log('Error updating todo:', error);
              }
            }

            function startEdit(id) {
              editingId = id;
              renderTodos();
            }

            async function saveEdit(id) {
              const input = document.querySelector('.edit-input');
              const title = input.value.trim();
              if (!title) return;
              
              const todo = todos.find(t => t._id === id);
              todo.title = title;
              
              try {
                await fetch('/api/todos/' + id, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(todo)
                });
                editingId = null;
                renderTodos();
              } catch (error) {
                console.log('Error updating todo:', error);
              }
            }

            function cancelEdit() {
              editingId = null;
              renderTodos();
            }

            async function deleteTodo(id) {
              try {
                await fetch('/api/todos/' + id, { method: 'DELETE' });
                todos = todos.filter(t => t._id !== id);
                renderTodos();
                updateStats();
              } catch (error) {
                console.log('Error deleting todo:', error);
              }
            }

            function renderTodos() {
              const list = document.getElementById('todoList');
              const emptyState = document.getElementById('emptyState');
              
              if (todos.length === 0) {
                list.innerHTML = '';
                emptyState.style.display = 'block';
                return;
              }
              
              emptyState.style.display = 'none';
              list.innerHTML = todos.map(todo => {
                const date = new Date(todo.createdAt).toLocaleString();
                const isEditing = editingId === todo._id;
                
                return '<li class="todo-item' + (todo.completed ? ' completed' : '') + '">' +
                  '<div class="todo-content">' +
                    '<input type="checkbox" class="todo-checkbox" ' + (todo.completed ? 'checked' : '') + ' onchange="toggleTodo(\'' + todo._id + '\')"/>' +
                    (isEditing ? 
                      '<input type="text" class="edit-input" value="' + todo.title + '" onkeyup="if(event.key===\'Enter\')saveEdit(\'' + todo._id + '\'); if(event.key===\'Escape\')cancelEdit()"/>' :
                      '<div class="todo-text"><span class="todo-title">' + todo.title + '</span><small class="todo-date">' + date + '</small></div>'
                    ) +
                  '</div>' +
                  '<div class="todo-actions">' +
                    (isEditing ?
                      '<button class="save-btn" onclick="saveEdit(\'' + todo._id + '\')">✅</button>' +
                      '<button class="cancel-btn" onclick="cancelEdit()">❌</button>' :
                      '<button class="edit-btn" onclick="startEdit(\'' + todo._id + '\')">✏️</button>'
                    ) +
                    '<button class="delete-btn" onclick="deleteTodo(\'' + todo._id + '\')">🗑️</button>' +
                  '</div>' +
                '</li>';
              }).join('');
            }

            function updateStats() {
              const total = todos.length;
              const completed = todos.filter(t => t.completed).length;
              const pending = total - completed;
              
              document.getElementById('totalCount').textContent = total;
              document.getElementById('completedCount').textContent = completed;
              document.getElementById('pendingCount').textContent = pending;
            }

            // Event listeners
            document.getElementById('todoInput').addEventListener('keypress', function(e) {
              if (e.key === 'Enter') addTodo();
            });

            // Load todos on page load
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